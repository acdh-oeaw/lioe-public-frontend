<template>
  <div class="fill-height">
    <v-flex class="fill-height" xs12>
      <v-card class="d-flex flex-column" elevation="0">
        <span>
          <v-card-text
            ><h1>
              Sammlungen<v-btn
                @click="togglePlaylistSidebar()"
                color="secondary"
                text
                rounded
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </h1></v-card-text
          >
        </span>
      </v-card>
      <v-card class="fill-height d-flex flex-column" elevation="0">
        <v-card-title>
          <v-text-field
            label="Sammlungen Filtern"
            class="text-body-2"
            rounded
            dense
            clearable
            filled
            prepend-inner-icon="mdi-magnify"
            hide-details
            style="width: 98%"
            v-model="filterCollection"
          ></v-text-field>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-3 pt-0 flex-grow-1 overflow-y-auto">
          <v-list dense>
            <v-subheader>Belegdatenbank</v-subheader>
            <v-list-item
              :disabled="onMapPage || !extra_colls_exist"
              @click="toggleSelectedCollShowAll()"
            >
              <v-list-item-action style="margin-right: 0px">
                <v-checkbox
                  :disabled="onMapPage"
                  @click.prevent=""
                  v-model="showAlleBelege"
                  color="primary"
                />
              </v-list-item-action>
              <v-list-item-content style="margin-left: 5px">
                Alle Belege zeigen
              </v-list-item-content>
            </v-list-item>
            <v-subheader>Meine Sammlungen</v-subheader>
            <v-list-item-group>
              <draggable
                v-model="temp_coll"
                group="temp_coll"
                @start="drag = true"
                @end="drag = false"
              >
                <v-list-item
                  v-for="(item, i) in temp_coll.filter((item) =>
                    item.collection_name
                      .toLowerCase()
                      .includes(
                        this.filterCollection.toLowerCase() == null
                          ? ''
                          : this.filterCollection.toLowerCase()
                      )
                  )"
                  :key="i"
                  @click="switchShow(item)"
                >
                  <v-list-item-action style="margin-right: 0px">
                    <v-checkbox
                      v-model="item.selected"
                      @click.prevent=""
                      color="primary"
                      :on-icon="'mdi-eye'"
                      :off-icon="'mdi-eye-off'"
                      dense
                    ></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content
                    style="margin-left: 5px; margin-right: 5px"
                  >
                    <v-list-item-title
                      v-if="item.editing === false"
                      v-text="item.collection_name"
                    ></v-list-item-title>
                    <!-- :style="{ color: item.fillColor }" -->
                    <v-text-field
                      dense
                      v-if="item.editing === true"
                      @keypress.enter="item.editing = false"
                      @blur="item.editing = false"
                      v-model="item.collection_name"
                      autofocus
                      :elevation="6"
                    ></v-text-field>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div
                      :color="item.borderColor"
                      style="width: 18px; height: 18px"
                    >
                      <v-menu :close-on-content-click="false" offset-y top>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            :color="item.borderColor"
                            elevation="1"
                            fab
                            style="
                              width: 18px;
                              height: 18px;
                              margin-bottom: 20px;
                            "
                          >
                            <v-btn
                              :color="item.fillColor"
                              elevation="1"
                              fab
                              style="width: 15px; height: 15px"
                            ></v-btn>
                          </v-btn>
                        </template>
                        <div id="menuItem">
                          Farbe des Rahmens
                          <v-color-picker
                            hide-inputs
                            v-model="item.borderColor"
                          ></v-color-picker>
                          Farbe des Inhalts
                          <v-color-picker
                            hide-inputs
                            v-model="item.fillColor"
                          ></v-color-picker>
                        </div>
                      </v-menu>
                    </div>
                  </v-list-item-action>
                  <v-list-item-icon
                    style="margin: auto 0px"
                    v-if="onMapPage && item.items.length === 0"
                  >
                    <v-tooltip top style="width: 200px">
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" style="color: red" class="mdi-18px"
                          >mdi-alert</v-icon
                        >
                      </template>
                      Diese Sammlung ist noch leer! Gehen Sie zur Belegdatenbank
                      <br />
                      um Belege zu dieser Sammlung hinzuzufügen.
                    </v-tooltip>
                  </v-list-item-icon>
                  <v-list-item-action
                    style="margin-left: 0px; margin-right: 0px"
                  >
                    <v-menu offset-y>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          x-small
                          fab
                          text
                          depressed
                          v-bind="attrs"
                          v-on="on"
                        >
                          <span class="mdi mdi-dots-horizontal"></span>
                        </v-btn>
                      </template>
                      <v-list dense>
                        <v-list-item @click="item.editing = true">
                          <v-list-item-title>Umbennenen</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteCol(item)">
                          <v-list-item-title>Löschen</v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <v-menu right open-on-hover offset-x>
                            <template v-slot:activator="{ on }">
                              <v-btn
                                v-on="on"
                                @click.prevent=""
                                style="padding-left: 0px"
                                class="export-btn"
                                text
                              >
                                Exportieren
                              </v-btn>
                            </template>
                            <v-list dense>
                              <v-list-item @click="saveXLSX(item)">
                                <v-list-item-title class="export-btn">
                                  Microsoft Excel</v-list-item-title
                                >
                              </v-list-item>
                              <v-list-item @click="saveJSON(item)">
                                <v-list-item-title class="export-btn">
                                  JSON</v-list-item-title
                                >
                              </v-list-item>
                              <v-list-item @click="saveCSV(item)">
                                <v-list-item-title class="export-btn">
                                  CSV</v-list-item-title
                                >
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </v-list-item>
              </draggable>
            </v-list-item-group>
          </v-list>
          <v-tooltip right max-width="220" min-width="100">
            <template v-slot:activator="{ on }">
              <v-btn
                color="primary"
                depressed
                @click="addCollection()"
                style="width: 98%; margin: 0 auto"
                v-on="on"
              >
                Sammlung anlegen
              </v-btn>
            </template>
            <span
              >Die erstellte Sammlung wird nicht online gespeichert sondern hält
              nur so lange, wie die Seite nicht neu geladen wird.</span
            >
          </v-tooltip>

          <v-list dense>
            <v-subheader>WBÖ Sammlungen</v-subheader>
            <v-list-item-group>
              <draggable
                v-model="wboe_coll"
                group="wboe_coll"
                @start="drag = true"
                @end="drag = false"
              >
                <v-list-item
                  v-for="(item, i) in wboe_coll.filter((item) =>
                    item.collection_name
                      .toLowerCase()
                      .includes(
                        this.filterCollection.toLowerCase() == null
                          ? ''
                          : this.filterCollection.toLowerCase()
                      )
                  )"
                  @click="switchShow(item)"
                  :key="i"
                >
                  <v-list-item-action style="margin-right: 0px">
                    <v-checkbox
                      :input-value="item.selected"
                      @click.prevent=""
                      color="primary"
                      :on-icon="'mdi-eye'"
                      :off-icon="'mdi-eye-off'"
                      dense
                    ></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content style="margin-left: 5px">
                    <v-list-item-title
                      v-text="item.collection_name"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                      v-text="item.collection_desc"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <!-- Collection Color Picker -->
                    <div
                      :color="item.borderColor"
                      style="width: 18px; height: 18px"
                    >
                      <v-menu :close-on-content-click="false" offset-y top>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            :color="item.borderColor"
                            elevation="1"
                            fab
                            style="
                              width: 18px;
                              height: 18px;
                              margin-bottom: 20px;
                            "
                          >
                            <v-btn
                              :color="item.fillColor"
                              elevation="1"
                              fab
                              style="width: 15px; height: 15px"
                            ></v-btn>
                          </v-btn>
                        </template>
                        <div id="menuItem">
                          Farbe des Rahmens
                          <v-color-picker
                            hide-inputs
                            v-model="item.borderColor"
                          ></v-color-picker>
                          Farbe des Inhalts
                          <v-color-picker
                            hide-inputs
                            v-model="item.fillColor"
                          ></v-color-picker>
                        </div>
                      </v-menu>
                    </div>
                  </v-list-item-action>

                  <v-list-item-action>
                    <v-menu offset-y>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          x-small
                          fab
                          text
                          depressed
                          v-bind="attrs"
                          v-on="on"
                        >
                          <span class="mdi mdi-dots-horizontal"></span>
                        </v-btn>
                      </template>
                      <v-list dense>
                        <v-list-item @click="deleteCol(item)">
                          <v-list-item-title>Entfernen</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="createCopyColl(item)">
                          <v-list-item-title>Kopie erstellen</v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <v-menu right open-on-hover offset-x>
                            <template v-slot:activator="{ on }">
                              <v-btn
                                v-on="on"
                                @click.prevent=""
                                style="padding-left: 0px"
                                class="export-btn"
                                text
                              >
                                Exportieren</v-btn
                              >
                            </template>
                            <v-list-item @click="saveXLSX(item)">
                              <v-list-item-title class="export-btn">
                                Microsoft Excel</v-list-item-title
                              >
                            </v-list-item>
                            <v-list-item @click="saveJSON(item)"
                              ><v-list-item-title class="export-btn"
                                >JSON</v-list-item-title
                              ></v-list-item
                            >
                            <v-list-item @click="saveCSV(item)"
                              ><v-list-item-title class="export-btn"
                                >CSV</v-list-item-title
                              ></v-list-item
                            >
                          </v-menu>
                        </v-list-item>
                        <v-list-item v-if="temp_coll.length > 0">
                          <v-menu right open-on-hover offset-x>
                            <template v-slot:activator="{ on }">
                              <v-btn
                                v-on="on"
                                @click.prevent=""
                                style="padding-left: 0px"
                                class="export-btn"
                                text
                                >Zu Sammlung hinzufügen</v-btn
                              >
                            </template>
                            <v-list dense>
                              <v-list-item
                                v-for="(coll, index) in temp_coll"
                                :key="index"
                                @click="addBelegeToCollection(item, coll)"
                              >
                                <v-list-item-titel class="export-btn">
                                  {{ coll.collection_name }}
                                </v-list-item-titel>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </v-list-item>
              </draggable>
            </v-list-item-group>
          </v-list>
          <v-autocomplete
            :items="collectionSearchItems"
            v-model="selectedCollections"
            :search-input.sync="searchCollection"
            label="WBÖ-Sammlungen hinzufügen..."
            hide-details
            style="width: 98%"
            dense
            flat
            rounded
            filled
            hide-selected
            multiple
          >
            <template v-slot:no-data>
              <v-list-item v-if="isSearching">
                <v-list-item-title class="caption grey--text text-center">
                  Lade...
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-else-if="searchCollection === null || searchCollection === ''"
              >
                <v-list-item-title class="caption grey--text text-center">
                  Zu tippen beginnen, um nach Sammlungen zu suchen
                </v-list-item-title>
              </v-list-item>
              <v-list-item v-else>
                <v-list-item-title class="caption grey--text text-center">
                  Keine Sammlung gefudnen
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-slot:item="{ item }">
              <v-list-item-content
                @click="getLocationsOfCollections(this.selectedCollections)"
              >
                <v-list-item-title v-text="item.text"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="item.description"
                ></v-list-item-subtitle>
              </v-list-item-content>
            </template>
            <template v-slot:selection="{ item }">
              <span v-if="false"> {{ item.text }} </span>
            </template>
            <template v-slot:append-item="">
              <v-lazy
                v-if="
                  searchCollection !== '' &&
                  searchCollection !== null &&
                  collectionSearchItems.length > 0 &&
                  collectionSearchHasNextPage
                "
              >
                <load-more-items @render="loadAndAppendNextPageCollections">
                  <v-progress-linear class="mx-5" indeterminate />
                </load-more-items>
              </v-lazy>
            </template>
          </v-autocomplete>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn block v-if="onMapPage" elevation="0" @click="routeToDB()">
            <v-icon left>mdi-database</v-icon>
            In Datenbank zeigen
          </v-btn>
          <v-btn block v-else elevation="0" @click="routeToMaps()">
            <v-icon left>mdi-map</v-icon>
            Auf Karte zeigen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { stateProxy, Collection } from "../store/collections";
import { getDocumentsByCollection, searchCollections } from "@src/api";
import LoadMoreItems from "./LoadMoreItems.vue";
import draggable from "vuedraggable";
import * as FileSaver from "file-saver";
import * as _ from "lodash";
import * as xlsx from "xlsx";
import { regions } from "@src/regions";

@Component({
  components: {
    draggable,
    LoadMoreItems,
  },
})
export default class Playlist extends Vue {
  @Prop() onMapPage: Boolean;
  collectionSearchItems: any[] = [];
  selectedCollections: any[] = [];
  searchCollection: string | null = null;
  filterCollection: string = "";
  collectionSearchHasNextPage: boolean = false;
  collectionSearchCurrentPage = 1;
  isSearching = false;

  async loadAndAppendNextPageCollections() {
    if (this.searchCollection !== null) {
      this.isSearching = true;
      const searchResult = await searchCollections(
        this.searchCollection,
        this.collectionSearchCurrentPage + 1
      );
      if (searchResult.results.length === 0) {
        this.collectionSearchHasNextPage = false;
        this.collectionSearchItems = [];
        this.collectionSearchCurrentPage = 0;
      } else {
        this.collectionSearchItems = this.collectionSearchItems.concat(
          searchResult.results.map((r) => ({ ...r, text: r.name }))
        );
      }
      this.collectionSearchCurrentPage = this.collectionSearchCurrentPage + 1;
      this.collectionSearchHasNextPage = searchResult.next !== null;
      if (
        this.collectionSearchHasNextPage === true &&
        searchResult.results.length !== 0
      ) {
        // a pretty ugly trick to make the v-lazy component update,
        // so it triggers the next time we scroll down.
        this.collectionSearchHasNextPage = false;
        await this.$nextTick();
        this.collectionSearchHasNextPage = true;
      }
      this.isSearching = false;
    }
  }

  get showAlleBelege() {
    return stateProxy.collections.getShowAlleBelege;
  }

  set showAlleBelege(show: Boolean) {
    stateProxy.collections.changeShowAlleBelege(show);
  }

  get temp_coll() {
    return stateProxy.collections.temp_coll;
  }

  set temp_coll(colls: Collection[]) {
    stateProxy.collections.setTemp_coll(colls);
  }

  get wboe_coll() {
    return stateProxy.collections.wboe_coll;
  }

  set wboe_coll(colls: Collection[]) {
    stateProxy.collections.setWboe_coll(colls);
  }

  get extra_colls_exist() {
    return this.temp_coll.length > 0 || this.wboe_coll.length > 0;
  }

  togglePlaylistSidebar() {
    stateProxy.collections.toggleSidebar();
  }

  routeToMaps() {
    this.$router.push({
      path: "/maps",
    });
  }

  routeToDB() {
    this.$router.push({
      path: "/db",
    });
  }

  switchShow(item: Collection) {
    if (item.editing === false) {
      stateProxy.collections.swapShow(item);
    }
  }

  async getLocationsOfCollections(colls: any[]) {
    // i should really change this at some point to be more efficient
    if (typeof colls === "object" && colls !== []) {
      colls.forEach(async (coll) => {
        let shownInGeo;
        this.wboe_coll.forEach((CollInGeo) => {
          //@ts-ignore
          if (CollInGeo.preColl === coll) {
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
          stateProxy.collections.addWBOE_coll({
            changedColl: {
              id: Math.random() * 1000,
              selected: true,
              preColl: coll,
              collection_name: collName,
              collection_desc: collDescription,
              editing: false,
              fillColor:
                "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
              borderColor: "#000",
              items: CollLocation,
            },
            add: true,
          });
        }
      });
      this.selectedCollections = [];
    } else {
      setTimeout(
        () => this.getLocationsOfCollections(this.selectedCollections),
        100
      );
    }
  }

  @Watch("searchCollection")
  async onSearchCollection(val: string | null) {
    this.isSearching = true;
    this.collectionSearchHasNextPage = false;
    this.collectionSearchCurrentPage = 1;
    if (val !== null && val.trim() !== "") {
      const searchResult = await searchCollections(val);
      this.collectionSearchHasNextPage = searchResult.next !== null;
      if (searchResult.results.length === 0) {
        this.collectionSearchHasNextPage = false;
        this.collectionSearchItems = [];
      } else {
        this.collectionSearchItems = this.sortByTerm(
          searchResult.results.map((x) => ({ ...x, text: x.name })),
          val
        );
      }
    } else {
      this.collectionSearchHasNextPage = false;
      this.collectionSearchItems = [];
    }
    this.isSearching = false;
  }

  toggleSelectedCollShowAll() {
    this.showAlleBelege = !this.showAlleBelege;
    if (this.showAlleBelege) {
      // if all showAlleBelege was clicked, all temp_coll entries should be deselected
      if (this.temp_coll.length > 0) {
        this.temp_coll.forEach((item) => {
          item.selected = false;
        });
      }
      // if all showAlleBelege was clicked, all temp_coll entries should be deselected
      if (this.wboe_coll.length > 0) {
        this.wboe_coll.forEach((item) => {
          item.selected = false;
        });
      }
    } else {
      // will get to this condition only if there exists a wboe or temp_coll, because the btn is otherwise disabled
      this.temp_coll.forEach((item) => {
        item.selected = true;
      });

      this.wboe_coll.forEach((item) => {
        item.selected = true;
      });
    }
  }

  @Watch("wboe_coll", { deep: true })
  cancelShowAlleBelegeWboe() {
    if (this.wboe_coll.length > 0) {
      if (this.wboe_coll.filter((item) => item.selected).length > 0) {
        this.showAlleBelege = false;
      }
    }
  }

  @Watch("temp_coll", { deep: true })
  cancelShowAlleBelegeTemp() {
    if (this.temp_coll.filter((item) => item.selected).length > 0) {
      this.showAlleBelege = false;
    }
  }

  deleteCol(col: Collection) {
    if (col.preColl !== -1) {
      stateProxy.collections.addWBOE_coll({ changedColl: col, add: false });
    } else {
      stateProxy.collections.removeTemp_coll({ changedColl: col });
    }
  }

  //potential Improvement: Levenshtein
  sortByTerm(data: any, term: any) {
    return data.sort(function (a: any, b: any) {
      return a.name.toLowerCase().indexOf(term) <
        b.name.toLowerCase().indexOf(term)
        ? -1
        : 1;
    });
  }

  addCollection() {
    let newColl: Collection = {
      id: Math.random() * 1000,
      preColl: -1,
      collection_name: "Sammlung " + stateProxy.collections.collectionNameNr,
      editing: true,
      fillColor: "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
      borderColor: "#000",
      selected: true,
      items: [],
    };
    stateProxy.collections.addTemp_coll({ changedColl: newColl });
    this.showAlleBelege = true;
  }

  addBelegeToCollection(col: Collection, add_to: Collection) {
    stateProxy.collections.addPlacesToCollection({
      col: add_to.id,
      items: col.items,
    });
  }

  createCopyColl(col: Collection) {
    let newColl: Collection = {
      id: Math.random() * 1000,
      preColl: -1,
      collection_name: "temporär " + col.collection_name,
      editing: true,
      fillColor: "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
      borderColor: "#000",
      selected: true,
      items: col.items,
    };
    stateProxy.collections.addTemp_coll({ changedColl: newColl });
  }

  saveXLSX(col: Collection) {
    var localItems: any[] = this.editValuesForExport(col); // _.cloneDeep(col.items); // creating a deep copy

    const x = xlsx.utils.json_to_sheet(localItems);
    const y = xlsx.writeFile(
      {
        Sheets: { sheet: x },
        SheetNames: ["sheet"],
      },
      "wboe-lioe-export-collection-" + col.collection_name + ".xlsx"
    );
    localItems = [];
  }

  saveCSV(col: Collection) {
    var localItems: any[] = this.editValuesForExport(col);

    const x = xlsx.utils.json_to_sheet(localItems);
    const y = xlsx.writeFile(
      {
        Sheets: { sheet: x },
        SheetNames: ["sheet"],
      },
      "wboe-lioe-export-" + col.collection_name + ".csv"
    );
  }

  saveJSON(col: Collection) {
    var localItems: any[] = this.editValuesForExport(col);

    const blob = JSON.stringify(localItems, undefined, 2);
    FileSaver.saveAs(
      new Blob([blob]),
      "wboe-lioe-export-collection" + col.collection_name + ".json"
    );
  }

  editValuesForExport(col: Collection): any[] {
    var localSelect: any[] = _.cloneDeep(col.items); // creating a deep copy

    localSelect.forEach((x) => {
      // excluding the colSources, entry, Bundesland and Großregion from the exported sheet
      delete x["colSources"];
      delete x["entry"];
      delete x["Bundesland"];
      delete x["Großregion"];
      for (var key in x) {
        if (Array.isArray(x[key])) {
          x[key] = x[key].join(" ");
        }
        switch (key) {
          case "Kleinregion1":
            x[key] = regions.mapKleinreg(
                  x[key]
                  .replace(/\d[A-Z]?[\.]\d[a-z]/g, "")
                  .replace(/[›]?[L|K]T[\d]?/g, "")
                  .replace(/ ,/g, ",")
                ).trim() + " (" + x[key] + ")";
            break;
          case "Großregion1":
            x[key] = regions.mapGrossreg(
                  x[key]
                  .replace(/\d[A-Z]?[\.]\d/g, "")
                  .replace(/[›]?[L|K]T[\d]?/g, "")
                  .replace(/ ,/g, ",")
                ).trim() + " (" + x[key] + ")";
            break;
          case "Bundesland1":
            x[key] = regions.mapBundeslaender(
                  x[key]
                  .replace(/\d[A-Z]?[\.]?[\d]?/g, "")
                  .replace(/[›]?[L|K]T[\d]?/g, "")
                  .replace(/ ,/g, ",")
                ).trim() + " (" + x[key] + ")";
            break;
          case "Gemeinde1":
            x[key] = x[key]
              .replace(/\d[A-Z]?[\.]\d[a-z]\d\d/g, "")
              .replace(/[›]?[L|K]T[\d]?/g, "");
            break;
          case "HL":
            if (Array.isArray(x[key]) && x[key].length > 1) {
              x[key] = x[key][1].replace("≈", "");
            }
            break;
          case "BD/KT":
            const bd: string[] = [];
            for (let i = 1; i < 10; i += 1) {
              const b = x[`GRAM/LT${i}`];
              if (!b) {
                continue;
              }
              bd.push(b);
            }
            const bdnew: string[] = [];
            for (let i = 0; i < bd.length; i += 1) {
              bdnew.push(bd[i][0]);
            }
            x[key] = _(bdnew).flatten().join(", ");
            break;
          case "NR":
            if (x[key]) {
              const fragenummerRegex = /.* (\(.*\)){0,1}:/;
              if (Array.isArray(x[key])) {
                x[key] = x[key].map((n: string) => {
                  const m = n.match(fragenummerRegex);
                  return m ? m[0] : null;
                });
              } else {
                const m = x[key].match(fragenummerRegex);
                return m ? m[0] : "";
              }
              x[key] = _(x[key].filter((n: any) => n)).flatten();
            }
            break;
          case "NR2":
            if (x[key]) {
              const fragenummerRegex = /.*(\(.*\)){0,1}:/;
              if (Array.isArray(x[key])) {
                x[key] = x[key][0].replace(fragenummerRegex, "");
              } else {
                x[key] = x[key].replace(fragenummerRegex, "");
              }
            }
            break;
          case "LT1_teuthonista":
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
              if (Array.isArray(x[t]) && x[t].length > 0) {
                res.push(x[t][0]);
              } else if (x[t]) {
                res.push(x[t]);
              }
            });
            x[key] = _(res).flatten().join(", ");
            break;
          case "BD/LT*":
            if (x[key]) {
              const regexSources = /[≈›|›|≈]?LT\d?/g;
              if (Array.isArray(x[key])) {
                x[key] = x[key][0]
                  .replace(regexSources, "")
                  .replace(/(  )( )*/g, " ");
              } else {
                x[key] = x[key]
                  .replace(regexSources, "")
                  .replace(/(  )( )*/g, " ");
              }
            }
            break;
          case "BD/KT1":
            const kts = [
              "KT1",
              "KT2",
              "KT3",
              "KT4",
              "KT5",
              "KT6",
              "KT7",
              "KT8",
            ];
            const tmp: string[] = [];
            kts.forEach((t) => {
              if (Array.isArray(x[t]) && x[t].length > 0) {
                tmp.push(x[t][0]);
              } else if (x[t]) {
                tmp.push(x[t]);
              }
            });
            x[key] = _(tmp)
              .flatten()
              .join(", ")
              .replace(/(  )( )*/g, " ");
            break;
          case "BD/KT*":
            if (x[key]) {
              const regexSources = /›KT\d/;
              if (Array.isArray(x[key])) {
                var i;
                for (i = 0; i < x[key].length; i++) {
                  x[key][i] = x[key][i]
                    .replace(regexSources, "")
                    .replace(/(  )( )*/g, " ");
                }
                x[key] = _(x[key]).flatten();
              } else {
                x[key] = x[key]
                  .replace(regexSources, "")
                  .replace(/(  )( )*/g, " ");
              }
            }
            break;
          case "Sigle1":
            x[key] = x[key].trim().replace(/[›]?[L|K]T[\d]?/g, "");
          case "KT1":
            x[key] = x[key].replace(/(  )( )*/, " ");
          default:
            break;
        }
      }
    });
    return localSelect;
  }
}
</script>
<style lang="scss" scoped>
.close-btn {
  position: absolute;
  right: 12px;
  top: 12px;
}

.v-btn {
  letter-spacing: 0;
  text-transform: none;
}

.export-btn {
  font-size: 13px;
}
</style>
