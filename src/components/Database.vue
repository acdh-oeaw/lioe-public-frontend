<template>
  <v-layout column>
    <v-navigation-drawer :value="sideBar" left app permanent v-if="sideBar">
      <playlist @entries="showAllBelege = $event"> </playlist>
    </v-navigation-drawer>
    <v-flex>
      <v-card class="sticky-card" width="100%">
        <v-row no-gutters>
          <v-col class="pa-0 divider-right">
            <v-btn
              @click="sideBar = !sideBar"
              depressed
              style="margin-left: 5px; margin-top: 5px"
            >
              Sammlungen
            </v-btn>
          </v-col>
          <v-col class="pa-0 flex-grow-1">
            <v-text-field
              @click.stop=""
              v-if="type === 'fulltext'"
              autofocus
              flat
              label="Datenbank durchsuchen…"
              prepend-inner-icon="search"
              :value="query"
              @input="debouncedSearchDatabase"
              :loading="searching"
              hide-details
              solo
              clearable
            />
          </v-col>
          <v-col cols="auto" class="pa-0 divider-left">
            <v-menu offset-y :close-on-content-click="false">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  style="margin-top: 6px"
                  class="mx-1 text-no-transform"
                  text
                  v-on="on"
                  v-bind="attrs"
                >
                  <template v-if="type === 'fulltext'"> Volltext </template>
                  <template v-if="type === 'collection'"> Sammlung </template>
                  <v-icon class="ml-1" color="grey">mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list class="context-menu-list" dense>
                <v-list-item
                  dense
                  @click="
                    changeQueryParam({ type: 'fulltext', collection_ids: null })
                  "
                >
                  <v-list-item-avatar>
                    <v-icon v-if="type === 'fulltext'">mdi-check</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-title> Volltext </v-list-item-title>
                </v-list-item>
                <v-list-item
                  dense
                  @click="changeQueryParam({ type: 'collection' })"
                >
                  <v-list-item-avatar>
                    <v-icon v-if="type === 'collection'">mdi-check</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-title> Sammlung </v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item
                  dense
                  :disabled="type === 'collection'"
                  @click="toggleFuzziness"
                >
                  <v-list-item-avatar>
                    <v-icon v-if="this.fuzzy === 'true' && type === 'fulltext'"
                      >mdi-check</v-icon
                    >
                  </v-list-item-avatar>
                  <v-list-item-title> Fehlertolerante Suche </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col cols="auto" class="pa-0 divider-left">
            <v-menu max-height="80vh" offset-y :close-on-content-click="false">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  style="margin-top: 6px"
                  class="mx-1 text-no-transform"
                  text
                  v-on="on"
                  v-bind="attrs"
                >
                  <template
                    v-if="type === 'fulltext' && areAllSearchColumsSelected"
                  >
                    In allen Spalten
                  </template>
                  <template
                    v-if="type === 'fulltext' && !areAllSearchColumsSelected"
                  >
                    In {{ fields ? fields.split(",").length : 0 }} Spalte{{
                      fields && fields.split(",").length === 1 ? "" : "n"
                    }}
                  </template>
                  <template v-if="type === 'collection'"> Nach Namen </template>
                  <v-icon class="ml-1" color="grey">mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list dense class="context-menu-list">
                <v-list-item dense @click="extended = !extended">
                  <v-list-item-avatar>
                    <v-icon v-if="extended">mdi-check</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-title> Alle Spalten anzeigen </v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item
                  dense
                  :disabled="type === 'collection'"
                  @click="selectNoColumnsAndSearch"
                  v-if="areAllSearchColumsSelected"
                >
                  <v-list-item-avatar />
                  <v-list-item-title> Nichts auswählen </v-list-item-title>
                </v-list-item>
                <v-list-item
                  dense
                  :disabled="type === 'collection'"
                  @click="selectAllColumnsAndSearch"
                  v-if="!areAllSearchColumsSelected"
                >
                  <v-list-item-avatar />
                  <v-list-item-title>
                    In allen Spalten suchen
                  </v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item
                  dense
                  :disabled="type === 'collection'"
                  v-for="h in visibleHeaders.filter((h) => h.searchable)"
                  :key="h.value"
                  @click="toggleSearchInColumn(h)"
                >
                  <v-list-item-avatar>
                    <v-icon
                      :color="type === 'collection' ? 'grey' : undefined"
                      v-if="shouldSearchInColumn(h)"
                    >
                      mdi-check
                    </v-icon>
                  </v-list-item-avatar>
                  <v-list-item-title>
                    {{ h.text }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col cols="auto" class="pr-2 pt-1 text-right">
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
          </v-col>
        </v-row>
      </v-card>
    </v-flex>
    <v-flex>
      <v-data-table
        class="mt-2"
        v-model="selected"
        dense
        show-select
        return-object
        :footer-props="footerProps"
        :options.sync="pagination"
        :server-items-length="totalItems"
        :headers="visibleHeaders"
        fixed-header
        hide-default-footer
        height="500px"
        :loading="loading"
        :items="shownItems"
      >
        <template
          v-for="h in headers"
          v-slot:[`header.${h.value}`]="{ header }"
        >
          <v-menu
            :disabled="h.infoUrl === undefined"
            :key="h.value"
            open-on-hover
            max-width="400"
            max-height="95vh"
            offset-y
            bottom
          >
            <template v-slot:activator="{ on }">
              <span v-on="on">{{ h.text }}</span>
            </template>
            <v-card>
              <v-card-text>
                <info-text :path="h.infoUrl" />
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
        <template v-slot:footer="{ props, on, headers }">
          <v-divider />
          <v-row>
            <v-col class="py-0">
              <v-data-footer style="border-top: 0" v-bind="props" v-on="on" />
            </v-col>
          </v-row>
        </template>
        <template v-slot:item="{ item, index, isSelected }">
          <tr>
            <td>
              <v-checkbox
                :value="isSelected"
                @change="customSelect(item)"
              ></v-checkbox>
            </td>
            <template v-for="header in visibleHeaders">
              <td
                class="line-clamp"
                :key="`${header.value}_${index}`"
                v-if="extended || !header.extended"
              >
                <!-- <i v-if="header.text === 'Kontext'" > {{header.renderFnc(item)}} </i>
                <template v-if="header.renderFnc && header.text!== 'Kontext' ">{{ header.renderFnc(item) }}
                </template> -->

                <template v-if="header.renderFnc">
                  <template
                    v-if="
                      header.text === 'Lautung' || header.text === 'Kontext'
                    "
                    ><i> {{ header.renderFnc(item) }} </i>
                  </template>
                  <template v-else> {{ header.renderFnc(item) }} </template>
                </template>
                <template v-else>{{ item[header.value] }}</template>
              </td>
            </template>
          </tr>
        </template>
      </v-data-table>
      <div v-if="mappableSelectionItems.length !== 0" class="collBox">
        <div
          style="color: white; margin-left: 40px; margin-top: 8px; float: left"
        >
          {{ mappableSelectionItems.length }} Beleg<span
            v-if="mappableSelectionItems.length > 1"
            >e</span
          >
          ausgewählt
        </div>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="secondary"
              :disabled="temp_coll.length === 0"
              v-bind="attrs"
              v-on="on"
              class="white--text"
              rounded
              style="float: right"
            >
              Zu Sammlung hinzufügen
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item v-for="(item, index) in temp_coll" :key="index">
              <v-list-item-title @click="addBelegtoCollection(item)">{{
                item.collection_name
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-menu top open-on-hover>
          <template v-slot:activator="{ on }">
            <v-btn
              slot="activator"
              v-on="on"
              small
              text
              class="pl-3 pr-3"
              rounded
              color="white"
              style="float: right; margin-top: 3px; margin-right: 20px"
            >
              Exportieren
            </v-btn>
          </template>
          <v-list class="context-menu-list" dense>
            <v-list-item @click="saveXLSX">Microsoft Excel</v-list-item>
            <v-list-item @click="saveJSON">JSON</v-list-item>
            <v-list-item @click="saveCSV">CSV</v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import InfoText from "@components/InfoText.vue";
import InfoBox from "@components/InfoBox.vue";
import Playlist from "@components/playlist.vue";
import {
  getDocuments,
  searchDocuments,
  getDocumentTotalCount,
  getDocumentsByCollection,
  searchCollections,
  getCollectionByIds,
} from "../api";
import { stateProxy, Collection } from "../store/collections";
import { geoStore } from "../store/geo";
import { regions } from "../regions";
import * as FileSaver from "file-saver";
import * as xlsx from "xlsx";
import * as _ from "lodash";
import { log } from "util";

interface Places {
  Ort: string;
  Bundesland: string;
  Großregion: string;
}

interface TableHeader {
  searchable: boolean;
  show: boolean;
  text: string;
  infoUrl: string;
  renderFnc?: (v: any) => string;
  value: string;
  sortable: boolean;
  extended?: boolean;
}

@Component({
  components: {
    InfoText,
    InfoBox,
    Playlist,
  },
})
export default class Database extends Vue {
  @Prop({ default: "" }) collection_ids: string | null;
  @Prop({ default: "" }) query: string | null;
  @Prop({ default: null }) fields: string | null;
  @Prop({ default: "fulltext" }) type: string | null;
  @Prop({ default: "true" }) fuzzy: "true" | "false";

  geoStore = geoStore;
  sideBar: Boolean = false;
  items: any[] = [];
  searchCollection: string | null = null;
  collectionSearchItems: any[] = [];
  selectedCollections: any[] = [];
  selected: any[] = [];
  loading = false;
  searching = false;
  showFilterOptions = false;
  showAllBelege: any;
  pagination = {
    page: 1,
    itemsPerPage: 10,
    sortBy: [],
    sortDesc: [],
    multiSort: false,
  };
  extended = false;
  totalItems = 100;

  headers: TableHeader[] = [
    // tslint:disable-next-line:max-line-length
    {
      searchable: true,
      show: false,
      text: "ID",
      value: "ID",
      infoUrl: "wboe-artikel/dbheaderinfo-id/",
      extended: true,
      sortable: true,
    },
    {
      searchable: true,
      show: true,
      text: "Lemma",
      infoUrl: "wboe-artikel/dbheaderinfo-lemma/",
      renderFnc: (val: any) => (Array.isArray(val.HL) ? val.HL[0] : val.HL),
      value: "HL",
      sortable: true,
    },
    {
      searchable: true,
      show: false,
      text: "Nebenlemma",
      infoUrl: "wboe-artikel/dbheaderinfo-nebenlemma",
      value: "NL",
      renderFnc: (val: any) => (Array.isArray(val.NL) ? val.NL[0] : val.NL),
      extended: true,
      sortable: true,
    },
    {
      searchable: false,
      show: false,
      text: "Lemma oS",
      infoUrl: "wboe-artikel/dbheaderinfo-lemmaos/",
      renderFnc: (val: any) =>
        Array.isArray(val.HL) && val.HL.length > 1
          ? val.HL[1].replace("≈", "")
          : val.HL,
      sortable: false,
      value: "HL2",
    },
    {
      searchable: true,
      show: true,
      infoUrl: "wboe-artikel/dbheaderinfo-wortart/",
      text: "Wortart",
      value: "POS",
      sortable: true,
    },
    {
      searchable: true,
      show: false,
      text: "Grammatik",
      infoUrl: "wboe-artikel/dbheaderinfo-grammatik/",
      renderFnc: this.renderGrammatikAngabe,
      value: "BD/KT",
      extended: true,
      sortable: true,
    },
    {
      searchable: true,
      show: false,
      text: "Fragenummer",
      infoUrl: "wboe-artikel/dbheaderinfo-fragenummer/",
      renderFnc: this.renderFragenummer,
      value: "NR",
      extended: true,
      sortable: true,
    },
    {
      searchable: false,
      show: false,
      text: "Frage",
      infoUrl: "wboe-artikel/dbheaderinfo-frage/",
      renderFnc: this.renderGefragterAusdruck,
      value: "NR2",
      sortable: false,
      extended: true,
    },
    {
      searchable: true,
      show: true,
      text: "Lautung",
      infoUrl: "wboe-artikel/dbheaderinfo-lautung/",
      renderFnc: this.renderLautung,
      sortable: false,
      value: "LT1_teuthonista",
    },
    {
      searchable: true,
      show: true,
      text: "Bedeutung/Lautung",
      renderFnc: this.renderBedeutung,
      infoUrl: "wboe-artikel/dbheaderinfo-bedeutunglautung/",
      value: "BD/LT*",
      sortable: false,
    },
    {
      searchable: true,
      show: false,
      text: "Ort/Lautung",
      infoUrl: "wboe-artikel/dbheaderinfo-ortlautung/",
      value: "Ort/LT",
      sortable: false,
      extended: true,
    },
    {
      searchable: true,
      show: true,
      text: "Kontext", // Belegsatz
      infoUrl: "wboe-artikel/dbheaderinfo-kontext/",
      renderFnc: this.renderBelegsaetze,
      value: "BD/KT1", //'belegsaetze',
      sortable: true,
    },
    {
      searchable: true,
      show: true,
      text: "Bedeutung/Kontext", //Bedeutung/Belegsatz
      infoUrl: "wboe-artikel/dbheaderinfo-bedeutungkontext",
      renderFnc: this.renderBedeutungBelegsaetze,
      value: "BD/KT*",
      sortable: true,
    },
    {
      searchable: true,
      show: false,
      text: "Quelle",
      value: "QU",
      infoUrl: "wboe-artikel/dbheaderinfo-quelle/",
      extended: true,
      sortable: true,
    },
    {
      searchable: true,
      show: false,
      text: "Bibliographische Angabe",
      value: "BIBL",
      infoUrl: "wboe-artikel/dbheaderinfo-bibliographischeangabe/",
      extended: true,
      sortable: true,
    },
    {
      searchable: true,
      show: true,
      text: "Sigle",
      value: "Sigle1",
      infoUrl: "wboe-artikel/dbheaderinfo-sigle/",
      renderFnc: (val: any) =>
        `${_(val.Sigle1)
          .flatten()
          .replace(/[›]?[L|K]T[\d]?/g, "")}`,
      sortable: true,
    },
    // { text: 'Belegsätze', value: 'BIBL' },
    // { text: 'Bedeutung', value: 'BD/KT*' },
    // { text: 'Kontext', value: 'BD/KT*' },
    // { text: 'FB-Nr.', value: 'Fragebogennummer' },
    // { text: 'Sigle1', value: 'Sigle1', renderFnc: renderSigle}
    {
      searchable: false,
      show: true,
      text: "Staat",
      infoUrl: "wboe-artikel/dbheaderinfo-staat/",
      value: "Sigle10",
      renderFnc: (val: any) =>
        regions.generalMapStaat(`${_(val.Sigle1).flatten()}`),
      sortable: true,
    },
    {
      searchable: true,
      show: true,
      text: "Land",
      value: "Bundesland1",
      infoUrl: "wboe-artikel/dbheaderinfo-land/",
      renderFnc: (val: any) =>
        regions.mapBundeslaender(
          _(val.Bundesland1)
            .flatten()
            .replace(/\d[A-Z]?[\.]?[\d]?/g, "")
            .replace(/›LT[\d]?/g, "")
            .replace(/ ,/g, ",")
        ),
      sortable: true,
    },
    {
      searchable: true,
      show: true,
      text: "Großregion",
      value: "Großregion1",
      infoUrl: "wboe-artikel/dbheaderinfo-grossregion/",
      renderFnc: (val: any) =>
        regions.mapGrossreg(
          _(val.Großregion1)
            .flatten()
            .replace(/\d[A-Z]?[\.]\d/g, "")
            .replace(/›LT[\d]?/g, "")
            .replace(/ ,/g, ",")
        ),
      sortable: true,
    },
    {
      searchable: true,
      show: true,
      text: "Kleinregion",
      value: "Kleinregion1",
      infoUrl: "wboe-artikel/dbheaderinfo-kleinregionen",
      renderFnc: (val: any) =>
        regions.mapKleinreg(
          _(val.Kleinregion1)
            .flatten()
            .replace(/\d[A-Z]?[\.]\d[a-z]/g, "")
            .replace(/›LT[\d]?/g, "")
            .replace(/ ,/g, ",")
        ),
      sortable: true,
    },
    {
      searchable: true,
      show: true,
      text: "Gemeinde",
      value: "Gemeinde1",
      infoUrl: "wboe-artikel/dbheaderinfo-gemeinde/",
      renderFnc: (val: any) =>
        `${_(val.Gemeinde1)
          .flatten()
          .replace(/\d[A-Z]?[\.]\d[a-z]\d\d/g, "")}`,
      // ${val.Ort ? ` ${val.Ort}` : ''}`
      sortable: true,
    },
  ];

  footerProps = {
    "items-per-page-text": "Pro Seite",
    "items-per-page-options": [10, 25, 50, 100, 500],
  };

  debouncedSearchDatabase = _.debounce(this.searchDatabase, 500);

  async toggleFuzziness() {
    await this.changeQueryParam({
      fuzzy: this.fuzzy === "true" ? "false" : "true",
    });
    this.onChangeQuery(this.query);
  }

  get temp_coll() {
    return stateProxy.collections.temp_coll;
  }

  get wboeColl() {
    return stateProxy.collections.wboe_coll;
  }

  @Watch("stateProxy.collections.amountActiveCollections")
  testIfSelectWOrks() {
    console.log(stateProxy.collections.amountActiveCollections);
  }

  get showSelectedCollection() {
    let activeCollections = stateProxy.collections.amountActiveCollections;
    let allBelege = this.showAllBelege;
    //console.log(activeCollections, allBelege)
    if (activeCollections > 0 && !allBelege) {
      return true;
    }
    return false;
  }

  changeQueryParam(p: any): Promise<any> {
    return this.$router
      .replace({
        // path: this.$router.currentRoute.path,
        query: { ...this.$router.currentRoute.query, ...p },
      })
      .catch(() => console.log("route duplicated."));
  }

  async toggleSearchInColumn(h: TableHeader): Promise<void> {
    if (this.fields === null) {
      // include all but self
      await this.changeQueryParam({
        fields: this.headers
          .filter((h1) => h1.value !== h.value && h.searchable)
          .map((h) => h.value)
          .join(","),
      });
    } else if (this.fields === "") {
      // include only self
      await this.changeQueryParam({ fields: h.value });
    } else {
      if (this.shouldSearchInColumn(h)) {
        // remove self
        await this.changeQueryParam({
          fields: this.fields
            .split(",")
            .filter((f) => f !== h.value)
            .join(","),
        });
      } else {
        // add self
        await this.changeQueryParam({
          fields: this.fields.split(",").concat(h.value).join(","),
        });
      }
    }
    if (this.query !== null) {
      this.onChangeQuery(this.query);
    }
  }

  addBelegtoCollection(col: Collection) {
    stateProxy.collections.addPlacesToCollection({
      col: col.id,
      items: this.mappableSelectionItems,
    });
  }

  shouldSearchInColumn(h: TableHeader): boolean {
    if (this.fields === "") {
      return false;
    } else if (this.fields === null) {
      return true;
    } else {
      return this.fields.split(",").includes(h.value) && h.searchable;
    }
  }

  get areAllSearchColumsSelected(): boolean {
    // all columns are either selected, or not searchable
    return this.headers.every(
      (h) => this.shouldSearchInColumn(h) || h.searchable === false
    );
  }

  async selectAllColumnsAndSearch() {
    // allow search in all columns that are searchable
    await this.changeQueryParam({ fields: null });
    if (this.query !== null) {
      this.onChangeQuery(this.query);
    }
  }

  async selectNoColumnsAndSearch() {
    // allow search in no columns
    await this.changeQueryParam({ fields: "" });
    if (this.query !== null) {
      this.onChangeQuery(this.query);
    }
  }

  customSelect(item: any) {
    // console.debug(!this.selected.find(i => item.id === i.id), this.selected, item.id)
    if (this.selected.find((i) => item.id === i.id)) {
      this.selected = this.selected.filter((i) => i.id !== item.id);
    } else {
      this.selected.push(item);
    }
  }

  get visibleHeaders() {
    return this.headers.filter((h: any) => h.show);
  }

  @Watch("extended")
  onExtendedChanged(val: boolean) {
    this.headers.forEach((h: any) => {
      if (h.extended) {
        h.show = val;
      }
    });
  }

  // the changed function - was before under the renderBedeutung function
  renderGrammatikAngabe(val: any) {
    const bd: string[] = [];
    for (let i = 1; i < 10; i += 1) {
      const at = `GRAM/LT${i}`;
      const b = val[`GRAM/LT${i}`];
      if (!b) {
        continue;
      }
      bd.push(b);
    }
    const bdnew: string[] = [];
    for (let i = 0; i < bd.length; i += 1) {
      bdnew.push(bd[i][0]);
    }
    return _(bdnew).flatten().join(", ");
  }

  renderFragenummer(val: any) {
    let nr = val["NR"];
    if (!nr) {
      return "";
    }
    const replacer = (
      match: string,
      p1: string,
      p2: string,
      offset: any,
      what: any
    ) => {
      console.log(match, p1, p2, offset, what);
      return match;
    };
    const fragenummerRegex = /.* (\(.*\)){0,1}:/;
    if (Array.isArray(nr)) {
      nr = nr.map((n) => {
        const m = n.match(fragenummerRegex);
        return m ? m[0] : null;
      });
    } else {
      const m = nr.match(fragenummerRegex);
      return m ? m[0] : "";
    }
    nr = nr.filter((n: any) => n);
    return _(nr).flatten();
  }

  renderGefragterAusdruck(val: any) {
    let nr = val["NR"];
    if (!nr) {
      return "";
    }

    const fragenummerRegex = /.*(\(.*\)){0,1}:/;
    if (Array.isArray(nr)) {
      nr = nr[0].replace(fragenummerRegex, "");
    } else {
      return nr.replace(fragenummerRegex, "");
    }
    return nr;
  }

  renderBedeutung(val: any) {
    let lt = val["BD/LT*"];
    if (!lt) {
      return "";
    }

    const regexSources = /[≈›|›|≈]?LT\d?/;
    if (Array.isArray(lt)) {
      return lt[0].replace(regexSources, "");
    } else {
      return lt.replace(regexSources, "");
    }
    return lt;
  }

  renderBedeutungBelegsaetze(val: any) {
    let kt = val["BD/KT*"];
    if (!kt) {
      return "";
    }

    const regexSources = /›KT\d/;
    if (Array.isArray(kt)) {
      var i;
      for (i = 0; i < kt.length; i++) {
        kt[i] = kt[i].replace(regexSources, "");
      }
      return _(kt).flatten(); //replace(regexSources, '')
    } else {
      return kt.replace(regexSources, "");
    }
  }

  renderBelegsaetze(val: any) {
    const kts = ["KT1", "KT2", "KT3", "KT4", "KT5", "KT6", "KT7", "KT8"];
    const res: string[] = [];
    kts.forEach((t) => {
      if (Array.isArray(val[t]) && val[t].length > 0) {
        res.push(val[t][0]);
      } else if (val[t]) {
        res.push(val[t]);
      }
    });
    return _(res).flatten().join(", ");
  }

  renderLautung(val: any) {
    const tauts = [
      "LT1_teuthonista",
      "LT2_theutonista",
      "LT3_theutonista",
      "LT4_theutonista",
      "LT5_theutonista",
      "LT6_theutonista",
      "LT7_theutonista",
      "LT8_theutonista",
      "LT9_theutonista",
    ];

    const res: string[] = [];
    tauts.forEach((t) => {
      if (Array.isArray(val[t]) && val[t].length > 0) {
        res.push(val[t][0]);
      } else if (val[t]) {
        res.push(val[t]);
      }
    });
    return _(res).flatten().join(", ");
  }

  async mounted() {
    if (this.type === "collection" && this.collection_ids) {
      this.loadCollectionIds(this.collectionIdList);
    }
  }

  get _items() {
    return this.items.filter(
      (i, index) => !!i && this.items.indexOf(i) === index
    );
  }

  get shownItems() {
    if (this.showSelectedCollection) {
      return this.collItems;
    }
    return this._items;
  }

  get collItems() {
    let allItems: any[] = [];
    this.wboeColl.forEach((beleg) => {
      allItems = [...allItems, ...beleg.items]
    });
    this.temp_coll.forEach((beleg) => {
      allItems = [...allItems, ...beleg.items]
    });
    return allItems
  }

  @Watch("searchCollection")
  async onSearchCollection(val: string | null) {
    if (val !== null && val !== undefined && val.trim() !== "") {
      this.collectionSearchItems = (await searchCollections(val)).map((x) => ({
        ...x,
        text: x.name,
      }));
    }
  }

  selectCollections(colls: any[]) {
    this.changeQueryParam({
      collection_ids: colls.map((x) => x.value).join(),
    });
  }

  get collectionIdList() {
    if (this.collection_ids) {
      return this.collection_ids.split(",");
    } else {
      return [];
    }
  }

  getPlacesFromSigle(sigle: string): Places {
    const place = _(geoStore.ortsliste).find((o) => o.sigle === sigle);
    if (place === undefined) {
      return {
        Ort: "",
        Großregion: "",
        Bundesland: "",
      };
    } else {
      const bl = _(place.parentsObj).find((o) => o.field === "Bundesland");
      const gr = _(place.parentsObj).find((o) => o.field === "Großregion");
      return {
        Ort: place.name,
        Großregion: gr ? gr.name : "",
        Bundesland: bl ? bl.name : "",
        [place.field]: place.name,
      };
    }
  }

  async init() {
    this.loading = true;
    const countDocument = await getDocumentTotalCount();
    this.totalItems = countDocument || 0;
    const res = await getDocuments(
      this.pagination.page,
      this.pagination.itemsPerPage,
      this.pagination.sortBy,
      this.pagination.sortDesc
    );
    this.items = res.documents.map((d) => ({
      ...d,
      ...this.getPlacesFromSigle(d.ortsSigle),
    }));
    this.loading = false;
  }

  @Watch("collectionIdList")
  async loadCollectionIds(ids: string[]) {
    if (ids.length > 0) {
      await this.changeQueryParam({ type: "collection" });
      this.searching = true;
      const res = await getDocumentsByCollection(ids, this.pagination.page);
      this.items = _(res.documents)
        .uniqBy((d) => d.id)
        .map((d) => ({ ...d, ...this.getPlacesFromSigle(d.ortsSigle) }))
        .value();
      this.totalItems = typeof res.total === "number" ? res.total : 0;
      const cs = await getCollectionByIds(ids);
      this.selectedCollections = cs.map((x) => ({ ...x, text: x.name }));
      this.collectionSearchItems = cs.map((x) => ({ ...x, text: x.name }));
      this.searching = false;
    } else {
      this.selectedCollections = [];
    }
  }

  @Watch("pagination", { deep: true })
  updateResults(newVal: any, oldVal: any) {
    if (newVal.page !== oldVal.page) {
      window.scroll({ top: 0, behavior: "smooth" });
    }
    if (this.query) {
      this.onChangeQuery(this.query);
    } else if (this.collection_ids) {
      this.loadCollectionIds(this.collectionIdList);
    } else {
      this.init();
    }
  }

  get mappableSelectionItems() {
    return _(
      this._items.filter(
        (i, index) =>
          !!i &&
          this.selected.find((item) => item.id === i.id) &&
          (i.Bundesland !== "" ||
            i.Bundesland1 !== "" ||
            i.Großregion !== "" ||
            i.Ort !== "")
      )
    ).value();
  }

  showSelectionOnMap() {
    if (this.selected.length > 0) {
      this.$router.push({
        path: "/maps",
        query: {
          col: this.getColStr(
            this.mappableSelectionItems.map((d) => d.ortsSigle)
          ),
        },
      });
    }
  }

  getColStr(val: any) {
    let output;
    if (Array.isArray(val)) {
      //@ts-ignore
      let noDuplicates = [];
      val.forEach((c) => {
        //@ts-ignore
        if (!noDuplicates.includes(c)) {
          noDuplicates.push(c);
        }
      });
      output = JSON.stringify([
        {
          id: 0,
          tempColl: -1,
          collection_name: "Sammlung Datenbank",
          editing: false,
          fillColor:
            "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
          borderColor: "#000",
          //@ts-ignore
          items: noDuplicates,
        },
      ]);
    } else {
      output = JSON.stringify([
        {
          id: 0,
          tempColl: -1,
          collection_name: "Sammlung Datenbank",
          editing: false,
          fillColor:
            "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
          borderColor: "#000",
          items: [val],
        },
      ]);
    }
    return output;
  }

  arrangeToArr(val: string) {
    var tmp = val.toString();
    const colls = tmp.split(",");
    this.getLocationsOfCollections(colls);
  }

  getLocationsOfCollections(colls: string[]) {
    if (!Array.isArray(colls)) {
      var tmp = new Array();
      tmp.push(colls);
      colls = tmp;
    }

    if (colls.length === 0) {
      return;
    }
    let output: any[] = [];
    let end_output;

    colls.forEach(async (coll) => {
      let shownInGeo;
      this.selectedCollections.forEach((CollInGeo) => {
        //@ts-ignore
        if (CollInGeo.tempColl === coll) {
          shownInGeo = true;
        }
      });
      //It is a new one
      if (!shownInGeo) {
        const res: any = await getDocumentsByCollection([coll], 1, 1000);
        let CollLocation: any[] = [];
        //@ts-ignore
        res.documents.forEach((document) => {
          let sigle: string = document.ortsSigle;
          if (sigle) {
            if (!CollLocation.includes(document.ortsSigle.split(" ")[0])) {
              CollLocation.push(document.ortsSigle.split(" ")[0]);
            }
          }
        });
        let collName = "";
        let collDescription = "";
        this.collectionSearchItems.forEach((iterColl) => {
          if (coll === iterColl.value) {
            collName = iterColl.name;
            collDescription = iterColl.description;
          }
        });

        output.push(
          JSON.stringify({
            id: Math.random() * 1000,
            tempColl: coll,
            collection_name: collName,
            editing: false,
            fillColor:
              "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
            borderColor: "#000",
            items: CollLocation,
          })
        );

        this.$router.push({
          path: "/maps",
          query: {
            col: "[" + output + "]",
          },
        });
      }
    });
  }

  get searchInFields() {
    if (this.fields === "") {
      return [];
    } else if (this.fields === null) {
      return this.headers
        .filter((h) => h.searchable && h.show)
        .map((h) => h.value);
    } else {
      return this.fields.split(",");
    }
  }

  @Watch("query", { immediate: true })
  async onChangeQuery(search: string | null) {
    if (search !== null) {
      this.searching = true;
      const res = await searchDocuments(
        search,
        this.pagination.page,
        this.pagination.itemsPerPage,
        this.pagination.sortDesc,
        this.pagination.sortBy,
        this.searchInFields,
        this.fuzzy === "true"
      );
      this.items = res.documents.map((d) => ({
        ...d,
        ...this.getPlacesFromSigle(d.ortsSigle),
      }));

      // console.log('fluss', res.total)
      this.totalItems = res.total.value || 0;
      this.searching = false;
    } else {
      this.init();
    }
  }

  async searchDatabase(search: string) {
    // this.$router.replace({ query: { query: search } })
    await this.changeQueryParam({ query: search });
  }

  saveXLSX() {
    const x = xlsx.utils.json_to_sheet(this.selected || this.items);
    const y = xlsx.writeFile(
      {
        Sheets: { sheet: x },
        SheetNames: ["sheet"],
      },
      "wboe-lioe-export.xlsx"
    );
  }

  saveCSV() {
    const x = xlsx.utils.json_to_sheet(this.selected || this.items);
    const y = xlsx.writeFile(
      {
        Sheets: { sheet: x },
        SheetNames: ["sheet"],
      },
      "wboe-lioe-export.csv"
    );
  }

  saveJSON() {
    const blob = JSON.stringify(this.selected || this.items, undefined, 2);
    FileSaver.saveAs(new Blob([blob]), "wboe-lioe-export.json");
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
.collBox {
  width: 100%;
  height: 50px;
  background-color: #3b89a0;
  padding: 6px;
}
</style>
