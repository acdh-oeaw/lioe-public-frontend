<template>
  <v-layout column>
    <v-flex>
      <v-card class="sticky-card" width="100%">  
        <v-row no-gutters>
          <v-col class="pa-0" cols="8">
            <v-text-field
              @click.stop=""
              v-if="searchItemType === 'fulltext'"
              autofocus
              flat
              label="Datenbank durchsuchen…"
              prepend-inner-icon="search"
              v-model="searchTerm"
              @input="debouncedSearchDatabase"
              @change="debouncedSearchDatabase"
              :loading="searching"
              hide-details
              solo
              clearable
            />
            <v-autocomplete
              v-if="searchItemType === 'collection'"
              autofocus
              flat
              label="Sammlungen suchen…"
              :search-input.sync="searchCollection"
              prepend-inner-icon="search"
              :loading="searching"
              :items="collectionSearchItems"
              item-text="text"
              :value="selectedCollections"
              @input="selectCollections"
              chips
              deletable-chips
              cache-items
              return-object
              hide-details
              multiple
              solo
              clearable
            ></v-autocomplete>
          </v-col>
          <v-col cols="2" class="pa-0">
            <v-select
              @click.stop=""
              class="divider-left"
              flat
              solo
              hide-details
              v-model="searchItemType"
              :items="[{text: 'Volltext', value: 'fulltext'}, { text: 'Sammlung', value: 'collection' }]"
            />
          </v-col>
          <v-col class="pr-2 pt-1 text-right">
            <v-dialog max-width="1000" color="#2b2735" scrollable>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" color="accent" icon text>
                  <v-icon>info</v-icon>
                </v-btn>
              </template>
              <v-card text class="fill-height pa-4">
                <v-card-text class="pa-0 fill-height">
                  <info-text
                    class="pt-4 white fill-height"
                    path="belegdatenbank/suchmoeglichkeiten-in-der-wboe-db/"
                  />
                </v-card-text>
              </v-card>
            </v-dialog>
            <v-tooltip color="ci" top>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon @click="showFilterOptions = !showFilterOptions">
                  <v-icon :color="showFilterOptions ? 'ci': undefined">
                    {{showFilterOptions ? 'mdi-cog' : 'mdi-cog-outline'}}
                  </v-icon>
                </v-btn>
              </template>
              <span>Such- und Darstellungsoptionen</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card>
      <v-row class="px-5" v-show="showFilterOptions === true">
        <v-col>
          <v-row>
            <v-col>
              <h4>Suchoptionen</h4>
            </v-col>
          </v-row>
          <v-switch label="Alle Spalten zeigen" v-model="extended" hide-details />
          <v-switch
            @change="onChangeQuery(searchTerm)"
            label="Fehlertolerante Suche (fuzzy search)"
            v-model="fuzziness"
            hide-details
          />
        </v-col>
        <v-col>
          <v-row>
            <v-col class="pl-0">
              <h4>Spalten durchsuchen</h4>
            </v-col>
            <v-col class="text-right">
              <v-btn
                v-if="areAllSearchColumsSelected"
                color="ci"
                @click="selectNoColumnsAndSearch"
                small
                text
                rounded
              >keine</v-btn>
              <v-btn
                v-else
                color="ci"
                @click="selectAllSearchColumnsAndSearch"
                small
                text
                rounded
              >alle</v-btn>
            </v-col>
          </v-row>
          <v-row>
            <template v-for="h in shownHeaders">
              <v-checkbox
                class="mr-3"
                :key="h.value"
                :label="h.text"
                hide-details
                @change="onChangeQuery(searchTerm)"
                v-model="h.inSearch"
                v-if="h.searchable"
              ></v-checkbox>
            </template>
          </v-row>
        </v-col>
      </v-row>

       <v-row no-gutters>
          <template v-for="h in shownHeaders">
           <v-chip
              v-bind:key="h.text"
              v-if="h.inSearch"
              class="ma-2"
              close
              color="#3b89a0"
              text-color="white"
              close-icon="mdi-close"
              @click:close="h.inSearch = false">
              {{h.text}}
              </v-chip>
          </template>
        </v-row>
    </v-flex>
    <fake-scrollbar
      for-element=".v-data-table__wrapper" />
    <v-flex>
      <v-data-table
        v-model="selected"
        dense
        show-select
        return-object
        :footer-props="footerProps"
        :options.sync="pagination"
        :server-items-length="totalItems"
        :headers="shownHeaders"
        fixed-header height="500px" 
        :loading="loading"
        :items="_items">
        <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
          <v-menu
            :disabled="h.infoUrl === undefined"
            :key="h.value"
            open-on-hover
            max-width="400"
            max-height="95vh"
            offset-y
            bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">{{h.text}}</span>
            </template>
            <v-card>
              <v-card-text>
                <info-text :path="h.infoUrl" />
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
        <template v-slot:footer>
          <div>
            <v-tooltip color="ci" top :disabled="mappableSelectionItems.length > 0">
              <template v-slot:activator="{ on }">
                <v-menu
                  v-on="on"
                  :nudge-top="4"
                  top
                  offset-y
                  open-on-hover
                  :disabled="mappableSelectionItems.length === 0"
                >
                  <template v-slot:activator="{ on: menu }">
                    <v-btn
                      @click="showSelectionOnMap"
                      :disabled="mappableSelectionItems.length === 0"
                      small
                      v-on="menu"
                      class="pl-3 pr-3"
                      rounded
                      depressed
                      color="primary">
                      auf Karte zeigen ({{ mappableSelectionItems.length }})
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item @click="selected = []">Auswahl leeren</v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <span>Wählen Sie zuvor Dokumente mit Ortsangaben aus</span>
            </v-tooltip>
            <v-menu top open-on-hover>
              <template v-slot:activator="{ on: secondMenu }">
                <v-btn
                  slot="activator"
                  v-on="secondMenu"
                  :disabled="items.length === 0"
                  small
                  text
                  class="pl-3 pr-3"
                  rounded
                  color="ci">
                  Export {{ selected.length > 0 ? `(${selected.length})` : ''}}
                </v-btn>
              </template>
              <v-list class="context-menu-list" dense>
                <v-subheader>
                  <v-icon class="mr-1" small>save_alt</v-icon> Export/Download
                </v-subheader>
                <v-list-item @click="saveXLSX">Microsoft Excel</v-list-item>
                <v-list-item @click="saveJSON">JSON</v-list-item>
                <v-list-item @click="saveCSV">CSV</v-list-item>
                <v-divider />
                <v-list-item :disabled="selected.length === 0" @click="selected = []">Auswahl leeren</v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
        <template v-slot:item="{item, index, isSelected}">
          <tr>
            <td>
              <v-checkbox :value="isSelected" @change="customSelect(item)"></v-checkbox>
            </td>
            <template v-for="header in shownHeaders">
              <td
                class="line-clamp"
                :key="`${header.value}_${index}`"
                v-if="extended || !header.extended"
              >
                <!-- <i v-if="header.text === 'Kontext'" > {{header.renderFnc(item)}} </i>
                <template v-if="header.renderFnc && header.text!== 'Kontext' ">{{ header.renderFnc(item) }}
                </template> -->

                <template v-if="header.renderFnc">
                  <template v-if="header.text === 'Lautung' || header.text === 'Kontext'"><i> {{ header.renderFnc(item)}} </i>
                  </template>
                  <template v-else> {{header.renderFnc(item)}} </template>
                  </template>

                <template v-else>{{ item[header.value] }}</template>
              </td>
            </template>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import InfoText from '@components/InfoText.vue'
import InfoBox from '@components/InfoBox.vue'
import {
  getDocuments,
  searchDocuments,
  getDocumentTotalCount,
  getDocumentsByCollection,
  searchCollections,
  getCollectionByIds
} from '../api'
import { geoStore } from '../store/geo'
import { regions } from '../regions'
import * as FileSaver from 'file-saver'
import * as xlsx from 'xlsx'
import * as _ from 'lodash'
import FakeScrollbar from '@components/FakeScrollbar.vue'

interface Places {
  Ort: string
  Bundesland: string
  Großregion: string
}

@Component({
  components: {
    InfoText,
    InfoBox,
    FakeScrollbar
  }
})
export default class Database extends Vue {
  @Prop() collection_ids: string | null
  @Prop() query: string | null
  @Prop() fields: string | null

  c = console
  geoStore = geoStore
  regions = regions
  items: any[] = []
  searchInFields: string | null
  searchTerm: string | null = null
  searchItemType = 'fulltext'
  searchCollection: string | null = null
  collectionSearchItems: any[] = []
  selectedCollections: any[] = []
  selected: any[] = []
  loading = false
  searching = false
  showFilterOptions = false
  pagination = {
    page: 1,
    itemsPerPage: 10,
    sortBy: [],
    sortDesc: [],
    multiSort: false
  }
  extended = false
  fuzziness = true
  totalItems = 100

  headers = [
    // tslint:disable-next-line:max-line-length
    {
      searchable: true,
      inSearch: true,
      show: false,
      text: 'ID',
      value: 'ID',
      infoUrl: 'wboe-artikel/dbheaderinfo-id/',
      extended: true
    },
    {
      searchable: true,
      inSearch: true,
      show: true,
      text: 'Lemma',
      infoUrl: 'wboe-artikel/dbheaderinfo-lemma/',
      renderFnc: (val: any) => (Array.isArray(val.HL) ? val.HL[0] : val.HL),
      value: 'HL'
    },
    {
      searchable: true,
      inSearch: true,
      show: false,
      text: 'Nebenl.',
      infoUrl: 'wboe-artikel/dbheaderinfo-nebenlemma',
      value: 'NL',
      renderFnc: (val: any) => (Array.isArray(val.NL) ? val.NL[0] : val.NL),
      extended: true
    },
    {
      searchable: false,
      inSearch: false,
      show: false,
      text: 'Lemma oS',
      infoUrl: 'wboe-artikel/dbheaderinfo-lemmaos/',
      renderFnc: (val: any) =>
        Array.isArray(val.HL) && val.HL.length > 1
          ? val.HL[1].replace('≈', '')
          : val.HL,
      sortable: false,
      value: 'HL2'
    },
    {
      searchable: true,
      inSearch: true,
      show: true,
      infoUrl: 'wboe-artikel/dbheaderinfo-wortart/',
      text: 'Wortart',
      value: 'POS'
    },
    {
      searchable: true,
      inSearch: true,
      show: false,
      text: 'Grammatik', 
      infoUrl: 'wboe-artikel/dbheaderinfo-grammatik/',
      renderFnc: this.renderGrammatikAngabe,
      value: 'BD/KT',
      extended: true

    },
    {
      searchable: true,
      inSearch: true,
      show: false,
      text: 'Fragenum.', 
      infoUrl: 'wboe-artikel/dbheaderinfo-fragenummer/',
      renderFnc: this.renderFragenummer,
      value: 'NR',
      extended: true
    },
    {
      searchable: false,
      inSearch: false,
      show: false,
      text: 'Frage', 
      infoUrl: 'wboe-artikel/dbheaderinfo-frage/',
      renderFnc: this.renderGefragterAusdruck, 
      value: 'NR2',
      sortable: false,
      extended: true
    },
    {
      searchable: true,
      inSearch: true,
      show: true,
      text: 'Lautung',
      infoUrl: 'wboe-artikel/dbheaderinfo-lautung/',
      renderFnc: this.renderLautung,
      sortable: false,
      value: 'LT1_teuthonista'
    },
    {
      searchable: true,
      inSearch: true,
      show: true,
      text: 'Bed./Laut.',
      renderFnc: this.renderBedeutung,
      infoUrl: 'wboe-artikel/dbheaderinfo-bedeutunglautung/',
      value: 'BD/LT*',  
      sortable: false     
    },
    {
      searchable: true,
      inSearch: true,
      show: false,
      text: 'Ort/Laut.',
      infoUrl: 'wboe-artikel/dbheaderinfo-ortlautung/',
      value: 'Ort/LT',
      sortable: false,
      extended: true
    },
    {
      searchable: true,
      inSearch: true,
      show: true,
      text: 'Kontext', // Belegsatz
      infoUrl: 'wboe-artikel/dbheaderinfo-kontext/',
      renderFnc: this.renderBelegsaetze,
      value: 'BD/KT1' //'belegsaetze' 
    },
    {
      searchable: true,
      inSearch: true,
      show: true,
      text: 'Bed./Kont.',  //Bedeutung/Belegsatz
      infoUrl: 'wboe-artikel/dbheaderinfo-bedeutungkontext',
      renderFnc: this.renderBedeutungBelegsaetze,
      value: 'BD/KT*'
    },
    {
      searchable: true,
      inSearch: true,
      show: false,
      text: 'Quelle',
      value: 'QU',
      infoUrl: 'wboe-artikel/dbheaderinfo-quelle/',
      extended: true
    },
    {
      searchable: true,
      inSearch: true,
      show: false,
      text: 'Bibliographische Angabe',
      value: 'BIBL',
      infoUrl: 'wboe-artikel/dbheaderinfo-bibliographischeangabe/',
      extended: true
    },
    {
      searchable: true,
      inSearch: true,
      show: true, 
      text: 'Sigle', 
      value: 'Sigle1',
      infoUrl: 'wboe-artikel/dbheaderinfo-sigle/',
      renderFnc: (val: any) => `${_(val.Sigle1).flatten().replace(/[›]?[L|K]T[\d]?/g, '')}` 
    },
    // { text: 'Belegsätze', value: 'BIBL' },
    // { text: 'Bedeutung', value: 'BD/KT*' },
    // { text: 'Kontext', value: 'BD/KT*' },
    // { text: 'FB-Nr.', value: 'Fragebogennummer' },
    // { text: 'Sigle1', value: 'Sigle1', renderFnc: renderSigle}
       {
      searchable: true,
      inSearch: true,
      show: true,
      text: 'Staat',
      infoUrl: 'wboe-artikel/dbheaderinfo-staat/',
      value: 'Sigle10',
      renderFnc: (val: any) => regions.generalMapStaat(`${_(val.Sigle1).flatten()}`)
    },
     {
      searchable: true,
      inSearch: true,
      show: true,
      text: 'Land',
      value: 'Bundesland1',
      infoUrl: 'wboe-artikel/dbheaderinfo-land/',
      renderFnc: (val: any) => regions.mapBundeslaender(_(val.Bundesland1).flatten().replace(/\d[A-Z]?[\.]?[\d]?/g, '').replace(/›LT[\d]?/g, '').replace(/ ,/g, ',')) 
    },
    {
      searchable: true,
      inSearch: true,
      show: true,
      text: 'Großr.',
      value: 'Großregion1',
      infoUrl: 'wboe-artikel/dbheaderinfo-grossregion/',
      renderFnc: (val: any) => regions.mapGrossreg(_(val.Großregion1).flatten().replace(/\d[A-Z]?[\.]\d/g,'').replace(/›LT[\d]?/g, '').replace(/ ,/g, ','))  
    },
    {
      searchable: true,
      inSearch: true,
      show: true,
      text: 'Kleinr.',
      value: 'Kleinregion1',
      infoUrl: 'wboe-artikel/dbheaderinfo-kleinregionen',
      renderFnc: (val: any) => regions.mapKleinreg(_(val.Kleinregion1).flatten().replace(/\d[A-Z]?[\.]\d[a-z]/g,'').replace(/›LT[\d]?/g, '').replace(/ ,/g, ',')) 
    },
    {
      searchable: true,
      inSearch: true,
      show: true,
      text: 'Gemeinde',
      value: 'Gemeinde1',
      infoUrl: 'wboe-artikel/dbheaderinfo-gemeinde/',
      renderFnc: (val: any) =>
        `${_(val.Gemeinde1).flatten().replace(/\d[A-Z]?[\.]\d[a-z]\d\d/g, '')}`
        // ${val.Ort ? ` ${val.Ort}` : ''}`
    }
  ]

  footerProps = {
    'items-per-page-text': 'Pro Seite',
    'items-per-page-options': [10, 25, 50, 100]
  }

  debouncedSearchDatabase = _.debounce(this.searchDatabase, 500)

  get areAllSearchColumsSelected() {
    // all columns are either selected, or not searchable
    return this.headers.every(
      h => h.inSearch === true || h.searchable === false
    )
  }

  selectAllSearchColumnsAndSearch() {
    // allow search in all columns that are searchable
    this.headers = this.headers.map(h => ({
      ...h,
      inSearch: h.searchable === true
    }))
    this.onChangeQuery(this.searchTerm)
  }

  selectNoColumnsAndSearch() {
    // allow search in no columns
    this.headers = this.headers.map(h => ({ ...h, inSearch: false }))
    this.onChangeQuery(this.searchTerm)
  }

  customSelect(item: any) {
    // console.debug(!this.selected.find(i => item.id === i.id), this.selected, item.id)
    if (this.selected.find(i => item.id === i.id)) {
      this.selected = this.selected.filter(i => i.id !== item.id)
    } else {
      this.selected.push(item)
    }
  }

  get shownHeaders() {
    return this.headers.filter((h: any) => h.show)
  }

  @Watch('fields', {immediate: true})
  onUpdateFields(newVal: string|null) {
    if (newVal !== null) {

      this.headers = this.headers.map(h => {
        if (newVal.split(",").includes(h.value)) {
          return { ...h, inSearch: true }
      } else {
        return { ...h, inSearch: false }
      }
    })
    }
  }

  @Watch('extended')
  onExtendedChanged(val: boolean) {
    this.headers.forEach((h: any) => {
      if (h.extended) {
        h.show = val
      }
    })
  }  

// the changed function - was before under the renderBedeutung function
  renderGrammatikAngabe(val: any) {
  const bd: string[] = []
    for (let i = 1; i < 10; i += 1) {
      const at = `GRAM/LT${i}`
      const b = val[`GRAM/LT${i}`]
      if (!b) {
        continue
      }
      bd.push(b)
      console.log(bd)
    }
    const bdnew: string[] = []
    for(let i = 0; i < bd.length; i+=1) {
        bdnew.push(bd[i][0])
    }

    return _(bdnew)
      .flatten()
//      .replace('≈', '')
  }

  renderFragenummer(val: any) {
    let nr = val['NR']
    if (!nr) {
      return ''
    }
    const replacer = (
      match: string,
      p1: string,
      p2: string,
      offset: any,
      what: any
    ) => {
      console.log(match, p1, p2, offset, what) 
      return match
    }
    const fragenummerRegex = /.* (\(.*\)){0,1}:/
    if (Array.isArray(nr)) {
      nr = nr.map(n => {
        const m = n.match(fragenummerRegex)
        return m ? m[0] : null
      })
    } else {
      const m = nr.match(fragenummerRegex)
      return m ? m[0] : ''
    }
    nr = nr.filter((n: any) => n)
    return _(nr).flatten()
  }

  renderGefragterAusdruck(val: any) {
    let nr = val['NR']
    if (!nr) {
      return ''
    }

    const fragenummerRegex = /.*(\(.*\)){0,1}:/
    if (Array.isArray(nr)) {
      nr = nr[0].replace(fragenummerRegex, '')
    } else {
      return nr.replace(fragenummerRegex, '')
    }
    return nr
  }

  renderBedeutung(val: any) {
    let lt = val['BD/LT*']
    if(!lt) {
      return ''
    }

    const regexSources = /[≈›|›|≈]?LT\d?/
    if (Array.isArray(lt)) {
      return lt[0].replace(regexSources, '')
    } else {
      return lt.replace(regexSources, '')
    }
    return lt


  }

  renderBedeutungBelegsaetze(val: any) {
    let kt = val['BD/KT*']
    if(!kt) {
      return ''
    }

    const regexSources = /›KT\d/
    if(Array.isArray(kt)) {
      var i;
      for(i = 0; i < kt.length; i++) {
        kt[i] = kt[i].replace(regexSources, '')
    } 
    return _(kt).flatten()//replace(regexSources, '')
  } else {
    return kt.replace(regexSources, '')
  }
}

  renderBelegsaetze(val: any) {
    const kts =  ['KT1', 'KT2', 'KT3', 'KT4', 'KT5', 'KT6', 'KT7', 'KT8']
    const res: string[] = []
    kts.forEach(t => {
      if (Array.isArray(val[t] && val[t].length > 0)) {
        res.push(val[t][0][0])
      } else if (val[t]) {
        res.push(val[t][0])
      }
    })
      return _(res).flatten()
  }

  renderLautung(val: any) {
    const tauts = [
      'LT1_teuthonista',
      'LT2_theutonista',
      'LT3_theutonista',
      'LT4_theutonista',
      'LT5_theutonista',
      'LT6_theutonista',
      'LT7_theutonista',
      'LT8_theutonista',
      'LT9_theutonista'
    ]

    const res: string[] = []
    tauts.forEach(t => {
      if (Array.isArray(val[t] && val[t].length > 0)) {
        res.push(val[t][0][0])
      } else if (val[t]) {
        res.push(val[t][0])
      }
    })
    return _(res).flatten()
  }

  async mounted() {
    if (this.collection_ids) {
      this.loadCollectionIds(this.collectionIdList)
    } else {
      this.init()
    }
  }

  get _items() {
    return this.items.filter(
      (i, index) => !!i && this.items.indexOf(i) === index
    )
  }

  @Watch('searchCollection')
  async onSearchCollection(val: string | null) {
    if (val !== null && val.trim() !== '') {
      this.collectionSearchItems = (await searchCollections(val)).map(x => ({
        ...x,
        text: x.name
      }))
    }
  }

  selectCollections(colls: any[]) {
    console.log(colls) 
    this.$router.replace({
      query: { collection_ids: colls.map(x => x.value).join() }
    })
  }

  get collectionIdList() {
    if (this.collection_ids) {
      return this.collection_ids.split(',')
    } else {
      return []
    }
  }

 

  getPlacesFromSigle(sigle: string): Places {
    const place = _(geoStore.ortsliste).find(o => o.sigle === sigle)
    if (place === undefined) {
      return {
        Ort: '',
        Großregion: '',
        Bundesland: ''
      }
    } else {
      const bl = _(place.parentsObj).find(o => o.field === 'Bundesland')
      const gr = _(place.parentsObj).find(o => o.field === 'Großregion')
      return {
        Ort: place.name,
        Großregion: gr ? gr.name : '',
        Bundesland: bl ? bl.name : '',
        [place.field]: place.name
      }
    }
  }

  get headerInSearch() {
    return this.shownHeaders
      .filter(h => h.searchable && h.inSearch)
      .map(h => h.value)
  }

  async init() {
    this.loading = true

    const countDocument = await getDocumentTotalCount()
    // console.log('lel', countDocument)
    this.totalItems = countDocument || 0
    const res = await getDocuments(
      this.pagination.page,
      this.pagination.itemsPerPage,
      this.pagination.sortBy,
      this.pagination.sortDesc
    )
    this.items = res.documents.map(d => ({
      ...d,
      ...this.getPlacesFromSigle(d.ortsSigle)
    }))
    this.loading = false
  }

  @Watch('collectionIdList')
  async loadCollectionIds(ids: string[]) {
    if (ids.length > 0) {
      this.searchItemType = 'collection'
      this.searching = true
      const res = await getDocumentsByCollection(ids, this.pagination.page)
      this.items = _(res.documents)
        .uniqBy(d => d.id)
        .map(d => ({ ...d, ...this.getPlacesFromSigle(d.ortsSigle) }))
        .value()
      // console.log({res})
      // console.log('950', res.total)
      this.totalItems = typeof res.total === 'number' ? res.total : 0
      const cs = await getCollectionByIds(ids)
      this.selectedCollections = cs.map(x => ({ ...x, text: x.name }))
      this.collectionSearchItems = cs.map(x => ({ ...x, text: x.name }))
      this.searching = false
    } else {
      this.selectedCollections = []
    }
  }

  @Watch('pagination', { deep: true })
  updateResults(newVal: any, oldVal: any) {
    if (newVal.page !== oldVal.page) {
      window.scroll({ top: 0, behavior: 'smooth' })
    }
    if (this.query) {
      this.onChangeQuery(this.query)
    } else if (this.collection_ids) {
      this.loadCollectionIds(this.collectionIdList)
    } else {
      this.init()
    }
  }

  get mappableSelectionItems() {
    return _(
      this._items.filter(
        (i, index) =>
          !!i &&
          this.selected.find(item => item.id === i.id) &&
          (i.Bundesland !== '' ||
            i.Bundesland1 !== '' ||
            i.Großregion !== '' ||
            i.Ort !== '')
      )
    ).value()
  }

  showSelectionOnMap() {
    if (this.selected.length > 0) {
      //  console.debug('what dis', this.mappableSelectionItems.map(d => d.ortsSigle).join(','))
      this.$router.push({
        path: '/maps',
        query: {
          loc: this.mappableSelectionItems.map(d => d.ortsSigle).join(',')
        }
      })
    }
  }

  @Watch('query', {immediate: true})
  async onChangeQuery(search: string | null) {
    if (search) {
      this.searching = true
      const res = await searchDocuments(
        search,
        this.pagination.page,
        this.pagination.itemsPerPage,
        this.pagination.sortDesc,
        this.pagination.sortBy,
        this.headerInSearch,
        this.fuzziness
      )
      this.items = res.documents.map(d => ({
        ...d,
        ...this.getPlacesFromSigle(d.ortsSigle)
      }))

      // console.log('fluss', res.total)
      this.totalItems = res.total.value || 0
      this.searching = false
    } else {
      this.init()
    }
  }

  async searchDatabase(search: string) {
    this.$router.replace({ query: { query: search } })
  }

  saveXLSX() {
    const x = xlsx.utils.json_to_sheet(this.selected || this.items)
    const y = xlsx.writeFile(
      {
        Sheets: { sheet: x },
        SheetNames: ['sheet']
      },
      'wboe-lioe-export.xlsx'
    )
  }

  saveCSV() {
    const x = xlsx.utils.json_to_sheet(this.selected || this.items)
    const y = xlsx.writeFile(
      {
        Sheets: { sheet: x },
        SheetNames: ['sheet']
      },
      'wboe-lioe-export.csv'
    )
  }

  saveJSON() {
    const blob = JSON.stringify(this.selected || this.items, undefined, 2)
    FileSaver.saveAs(new Blob([blob]), 'wboe-lioe-export.json')
  }
}
</script>
<style lang="scss">
th {
  padding-top: 1em !important;
  padding-bottom: 1em !important;
  white-space: nowrap;
}
div.v-data-footer {
  background: white;
  position: -webkit-sticky;
  position: sticky;
  bottom: 0;
}
</style>
