<template>
  <v-layout column>
    <v-flex>
      <v-card class="elevation-0">
        <v-layout class="mb-2">
          <v-flex xs12>
            <v-text-field
              v-if="searchItemType === 'fulltext'"
              autofocus
              text
              label="Datenbank durchsuchen…"
              prepend-inner-icon="search"
              v-model="searchTerm"
              @input="debouncedSearchDatabase"
              :loading="searching"
              hide-details
              solo
              clearable
            />
            <v-autocomplete
              v-if="searchItemType === 'collection'"
              autofocus
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
              clearable>
              <!--
              <template
                slot="item"
                slot-scope="data">
                <v-list-item-action>
                  <v-checkbox v-model="data.tile.props.value"></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title style="height: 19px;">{{ data.item.text }}</v-list-item-title>
                  <v-list-item-sub-title style="font-size: 85%;">{{ data.item.description }}</v-list-item-sub-title>
                </v-list-item-content>
              </template>-->
            </v-autocomplete>
          </v-flex>
          <v-flex align-content-center fill-height>
            <div>
              <v-select
                class="divider-left"
                text
                solo
                hide-details
                v-model="searchItemType"
                :items="[{text: 'Volltext', value: 'fulltext'}, { text: 'Sammlung', value: 'collection' }]" />
            </div>
          </v-flex>
          <v-flex>
            <v-dialog max-width="1000" color="#2b2735" scrollable>
               <template v-slot:activator="{ on }">
                  <v-btn v-on="on" color="accent" icon text>
                    <v-icon>info</v-icon>
                  </v-btn>
               </template>
                  <v-card text class="fill-height pa-4">
                    <v-card-text class="pa-0 fill-height">
                      <info-text class="pt-4 white fill-height" path="belegdatenbank/suchmoeglichkeiten-in-der-wboe-db/" />
                    </v-card-text>
                  </v-card>
            </v-dialog>
          </v-flex>
        </v-layout>
      </v-card>
      <InfoBox class="mt-2 mb-2">
        <h4 class="headline mb-0">Hinweis</h4>
        <div>Derzeit handelt es sich noch um eine vorläufige Version, in der noch nicht alle in der Datenbank vorhandenen Gemeinden und Regionen sowie Transkriptionszeichen zur Wiedergabe der Dialektlautung angezeigt werden können!</div>
      </InfoBox>
    </v-flex>
    <v-switch label="alles zeigen" v-model="extended"></v-switch>
    <v-flex>
      <v-data-table
        v-model="selected"
        show-select
        class="data-table"
        return-object
        :footer-props="footerProps"
        :options.sync="pagination"
        :server-items-length="totalItems"
        :headers="shownHeaders"
        :loading="loading"
        :items="_items">
        <template v-for="h of headers" :slot="`header.${h.name}`">test</template>

        <template slot="footer">
          <v-tooltip color="ci" top :disabled="mappableSelectionItems.length > 0">
            <template v-slot:activator="{ on }">
              <v-menu v-on="on" :nudge-top="4" top offset-y open-on-hover :disabled="mappableSelectionItems.length === 0" >
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
              <v-btn slot="activator" v-on="secondMenu" :disabled="items.length === 0" small text class="pl-3 pr-3" rounded color="ci">
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
        </template>

         <template v-slot:item="{item, index, isSelected, select}">
           <tr>
          <td>
            <v-checkbox :value="isSelected" @click="select(item)"></v-checkbox>
          </td>
          <template v-for="header in headers">
            <td class="line-clamp"  :key="`${header.value}_${index}`" v-if="extended || !header.extended">
              <template v-if="header.renderFnc">
                {{ header.renderFnc(item) }}                
              </template>
              <template v-else>
                {{ item[header.value] }}
              </template>
            </td>
          </template>
           </tr>
        </template>

        <!--
        <template v-slot:footer="{ pageText }" slot-scope="props">
          {{ props.pageStart }} - {{ props.pageStop }} von {{ props.itemsLength }}
        </template>
        -->
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
  getCollectionByIds } from '../api'
import { geoStore } from '../store/geo'
import * as FileSaver from 'file-saver'
import * as xlsx from 'xlsx'
import * as _ from 'lodash'
import { log } from 'util'

interface Places {
  Ort: string
  Bundesland: string
  Großregion: string
}

@Component({
  components: {
    InfoText,
    InfoBox
  }
})
export default class Database extends Vue {

  @Prop() collection_ids: string|null
  @Prop() query: string|null

  geoStore = geoStore
  items: any[] = []
  searchTerm: string|null = null
  searchItemType = 'fulltext'
  searchCollection: string|null = null
  collectionSearchItems: any[] = []
  selectedCollections: any[] = []
  selected: any[] = []
  loading = false
  searching = false
  pagination = {
    page: 1,
    itemsPerPage: 100,
    sortBy: [],
    sortDesc: [],
    multiSort: false,
  }
  extended = false;

  get shownHeaders() {
    return this.headers.filter((h:any) => h.show);
  }

  @Watch('extended')
  onExtendedChanged(val: boolean) {
    this.headers.forEach((h:any) => {
      if (h.extended)
        h.show = val;
    });
  }

  renderBedeutung(val:any) {
    const bd: string[] = [];
    for(let i = 1; i < 10; i += 1) {
      let at = `GRAM/LT${i}`
      let b = val[`GRAM/LT${i}`];
     // console.log('at', at, val);
      if(!b) continue;
      bd.push(b);
    }
    return _(bd).flatten().replace('≈', '');
  }

  renderFragenummer(val:any) {
    const replacer = (match:string, p1:string, p2:string, offset: any, what: any) => {
      console.log(match, p1, p2, offset, what);
      return match;
    }
    const fragenummerRegex = /.* (\(.*\)){0,1}:/;
    let nr = val['NR']
    if (!nr) return '';
    if (Array.isArray(nr)) {
      nr = nr.map(n => {
        const m = n.match(fragenummerRegex);
        return m ? m[0] : null 
      });
    } else{
      const m = nr.match(fragenummerRegex);
      return m ? m[0] : ''; 
    }
    nr = nr.filter((n: any) => n);
    return _(nr).flatten();
  }

  renderGefragterAusdruck(val:any) {
    const fragenummerRegex = /.*(\(.*\)){0,1}:/;
    let nr = val['NR']
    if (!nr) return '';

    if (Array.isArray(nr)) {
     
      nr = nr[0].replace(fragenummerRegex, '');
    } else{
      return nr.replace(fragenummerRegex, '');
    }
    return nr;
  }

  renderLautung(val:any) {
    const kts = [
      'KT1',
      'KT2',
      'KT3',
      'KT4',
      'KT5',
      'KT6',
      'KT7',
      'KT8',
    ];
    const res: string[] = [];
    kts.forEach(t => {
      if (Array.isArray(val[t] && val[t].length > 0)) 
        res.push(val[t][0]);
      else if(val[t])
        res.push(val[t]);
    });
    return _(res).flatten();
  }
  renderBelegsaetze(val:any) {
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
    ];

    const res: string[] = [];
    tauts.forEach(t => {
      if (Array.isArray(val[t] && val[t].length > 0))
        res.push(val[t][0]);
      else if(val[t])
        res.push(val[t]);
    });
    return _(res).flatten();
  }

  headers = [
    {show: true, text: 'Lemma', renderFnc: (val: any) => Array.isArray(val.HL) ? val.HL[0] : val.HL, value: 'HL' },
    {show: true, text: 'Lemma einfach', renderFnc: (val: any) => Array.isArray(val.HL) && val.HL.length > 1 ? (val.HL[1]).replace('≈', '') : val.HL, sortable: false, value: 'HL2' },
    {show: true, text: 'Wortart', value: 'POS' },
    {show: true, text: 'Bedeutung', renderFnc: this.renderBedeutung, value: 'BD/LT*' },
    {show: true, text: 'Fragenummer', renderFnc: this.renderFragenummer, value: 'NR' },
    {show: true, text: 'Gefragter Ausdruck', renderFnc: this.renderGefragterAusdruck, value: 'NR2', sortable: false },
    {show: true, text: 'Belegseatze', renderFnc: this.renderBelegsaetze, sortable: false, value: 'belegsaetze' },
    {show: true, text: 'Lautung', renderFnc: this.renderLautung, value: 'LT1_teuthonista' },
    {show: false, text: 'Quelle', value: 'QU', extended: true },
    {show: false, text: 'Bibliographische Angabe', value: 'BIBL', extended: true },
    // { text: 'Belegsätze', value: 'BIBL' },
    // { text: 'Bedeutung', value: 'BD/KT*' },
    // { text: 'Kontext', value: 'BD/KT*' },
    // { text: 'FB-Nr.', value: 'Fragebogennummer' },
    // { text: 'Sigle1', value: 'Sigle1', renderFnc: renderSigle}
    {show: true, text: 'Ort', value: 'Gemeinde1', renderFnc: (val: any) => `${_(val.Gemeinde1).flatten()}${val.Ort ? `; ${val.Ort}` : ''}` },
    {show: true, text: 'Großreg.', value: 'Großregion1', renderFnc: (val: any) => `${_(val.Großregion1).flatten()}`, },
    {show: true, text: 'Bundesl.', value: 'Bundesland1', renderFnc: (val: any) => `${_(val.Bundesland1).flatten()}`, }
  ]

  footerProps = {
    'items-per-page-text': 'Pro Seite',
    'items-per-page-options': [10, 25, 50, 100]
  };

  debouncedSearchDatabase = _.debounce(this.searchDatabase, 500)


  async mounted() {
    if (this.collection_ids) {
      this.loadCollectionIds(this.collectionIdList)
    } else {
      this.init()
    }
  }

  get _items() {
    return this.items.filter((i, index) => !!i && this.items.indexOf(i) === index);
  }

  @Watch('searchCollection')
  async onSearchCollection(val: string|null) {
    if (val !== null && val.trim() !== '') {
      this.collectionSearchItems = (await searchCollections(val)).map(x => ({ ...x, text: x.name }))
    }
  }

  selectCollections(colls: any[]) {
    this.$router.replace({ query: { collection_ids: colls.map((x) => x.value).join() } })
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
        [ place.field ]: place.name,
      }
    }
  }

  totalItems = 100

  async init() {
    this.loading = true

    let countDocument = await getDocumentTotalCount();
    // console.log('lel', countDocument)
    this.totalItems = countDocument || 0
    const res = await getDocuments(
      this.pagination.page,
      this.pagination.itemsPerPage,
      this.pagination.sortBy,
      this.pagination.sortDesc,
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
        .map(d => ({ ...d, ...this.getPlacesFromSigle(d.ortsSigle)}))
        .value()
      // console.log({res})
      // console.log('950', res.total)
      this.totalItems = typeof res.total ==='number' ? res.total : 0
      const cs = await getCollectionByIds(ids)
      this.selectedCollections = cs.map(x => ({...x, text: x.name}))
      this.collectionSearchItems = cs.map(x => ({...x, text: x.name}))
      this.searching = false
    } else {
      this.selectedCollections = []
    }
  }

  @Watch('pagination', {deep: true})
  updateResults(newVal: any, oldVal: any) {
    //console.log('pagination changed', newVal, oldVal);
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
    return _(this._items
      .filter((i, index) => !!i && this.selected.find(item => item.id === i.id) && (i.Bundesland !== '' || i.Bundesland1 !== '' ||  i.Großregion !== '' || i.Ort !== ''))).value()
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

  @Watch('query')
  async onChangeQuery(search: string|null) {
    if (search) {
      this.searching = true
      const res = await searchDocuments(
        search,
        this.pagination.page,
        this.pagination.itemsPerPage,
        this.pagination.sortDesc,
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
    const y = xlsx.writeFile({
      Sheets: { sheet: x },
      SheetNames: [ 'sheet' ],
    }, 'wboe-lioe-export.xlsx')
  }

  saveCSV() {
    const x = xlsx.utils.json_to_sheet(this.selected || this.items)
    const y = xlsx.writeFile({
      Sheets: { sheet: x },
      SheetNames: [ 'sheet' ]
    }, 'wboe-lioe-export.csv')
  }

  saveJSON() {
    const blob = JSON.stringify(this.selected || this.items, undefined, 2)
    FileSaver.saveAs(new Blob([blob]), 'wboe-lioe-export.json')
  }

}
</script>
<style lang="scss">
/*
div.v-datatable.v-table.v-datatable--select-all.theme--light{
  position: -webkit-sticky;
  position: sticky;
  bottom: 0;
}
*/
</style>
