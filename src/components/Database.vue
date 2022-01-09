<template>
  <v-layout column>
    <v-flex class="text-xs-left">
      <v-btn
        @click="togglePlaylistSidebar()"
        color="primary"
        fab
        fixed
        :style="{ left: showPlaylistSidebar === true ? '265px' : '15px' }"
        id="dbPlaylistToggleBtn"
      >
        <v-icon>mdi-playlist-edit</v-icon>
      </v-btn>
    </v-flex>

    <v-navigation-drawer
      :value="showPlaylistSidebar"
      left
      app
      permanent
      v-if="showPlaylistSidebar"
    >
      <playlist :onMapPage="false"> </playlist>
    </v-navigation-drawer>
    <v-flex>
      <v-card
        class="sticky-card mt-2"
        v-for="(req, index) in request_arr"
        :key="index"
        :style="{
          left: showPlaylistSidebar === true && index === 0 ? '55px' : '0px',
          width: showPlaylistSidebar === true && index === 0 ? '96.5%' : '100%',
        }"
      >
        <v-row no-gutters id="dbSearchbar">
          <v-col class="pa-0 flex-grow-1" style="margin-left: 5px">
            <v-tooltip bottom :disabled="!showSelectedCollection">
              <template v-slot:activator="{ on }">
                <span v-on="on">
                  <v-text-field
                    @click.stop=""
                    v-if="type === 'fulltext'"
                    autofocus
                    flat
                    label="Datenbank durchsuchen…"
                    prepend-inner-icon="search"
                    :value="req.query"
                    @input="updateRequestQueryDebounced(index, $event)"
                    :disabled="showSelectedCollection"
                    :loading="searching"
                    hide-details
                    solo
                    clearable
                  />
                </span>
              </template>
              <span
                >Die Suche ist nur bei allen Belegen und nicht innerhalb von
                Sammlungen möglich. Auf der linken Seite können Sie zwischen der
                Ansicht aller Belege und der Sammlungen wechseln.
              </span>
            </v-tooltip>
          </v-col>
          <v-col cols="auto" class="pr-2 pt-1 text-right">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  @click="appendArrayReq()"
                  v-on="on"
                  :disabled="showSelectedCollection"
                  ><v-icon>add_circle_outline</v-icon></v-btn
                ></template
              >
              <span>Suchwort hinzufügen</span>
            </v-tooltip>
          </v-col>
          <v-col v-if="index > 0" cols="auto" class="pr-2 pt-1 text-right">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  @click="removeElementArrayReq(req)"
                  v-on="on"
                  :disabled="showSelectedCollection"
                  ><v-icon>remove_circle_outline</v-icon></v-btn
                ></template
              >
              <span>Suchwort entfernen</span>
            </v-tooltip>
          </v-col>
          <v-col v-if="index === 0" cols="auto" class="pa-0 divider-left">
            <v-btn-toggle v-model="toggleModel" mandatory>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn class="text-no-transform" text v-on="on"
                    >Wortanfangsuche</v-btn
                  >
                </template>
                <span>Präfix Suche</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn class="text-no-transform" text v-on="on"
                    >Wildcards Suche</v-btn
                  >
                </template>
                <span>
                  Unterstützt Sonderzeichen * für beliebig viele und ? für genau
                  ein Zeichen an beliebigen Stellen
                </span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn class="text-no-transform" text v-on="on"
                    >Fehlertolerante Suche</v-btn
                  >
                </template>
                <span> Fuzzy Suche </span>
              </v-tooltip>
            </v-btn-toggle>
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
                    v-if="type === 'fulltext' && shouldSearchInAllColumns(req)"
                  >
                    In allen Spalten
                  </template>
                  <template
                    v-if="type === 'fulltext' && !shouldSearchInAllColumns(req)"
                  >
                    In
                    {{ req.fields ? getStringForHead(req) : "keiner" }}
                    Spalte
                  </template>
                  <template v-if="type === 'collection'"> Nach Namen </template>
                  <v-icon class="ml-1" color="grey">mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item
                  dense
                  :disabled="type === 'collection'"
                  @click="selectNoColumnsAndSearch(req)"
                >
                  <v-list-item-avatar size="15">
                    <v-icon small v-if="shouldSearchInAllColumns(req)"
                      >mdi-check</v-icon
                    >
                  </v-list-item-avatar>
                  <v-list-item-title>In allen Spalten suchen</v-list-item-title>
                </v-list-item>

                <v-divider />

                <!-- HERE THE SINGLE CHOICE -->
                <v-list-item
                  v-for="(h, i) in visibleHeaders.filter((h) => h.searchable)"
                  :disabled="type === 'collection'"
                  :key="h.value"
                  :label="h.text"
                  @click="toggleOneCol(h, req)"
                >
                  <v-list-item-avatar size="15">
                    <v-icon v-if="shouldSearchInColumn(h, req)" small>
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
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="accent" icon v-bind="attrs" v-on="on">
                  <v-icon>info</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, index) in [
                    { btn: 'tour' },
                    { btn: 'dialogue' },
                  ]"
                  :key="index"
                >
                  <v-btn
                    v-if="index === 0"
                    color="accent"
                    icon
                    @click="startTour()"
                  >
                    <v-icon>info</v-icon>
                  </v-btn>

                  <v-dialog
                    max-width="1000"
                    color="#2b2735"
                    scrollable
                    v-if="index === 1"
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" color="accent" icon text>
                        <v-icon>mdi-tooltip-text</v-icon>
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
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-card>
    </v-flex>
    <v-flex>
      <!-- Visible Collections -->
      <v-banner id="dbBelegSourceBanner" class="mt-2 pa-0">
        Gezeigte Belege aus:

        <template v-if="showSelectedCollection">
          <v-chip
            v-for="(col, index) in visibleCollections"
            :key="index"
            :color="col.fillColor"
            style="margin-top: 4px; margin-bottom: 4px; margin-right: 4px"
          >
            {{ col.collection_name }}
          </v-chip>
        </template>

        <template v-else>
          <v-chip> Alle Belege </v-chip>
        </template>
      </v-banner>
      <v-data-table
        id="dbBelegTable"
        class="mt-2"
        v-model="selected"
        dense
        show-select
        return-object
        :footer-props="footerProps"
        :items-per-page="10"
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
            :disabled="h.infoUrl === undefined || h.infoUrl === ''"
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
        <!-- Bottom line -->
        <template v-slot:footer="{ props, on, headers }">
          <v-divider />
          <v-row>
            <v-col class="py-0">
              <v-btn
                style="margin-top: 10px"
                class="mx-1 text-no-transform"
                text
                @click="extended = !extended"
                v-model="extended"
              >
                <v-icon v-if="extended" color="grey">mdi-check</v-icon>
                Alle Spalten anzeigen
              </v-btn>
            </v-col>
            <v-col class="py-0">
              <v-data-footer
                id="dbPagination"
                style="border-top: 0"
                v-bind="props"
                v-on="on"
              />
            </v-col>
          </v-row>
        </template>

        <!-- Entries of the Belege -->
        <template v-slot:item="{ item, index, isSelected }">
          <tr
            @click="customSelect(item)"
            v-bind:id="'dbBelegTableRow-' + index"
          >
            <td>
              <v-checkbox
                :value="isSelected"
                @change="customSelect(item)"
                @click.prevent=""
              ></v-checkbox>
            </td>

            <template v-for="header in visibleHeaders">
              <td
                class="line-clamp"
                :key="`${header.value}_${index}`"
                v-if="extended || !header.extended"
              >
                <template v-if="header.renderFnc">
                  <template
                    v-if="
                      header.text === 'Lautung' || header.text === 'Kontext'
                    "
                    ><i> {{ header.renderFnc(item) }} </i>
                  </template>
                  <template v-else-if="header.text === 'Scan'">
                    <v-btn
                      icon
                      color="primary"
                      :disabled="hasScan(item) === ''"
                      @click="openScanWindow(item)"
                    >
                      <v-icon v-if="hasScan(item) === ''"
                        >mdi-image-off
                      </v-icon>
                      <v-icon v-else>mdi-image </v-icon>
                    </v-btn>
                    <v-dialog
                      class="mx-auto my-12"
                      max-width="1000"
                      scrollable
                      v-model="showScanWindow"
                      v-if="infoScan.link !== ''"
                    >
                      <template>
                        <v-card text class="fill-height">
                          <v-toolbar>
                            <v-btn icon color="primary" @click="closeScanWindow()">
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </v-toolbar>
                          <div>
                            <v-img
                              :src="decodeURIComponent(infoScan.link)"
                            ></v-img>
                          </div>
                          <v-card-title>Details zum Scan: {{ infoScan.ID }}</v-card-title>
                          <v-card-text>
                            <v-col>
                              <div>HL: {{ infoScan.HL }}</div>
                              <div>QU: {{ infoScan.QU }}</div>
                              <div>QDB: {{ infoScan.QDB }}</div>
                              <div>NR: {{ infoScan.NR }}</div>
                              <div>LT1: {{ infoScan.LT1 }}</div>
                            </v-col>
                          </v-card-text>
                        </v-card>
                      </template>
                    </v-dialog>

                    <!-- <v-btn 
                        icon 
                        color="primary" 
                        :disabled="header.renderFnc(item) === ''"
                        @click.stop="onImageClick(header.renderFnc(item))"
                        >
                        <v-icon v-if="header.renderFnc(item) === ''">mdi-image-off </v-icon>
                        <v-icon v-else>mdi-image </v-icon>

                        </v-btn> -->
                  </template>

                  <template v-else>
                    {{ header.renderFnc(item) }}
                  </template>
                </template>
                <template v-else>{{ item[header.value] }}</template>

                <template
                  v-if="showSelectedCollection && header.text === 'Sammlung'"
                >
                  <v-chip
                    v-for="(colSource, index) in item.colSources"
                    :key="index"
                    :color="colSource.fillColor"
                    style="
                      margin-top: 2px;
                      margin-bottom: 2px;
                      margin-right: 4px;
                    "
                  >
                    {{ colSource.collection_name }}
                  </v-chip>
                </template>
              </td>
            </template>
          </tr>
        </template>
      </v-data-table>
      <!-- Collection edit options (Add Beleg to collection,...) -->
      <div v-if="mappableSelectionItems.length !== 0" class="collBox">
        <div
          style="
            color: white;
            margin-right: 40px;
            margin-top: 8px;
            float: right;
          "
        >
          {{ mappableSelectionItems.length }} Beleg<span
            v-if="mappableSelectionItems.length > 1"
            >e</span
          >
          ausgewählt
        </div>

        <v-menu offset-y v-if="temp_coll.length !== 0">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="secondary"
              v-bind="attrs"
              v-on="on"
              class="white--text mx-1"
              rounded
              style="float: left"
            >
              Zu Sammlung hinzufügen
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item
              class="addToCollectionItem"
              v-for="(item, index) in temp_coll"
              :key="index"
              @click="addBelegtoCollection(item)"
            >
              <v-list-item-title>{{ item.collection_name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Deletion from collection (WIP) -->
        <!-- <v-menu offset-y v-if="temp_coll.length !== 0">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="secondary"
              v-bind="attrs"
              v-on="on"
              class="white--text mx-1"
              rounded
              style="float: right"
            >
              Aus Sammlung entfernen
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item
              class="addToCollectionItem"
              v-for="(item, index) in temp_coll"
              :key="index"
            >
              <v-list-item-title @click="removeBelegeFromCollection(item)">{{
                item.collection_name
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu> -->

        <!-- Create collection and show on Map -->
        <v-tooltip top style="width: 100px">
          <template v-slot:activator="{ on }">
            <v-btn
              color="secondary"
              @click="createCollectionWithSelectedDocuments()"
              class="white--text mx-1"
              rounded
              style="float: left"
              v-on="on"
            >
              <v-icon>mdi-playlist-plus </v-icon>
              <span v-if="temp_coll.length === 0" class="pl-1"
                >Neue Sammlung</span
              >
            </v-btn>
          </template>
          Erstelle eine neue Sammlung mit den ausgewählten Dokumenten.
        </v-tooltip>

        <!-- Create collection and show on Map -->
        <v-tooltip top style="width: 100px">
          <template v-slot:activator="{ on }">
            <v-btn
              color="secondary"
              @click="createCollectionWithSelectedDocumentsAndShowOnMap()"
              class="white--text mx-1"
              rounded
              style="float: left"
              v-on="on"
            >
              <v-icon class="pr-1">mdi-playlist-plus </v-icon>
              <v-icon>mdi-map </v-icon>
              <span v-if="temp_coll.length === 0" class="pl-1"
                >Neue Sammlung und auf Karte anzeigen</span
              >
            </v-btn>
          </template>
          Erstelle eine neue Sammlung mit den ausgewählten Dokumenten und zeige
          sie auf der Karte an.
        </v-tooltip>

        <v-tooltip top style="width: 100px">
          <template v-slot:activator="{ on }">
            <v-btn
              style="float: left"
              v-on="on"
              color="accent"
              icon
              text
              @click="downloadFiduz"
            >
              <v-icon>info</v-icon>
            </v-btn>
          </template>
          Die Font Fiduz wird benötigt, um die exportierten Einträge anzeigen zu
          können. Klicke hier um zu dem Downloadlink zu kommen.
        </v-tooltip>

        <v-menu top open-on-hover offset-y>
          <template v-slot:activator="{ on }">
            <v-btn
              slot="activator"
              v-on="on"
              small
              text
              class="pl-1 pr-0"
              rounded
              color="white"
              style="float: left; margin-top: 3px"
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
    <v-tour
      name="databaseTour"
      :steps="databaseTour_Steps"
      :options="{
        useKeyboardNavigation: true,
        highlight: true,
        labels: {
          buttonSkip: 'Tour schließen',
          buttonPrevious: 'Zurück',
          buttonNext: 'Weiter',
          buttonStop: 'Tour beenden',
        },
      }"
      :callbacks="tourCallbacks"
    >
    </v-tour>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import InfoText from "@components/InfoText.vue";
import InfoBox from "@components/InfoBox.vue";
import Playlist from "@src/components/playlist.vue";
import {
  getDocuments,
  searchDocuments,
  getDocumentTotalCount,
  getDocumentsByCollection,
  searchCollections,
  getCollectionByIds,
  SearchRequest,
  getDocumentTotalCountPerRequest,
} from "../api";
import { stateProxy, Collection } from "../store/collections";
import { geoStore } from "../store/geo";
import { regions } from "../regions";
import * as FileSaver from "file-saver";
import * as xlsx from "xlsx";
import * as _ from "lodash";
import { concat, forEach } from "lodash";
import { $addNotification } from "@src/utilities/notifications";
import { watch } from "fs";

const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

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
  @Prop({ default: "fulltext" }) type: string | null;
  @Prop({ default: "true" }) fuzzy: "true" | "false";
  @Prop({ default: "" }) page: string | null;
  @Prop({ default: "" }) itemsPerPage: string | null;

  @Prop({ default: "" }) queryFields: string[] | null;

  request_arr: SearchRequest[] = [
    {
      query: "",
      fields: null, // string contains null == all | name
      headerStr: "",
      id: 0, // setting index
    },
  ];

  geoStore = geoStore;
  toggleModel: number = 2;
  prefixSearch: Boolean = false;
  items: any[] = [];
  searchCollection: string | null = null;
  collectionSearchItems: any[] = [];
  selectedCollections: any[] = []; // the selected collections that are shown
  selected: any[] = []; // the selected table entries ("Belege") that are selected within the table
  loading = false;
  searching = false;
  showFilterOptions = false;
  pagination = {
    page: 1,
    itemsPerPage: 10,
    sortBy: [],
    sortDesc: [],
    multiSort: false,
  };
  extended = false;
  totalItems = 100;
  absoluteTotalItems = 100; // the constant static total number in the whole database. Value is assigned in the init function

  indexField = 1;
  stringSpalte = ""; // this.visibleHeaders.map((h) => this.shouldSearchInColumn(h) ? h.text : "")

  localStorage = window.localStorage;

  showScanWindow: boolean = false;

  databaseTour_Steps = [
    {
      target: "#dbSearchbar",
      header: {
        title: "Suchleiste",
      },
      content:
        "Hier können Sie die Belegdatenbank durchsuchen. Achtung: Dies geht nur, wenn Sie sich alle Belege und nicht die Sammlungen anschauen.",
      params: {
        enableScrolling: false,
        placement: "bottom", // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      },
    },
    {
      target: "#dbBelegTable",
      header: {
        title: "Beleg Datenbank",
      },
      content:
        "Hier sehen Sie die Belege aus allen Quellen, die Sie momentan ausgewählt haben (standardmäßig alle Belege).",
      params: {
        enableScrolling: false,
        placement: "top", // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      },
    },
    {
      target: "#dbBelegTableRow-0",
      content:
        "Das ist ein Beleg, klicken Sie entweder auf den Eintrag oder die Checkbox, um ihn aus-/abzuwählen.",
      params: {
        enableScrolling: false,
        placement: "bottom", // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      },
    },
    {
      target: "#dbPagination",
      content:
        "Hier können Sie zwischen unterschiedlichen Seiten wechseln, um mehr Belege anzuschauen oder mehr Belege auf einer Seite anzuzeigen.",
      params: {
        placement: "left", // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      },
    },
    {
      target: "#dbBelegSourceBanner",
      header: {
        title: "Beleg Quellen",
      },
      content:
        "Hier sehen Sie, aus welchen Quellen gerade Belege angezeigt werden.",
      params: {
        enableScrolling: false,
        placement: "bottom", // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      },
    },
    {
      target: "#dbPlaylistToggleBtn",
      content: "Klicken Sie hier, um die Sammlungsübersicht zu öffnen.",
      params: {
        enableScrolling: false,
        placement: "right",
      },
    },
  ];

  tourCallbacks = {
    onSkip: this.disableTourOnLoad,
    onFinish: this.disableTourOnLoad,
  };

  disableTourOnLoad(currentStep?: any) {
    this.localStorage.setItem("belegDBTourEnabled", "false");
  }

  enableTourOnLoad(currentStep?: any) {
    this.localStorage.setItem("belegDBTourEnabled", "true");
  }

  onLandingTourHandler() {
    if (!localStorage.getItem("belegDBTourEnabled")) {
      this.enableTourOnLoad();
    }
    if (localStorage.getItem("belegDBTourEnabled") === "true") {
      this.startTour();
    }
  }

  startTour() {
    // @ts-ignore
    this.$tours["databaseTour"].start();
  }

  openScanWindow(item: any) {
    this.showScanWindow = true;
    this.infoScan["link"] = item.entry["@facs"];
    this.infoScan["ID"] = item["ID"];
    this.infoScan["HL"] = item["HL"];
    this.infoScan["QU"] = item["QU"];
    this.infoScan["QDB"] = item["QDB"];
    this.infoScan["NR"] = item["NR"];
    this.infoScan["LT1"] = item["LT1_teuthonista"];
  }

  closeScanWindow() {
    this.showScanWindow = false;
    this.infoScan["link"] = "";
    this.infoScan["ID"] = "";
    this.infoScan["HL"] = "";
    this.infoScan["QU"] = "";
    this.infoScan["QDB"] = "";
    this.infoScan["NR"] = "";
    this.infoScan["LT1"] = "";
  }

  sortedHeaders: any[] = [
    "ID",
    "Scan",
    "HL",
    "NL",
    "POS",
    "BD/KT",
    "NR",
    "NR2",
    "LT1_teuthonista",
    "BD/LT*",
    "Ort/LT",
    "BD/KT1",
    "BD/KT*",
    "QU",
    "BIBL",
    "Sigle1",
    // 'Sigle10', is for the Staat column
    "Bundesland1",
    "Großregion1",
    "Kleinregion1",
    "Gemeinde1",
  ];

  headers: TableHeader[] = [
    // tslint:disable-next-line:max-line-length
    {
      searchable: false,
      show: false,
      text: "Sammlung",
      value: "",
      infoUrl: "",
      sortable: false,
    },
    {
      // Scans
      searchable: false,
      show: true,
      text: "Scan",
      value: "entry",
      infoUrl: "",
      renderFnc: (val: any) => this.hasScan(val),
      sortable: false,
    },
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
            .replace(/[›]?[L|K]T[\d]?/g, "")
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
            .replace(/[›]?[L|K]T[\d]?/g, "")
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
            .replace(/[›]?[L|K]T[\d]?/g, "")
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
          .replace(/\d[A-Z]?[\.]\d[a-z]\d\d/g, "")
          .replace(/[›]?[L|K]T[\d]?/g, "")}`,
      // ${val.Ort ? ` ${val.Ort}` : ''}`
      sortable: true,
    },
  ];

  footerProps = {
    "items-per-page-text": "Pro Seite",
    "items-per-page-options": [10, 25, 50, 100, 500],
  };

  infoScan = {
    link: "",
    ID: "",
    HL: "",
    QU: "",
    QDB: "",
    NR: "",
    LT1: "",
  };

  hasScan(val: any) {
    return "@facs" in val.entry ? val.entry["@facs"] : "";
  }

  get temp_coll() {
    return stateProxy.collections.temp_coll;
  }

  get wboeColl() {
    return stateProxy.collections.wboe_coll;
  }

  get showAlleBelege() {
    return stateProxy.collections.getShowAlleBelege;
  }

  get visibleCollections() {
    return stateProxy.collections.visibleCollections;
  }

  get showPlaylistSidebar() {
    return stateProxy.collections.showSidebar;
  }

  get activeCollections() {
    return stateProxy.collections.amountActiveCollections;
  }

  togglePlaylistSidebar() {
    stateProxy.collections.toggleSidebar();
  }

  @Watch("stateProxy.collections.visibleCollections")
  visibleCollectionNames(): String[] {
    if (stateProxy.collections.visibleCollections.length > 0) {
      const temp: String[] = [];
      stateProxy.collections.visibleCollections.forEach((col) => {
        temp.push(col.collection_name.toString());
      });
      return temp;
    }
    return ["None"];
  }

  @Watch("toggleModel", { deep: true })
  updateRequestPrefix() {
    this.prefixSearch = this.toggleModel === 0 ? true : false;
    5;
    this.changeQueryParam({ fuzzy: this.toggleModel === 2 ? "true" : "false" });
    this.performSearch(this.request_arr);
  }

  @Watch("activeCollections")
  onActiceCollectionsChange() {
    if (!this.showAlleBelege && this.activeCollections === 0)
      stateProxy.collections.changeShowAlleBelege(true);
  }

  get showSelectedCollection() {
    let activeCollections = stateProxy.collections.amountActiveCollections;
    if (activeCollections > 0 && !this.showAlleBelege) {
      return true;
    }
    return false;
  }

  @Watch("visibleCollections")
  onVisibleColledtionChangeUpdates() {
    this.pagination.page = 1;
    this.updateSelection();
  }

  @Watch("showSelectedCollection")
  showCollectionUpdates() {
    this.showBelgeCollectionSource();
    this.updateSelection();
  }

  showBelgeCollectionSource() {
    this.headers[0].show = this.showSelectedCollection;
  }

  updateSelection() {
    // Attempt of manually updating the selection to circumvent 'invisible' selections
    // baseLoop: for (let index = this.selected.length - 1; index >= 0 ; index -= 1) {
    //   const entry: any = this.selected[index];
    //   for (let j = 0; j < this.shownItems.length; j++) {
    //     const beleg: any = this.shownItems[j];
    //     if(beleg.ID === entry.ID) {
    //       this.selected[index] = beleg;
    //       continue baseLoop;
    //     }
    //   }
    //   this.selected.splice(index, 1);
    // }

    this.selected = [];
  }

  updateRequestQuery(index: number, e: string) {
    if (this.request_arr[index] !== undefined) {
      this.request_arr[index].query = e;
    }
  }

  updateRequestQueryDebounced = _.debounce(this.updateRequestQuery, 150);

  changeQueryParam(p: any): Promise<any> {
    return this.$router
      .replace({
        // path: this.$router.currentRoute.path,
        query: { ...this.$router.currentRoute.query, ...p },
      })
      .catch(() => console.log("route duplicated."));
  }

  addBelegtoCollection(col: Collection) {
    const itemsID = col.items.map((item) => item.ID); // local array of the items
    const addedItems = this.mappableSelectionItems.filter(
      (
        item // filtered items, does not include already existing items
      ) => !itemsID.includes(item.ID)
    );
    stateProxy.collections.addPlacesToCollection({
      col: col.id,
      items: addedItems,
    });
  }

  createCollectionWithSelectedDocuments() {
    let newColl: Collection = {
      id: Math.random() * 1000,
      preColl: -1,
      collection_name: "Sammlung " + stateProxy.collections.collectionNameNr,
      editing: true,
      fillColor: "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
      borderColor: "#000",
      selected: true,
      items: this.mappableSelectionItems,
    };
    stateProxy.collections.addTemp_coll({ changedColl: newColl });

    if (!this.showPlaylistSidebar) this.togglePlaylistSidebar();
    this.selected = []; // initialize all selected elements. Initializartion does not take place if the items are added to an already existing collection
  }

  createCollectionWithSelectedDocumentsAndShowOnMap() {
    this.createCollectionWithSelectedDocuments();

    this.routeToMaps();
  }

  // set an id for each '+' click
  appendArrayReq(): void {
    this.request_arr.push({
      query: "",
      fields: null,
      headerStr: "",
      id: this.indexField,
    });
    this.indexField++;
  }

  // remove element with each '-' click
  removeElementArrayReq(o: SearchRequest): void {
    this.request_arr = this.request_arr.filter((r) => r.id !== o.id);
    // this.request.splice(this.request.indexOf(o), 1)
  }

  async toggleOneCol(h: TableHeader, o: SearchRequest): Promise<void> {
    o.fields = h.value;
  }

  getStringForHead(o: any): string {
    this.visibleHeaders.forEach((h) =>
      this.shouldSearchInColumn(h, o) ? (o.headerStr = h.text) : ""
    );
    return o.headerStr;
  }

  shouldSearchInColumn(h: TableHeader, o: SearchRequest): boolean {
    return (
      o.fields !== null && o.fields.includes(h.value) && h.searchable === true
    );
  }

  shouldSearchInAllColumns(s: SearchRequest): boolean {
    return s.fields === null || s.fields === "";
  }

  async selectAllColumnsAndSearch(o: any) {
    o.fields = null;

    if (o.query !== null) {
      this.onChangeQuery(this.request_arr);
    }
  }

  async selectNoColumnsAndSearch(o: any) {
    // allow search in no columns
    o.fields = "";
    if (o.query !== null) {
      this.onChangeQuery(this.request_arr);
    }
  }

  customSelect(item: any) {
    console.log("item in customSelect: ", item);
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

    const regexSources = /[≈›|›|≈]?LT\d?/g;
    if (Array.isArray(lt)) {
      return lt[0].replace(regexSources, "").replace(/(  )( )*/g, " ");
    } else {
      return lt.replace(regexSources, "").replace(/(  )( )*/g, " ");
    }
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
        kt[i] = kt[i].replace(regexSources, "").replace(/(  )( )*/g, " ");
      }
      return _(kt).flatten(); //replace(regexSources, '')
    } else {
      return kt.replace(regexSources, "").replace(/(  )( )*/g, " ");
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
    return _(res)
      .flatten()
      .join(", ")
      .replace(/(  )( )*/g, " ");
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

  isMultiple() {
    if (this.indexField > 1) {
      true;
    } else false;
  }

  onImageClick(imgLink: string) {
    //   export const patchDocument = (id: string, body: any) =>
    // api.patch(`/api/documents/${id}/`, body); -> wird zu einem body <-> this.connectDocument

    //   get info() {
    //     return `A: ${this.connectDocument.A}
    // HL: ${this.connectDocument.HL}
    // QU: ${this.connectDocument.QU}
    // QDB: ${this.connectDocument.QDB}
    // NR: ${this.connectDocument.NR}
    // LT1: ${this.connectDocument.LT1}`;
    //   }
    // ToDo: Implement Image Open on click
    const decodedUrl = decodeURIComponent(imgLink);
    // console.log('on image click: ' + decodedUrl);
    // @ts-ignore
    window.open(decodedUrl);
    // navigator.clipboard.writeText(decodedUrl); // Copies link to clipboard
    // $addNotification({message: 'Der link zum Bild wurde in Ihrer Zwischenablage gespeichert (kopiert).', type: 'success'});
  }

  async mounted() {
    if (this.type === "collection" && this.collection_ids) {
      this.loadCollectionIds(this.collectionIdList);
    }
    this.onLandingTourHandler();
  }

  get _items() {
    return this.items.filter(
      (i, index) => !!i && this.items.indexOf(i) === index
    );
  }

  get _shownItemsWithSource() {
    var startCount: number =
      (this.pagination.page - 1) * this.pagination.itemsPerPage;
    var lastCount: number =
      (this.pagination.page - 1) * this.pagination.itemsPerPage +
      this.pagination.itemsPerPage +
      1;
    if (lastCount > this.shownItemsWithSource.length)
      lastCount = this.shownItemsWithSource.length;
    return this.shownItemsWithSource.slice(startCount, lastCount); // returns the current relevant pagination
  }

  get shownItems() {
    if (this.showSelectedCollection) {
      return this._shownItemsWithSource; //this.shownItemsWithSource;
    }
    return this._items;
  }

  get shownItemsWithSource() {
    let allItems: any[] = [];
    this.visibleCollections.forEach((coll) => {
      coll.items.forEach((beleg) => {
        const index = allItems.findIndex((item) => item.ID === beleg.ID);
        if (index > -1) {
          if (allItems[index].colSources) {
            for (let i = 0; i < allItems[index].colSources.length; i++) {
              const colSource = allItems[index].colSources[i];
              if (colSource.id === coll.id) break;

              if (i === allItems[index].colSources.length - 1) {
                // Does not contain the collection already, therefore add it.
                allItems[index].colSources.push(coll);
              }
            }
          } else {
            beleg.colSources = [];
            beleg.colSources.push(coll);
          }
        } else {
          beleg.colSources = [];
          beleg.colSources.push(coll);
          allItems.push(beleg);
        }
      });
    });
    return allItems;
  }

  @Watch("searchCollection")
  async onSearchCollection(val: string | null) {
    if (val !== null && val !== undefined && val.trim() !== "") {
      this.searching = true;
      this.collectionSearchItems = (await searchCollections(val)).results.map(
        (x) => ({
          ...x,
          text: x.name,
        })
      );
      this.searching = false;
    }
  }

  @Watch("fuzzy", { immediate: true })
  synchronizeCheckbox() {
    if (this.fuzzy === "true" && this.toggleModel !== 2) {
      this.toggleModel = 2;
    }
    if (this.fuzzy === "false" && this.toggleModel === 2) {
      this.toggleModel = 0;
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
    this.totalItems = countDocument || 0; // this value is updated along the way and is used in the footbar
    this.absoluteTotalItems = countDocument || 0; // from now on this value is not going to be changed
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
      const res = await getDocumentsByCollection(
        ids,
        this.pagination.page,
        this.pagination.itemsPerPage
      );
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
  updateResults() {
    if (!this.showSelectedCollection) {
      if (this.request_arr[0] && this.request_arr[0].query !== "") {
        this.changeQueryParam({
          page: this.pagination.page,
          itemsPerPage: this.pagination.itemsPerPage,
        });
        this.onChangeQuery(this.request_arr);
      } else if (this.collection_ids) {
        this.loadCollectionIds(this.collectionIdList);
      } else {
        this.init();
      }
    }
  }

  get mappableSelectionItems() {
    return _(
      this.shownItems.filter(
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

  @Watch("shownItems", { immediate: true })
  refreshCountingFoot() {
    const updatedCount = this.numberOfShownCollEntries;
    if (updatedCount !== -1) this.totalItems = updatedCount;
  }

  get numberOfShownCollEntries() {
    let number_entries: number = 0;

    let tempID: any[] = [];
    this.wboeColl.forEach((x) => {
      if (x.selected)
        x.items
          .map((y) => y.id)
          .filter((item) => !tempID.includes(item))
          .forEach((entry) => tempID.push(entry));
    });
    this.temp_coll.forEach((x) => {
      if (x.selected)
        x.items
          .map((y) => y.id)
          .filter((item) => !tempID.includes(item))
          .forEach((entry) => tempID.push(entry));
    });

    number_entries = tempID.length;

    if (this.showAlleBelege) number_entries = this.absoluteTotalItems;
    return number_entries > 0 ? number_entries : -1;
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

  get filterReqAll(): SearchRequest[] | null {
    // filtering out all empty fields requests
    const tmp = this.request_arr.filter(
      (r) => r.fields !== "" && r.fields === null && r.query !== ""
    );

    if (tmp.length === 0) return null;
    // creating the result array. In case of null fields ( == all fields), appending
    let i;
    var res: SearchRequest[] = [];
    let searchFields = this.headers
      .filter((h) => h.searchable && h.show)
      .map((h) => h.value)
      .join(",");

    for (i = 0; i < tmp.length; i++) {
      res.push({
        query: tmp[i].query,
        fields: searchFields,
        headerStr: "",
        id: i,
      });
    }

    return res;
  }

  get filterReqSingle(): SearchRequest[] | null {
    // filtering out all empty fields requests
    const tmp = this.request_arr.filter(
      (r) => r.fields !== "" && r.fields !== null && r.query !== ""
    );

    if (tmp.length === 0) return null;

    // creating the result array. In case of null fields ( == all fields), appending
    let i;
    let j = 0; // for the id in the result array
    var res: SearchRequest[] = [];

    for (i = 0; i < tmp.length; i++) {
      res.push({
        query: tmp[i].query,
        fields: tmp[i].fields,
        headerStr: tmp[i].headerStr,
        id: j,
      });
      j++;
    }

    return res;
  }

  @Watch("$route", { immediate: true })
  onChangeRoute() {
    if (this.$route.query !== undefined && this.$route.query.q !== undefined) {
      const requestList = this.deserializeRequestList(
        this.$route.query.q as string
      );
      this.request_arr = requestList;
      this.performSearch(requestList);
    }
    if (this.$route.query !== undefined && this.$route.query.p !== undefined) {
      this.changeQueryParam({
        page: this.$route.query.page,
        itemsPerPage: this.$route.query.itemsPerPage,
      });
    }
  }

  deserializeRequestList(q: string | null): SearchRequest[] {
    if (q === null) {
      return [];
    } else {
      return q.split(";").map((rs, i) => {
        const chunks = rs.split(",");
        return {
          fields: chunks[0] === "all_fields" ? null : chunks[0],
          query: chunks[1] === null ? "" : chunks[1],
          headerStr: chunks[2] === null ? "" : chunks[2],
          id: i,
        };
      });
    }
  }

  serializeRequestList(rl: SearchRequest[]): string {
    return rl
      .map((s) => {
        return `${s.fields || "all_fields"},${
          s.query === null ? "" : s.query
        },${s.headerStr}`;
      })
      .join(";");
  }

  pageItemList(): string {
    return `${this.pagination.page},${this.pagination.itemsPerPage}`;
  }

  async performSearch(req: SearchRequest[]) {
    if (req !== undefined && req.length > 0) {
      this.searching = true;
      const res = await searchDocuments(
        this.filterReqAll, // in all fields search query array (multi_match)
        this.filterReqSingle, // send here the req array of the single fields (or per category)
        this.pagination.page,
        this.pagination.itemsPerPage,
        this.pagination.sortDesc,
        this.pagination.sortBy,
        this.fuzzy === "true",
        this.prefixSearch
      );
      this.items = res.documents.map((d) => ({
        ...d,
        ...this.getPlacesFromSigle(d.ortsSigle),
      }));
      if (res.total.value === 10000) {
        const work = await getDocumentTotalCountPerRequest();
        if (work !== this.totalItems) {
          this.totalItems = work;
        }
      } else {
        this.totalItems = res.total.value || 0;
      }
      this.searching = false;
    } else {
      this.init();
    }
  }

  @Watch("request_arr", { deep: true })
  async onChangeQuery(req: SearchRequest[], oldVal?: SearchRequest[]) {
    if (req !== undefined) {
      this.$router
        .replace({
          query: {
            ...this.$router.currentRoute.query,
            q: this.serializeRequestList(req),
          },
        })
        .catch(() => console.log("route duplicated. "));
    } else {
      console.log("request_array is undefined.");
    }
  }

  routeToMaps() {
    this.$router.push({
      path: "/maps",
    });
  }

  editValuesForExport(): any[] {
    console.log("we are in editValuesExport, localselect: ");
    var localSelect: any[] = _.cloneDeep(this.selected); // creating a deep copy
    console.log(localSelect);
    // sorting the columns based on the order of the table
    var orderedSelect: any[] = [];

    localSelect.forEach((x) => {
      var localOrdered: any = {};
      console.log("scnas in export? ", x["Scan"]);
      // excluding the colSources, entry, Bundesland and Großregion from the exported sheet
      delete x["colSources"];
      delete x["Bundesland"];
      delete x["Großregion"];
      if ("@facs" in x.entry) x["Scan"] = decodeURIComponent(x.entry["@facs"]);
      delete x["entry"];
      for (var key in x) {
        if (Array.isArray(x[key])) {
          x[key] = x[key].join(" ");
        }
        switch (key) {
          case "Kleinregion1":
            x[key] =
              regions
                .mapKleinreg(
                  x[key]
                    .replace(/\d[A-Z]?[\.]\d[a-z]/g, "")
                    .replace(/[›]?[L|K]T[\d]?/g, "")
                    .replace(/ ,/g, ",")
                )
                .trim() +
              " (" +
              x[key] +
              ")";
            break;
          case "Großregion1":
            x[key] =
              regions
                .mapGrossreg(
                  x[key]
                    .replace(/\d[A-Z]?[\.]\d/g, "")
                    .replace(/[›]?[L|K]T[\d]?/g, "")
                    .replace(/ ,/g, ",")
                )
                .trim() +
              " (" +
              x[key] +
              ")";
            break;
          case "Bundesland1":
            x[key] =
              regions
                .mapBundeslaender(
                  x[key]
                    .replace(/\d[A-Z]?[\.]?[\d]?/g, "")
                    .replace(/[›]?[L|K]T[\d]?/g, "")
                    .replace(/ ,/g, ",")
                )
                .trim() +
              " (" +
              x[key] +
              ")";
            break;
          case "Gemeinde1":
            x[key] = x[key]
              .replace(/\d[A-Z]?[\.]\d[a-z]\d\d/g, "")
              .replace(/[›]?[L|K]T[\d]?/g, "")
              .trim();
            break;
          case "HL":
            if (Array.isArray(x[key]) && x[key].length > 1) {
              x[key] = x[key][1].replace("≈", "");
            }
            break;
          case "BD/KT":
            x[key] = this.renderGrammatikAngabe(x);
            break;
          case "NR":
            x[key] = this.renderFragenummer(x);
            break;
          case "NR2":
            x[key] = this.renderGefragterAusdruck(x);
            break;
          case "LT1_teuthonista":
            x[key] = this.renderLautung(x);
            break;
          case "BD/LT*":
            x[key] = this.renderBedeutung(x);
            break;
          case "BD/KT1":
            x[key] = this.renderBelegsaetze(x);
            break;
          case "BD/KT*":
            x[key] = this.renderBedeutungBelegsaetze(x);
            break;
          case "Sigle1":
            x[key] = x[key].trim().replace(/[›]?[L|K]T[\d]?/g, "");
          case "KT1":
            x[key] = x[key].replace(/(  )( )*/, " ");
          default:
            break;
        }
      }

      // creating a local ordered copy per selected item
      this.sortedHeaders.forEach((key) => {
        if (x[key] !== undefined) {
          localOrdered[key] = x[key];
        }
      });

      // adding the values that are not included in the DB table
      for (var key in x) {
        if (!(key in localOrdered)) {
          localOrdered[key] = x[key];
        }
      }

      // updating the exported object
      orderedSelect.push(localOrdered);
    });

    return orderedSelect;
  }

  saveXLSX() {
    var localSelect: any[] = this.editValuesForExport();

    const x = xlsx.utils.json_to_sheet(localSelect || this.items);
    const y = xlsx.writeFile(
      {
        Sheets: { sheet: x },
        SheetNames: ["sheet"],
      },
      "wboe-lioe-export.xlsx"
    );
  }

  saveCSV() {
    var localSelect: any[] = this.editValuesForExport();

    const x = xlsx.utils.json_to_sheet(localSelect || this.items);
    const y = xlsx.writeFile(
      {
        Sheets: { sheet: x },
        SheetNames: ["sheet"],
      },
      "wboe-lioe-export.csv"
    );
  }

  saveJSON() {
    var localSelected = this.editValuesForExport();
    // var localSelected = _.cloneDeep(this.mappableSelectionItems); // enables the export only of the items that are mappable to avoid export of hidden selected items
    // localSelected.forEach((x) => {
    //   delete x['colSources'];
    //   delete x['entry'];
    // })
    const blob = JSON.stringify(localSelected, undefined, 2);
    FileSaver.saveAs(new Blob([blob]), "wboe-lioe-export.json");
  }

  downloadFiduz() {
    window.open(
      "https://vawadioe.acdh.oeaw.ac.at/lioetxt/informationen/fiduz/"
    );
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

.addToCollectionItem:hover {
  cursor: pointer;
  background: #3b89a0;
  color: white;
}

.fuzzyCheckbox {
  .v-label {
    font-size: 14px;
    color: #000000de;
  }
  margin-top: 8px;
  margin-left: 16px;
  margin-right: 16px;
}
</style>
