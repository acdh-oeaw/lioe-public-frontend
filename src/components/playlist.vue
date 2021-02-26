<template>
  <div class="fill-height">
    <v-flex class="fill-height" xs12>
      <v-card class="fill-height d-flex flex-column" elevation="0">
        <v-card-title>
          <v-text-field
            placeholder="Sammlungen filtern..."
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
            <v-list-item :disabled="onMapPage" @click="showAlleBelege = !showAlleBelege">
              <v-list-item-action>
                <v-checkbox
                  :disabled="onMapPage"
                  v-model="showAlleBelege"
                  color="primary"
                />
              </v-list-item-action>
              <v-list-item-content>
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
                    item.collection_name.toLowerCase().includes((this.filterCollection.toLowerCase() == null) ? '' : this.filterCollection.toLowerCase())
                  )"
                  :key="i"
                  @click="switchShow(item)"
                >
                  <v-list-item-action>
                    <v-checkbox
                      v-model="item.selected"
                      @click.prevent=""
                      color="primary"
                    ></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title
                      v-if="item.editing === false"
                      v-text="item.collection_name"
                    ></v-list-item-title>
                    <v-text-field
                      dense
                      v-if="item.editing === true"
                      @keypress.enter="item.editing = false"
                      @blur="item.editing = false"
                      v-model="item.collection_name"
                      autofocus
                    ></v-text-field>
                  </v-list-item-content>
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
                        <v-list-item>
                          <v-list-item-title @click="item.editing = true"
                            >Umbennenen</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title @click="deleteCol(item)"
                            >Löschen</v-list-item-title
                          >
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </v-list-item>
              </draggable>
            </v-list-item-group>
          </v-list>
          <v-btn
            color="primary"
            depressed
            @click="addCollection()"
            style="width: 98%; margin: 0 auto"
          >
            Sammlung anlegen
          </v-btn>
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
                    item.collection_name.toLowerCase().includes((this.filterCollection.toLowerCase() == null) ? '' : this.filterCollection.toLowerCase())
                  )"
                  @click="switchShow(item)"
                  :key="i"
                >
                  <v-list-item-action>
                    <v-checkbox
                      :input-value="item.selected"
                      @click.prevent=""
                      color="primary"
                    ></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title
                      v-text="item.collection_name"
                    ></v-list-item-title>
                  </v-list-item-content>
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
                        <v-list-item>
                          <v-list-item-title @click="deleteCol(item)"
                            >Löschen</v-list-item-title
                          >
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
              <v-list-item>
                <v-list-item-title>
                  Zu tippen beginnen, um nach Sammlungen zu suchen
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-slot:item="{ item }">
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="item.description"
                ></v-list-item-subtitle>
              </v-list-item-content>
            </template>
            <template v-slot:selection="{ item }">
              <span v-if="false"> {{ item.text }} </span>
            </template>
          </v-autocomplete>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn block v-if="onMapPage" elevation="0">
            <v-icon left>mdi-database</v-icon>
            In Datenbank zeigen
          </v-btn>
          <v-btn block v-else elevation="0">
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
import draggable from "vuedraggable";

@Component({
  components: {
    draggable,
  },
})
export default class Playlist extends Vue {
  @Prop() onMapPage: Boolean;
  collectionSearchItems: any[] = [];
  selectedCollections: any[] = [];
  searchCollection: string | null = null;
  filterCollection: string = "";

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

  @Watch("selectedCollections")
  async selectCollections() {
    if (this.selectedCollections.length > -1) {
      await this.getLocationsOfCollections(this.selectedCollections);
    }
  }

  switchShow(item: Collection) {
    if (item.editing === false) {
      stateProxy.collections.swapShow(item);
    }
  }

  async getLocationsOfCollections(colls: any[]) {
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
  }

  @Watch("searchCollection")
  async onSearchCollection(val: string | null) {
    if (val !== null && val.trim() !== "") {
      this.collectionSearchItems = (await searchCollections(val)).map((x) => ({
        ...x,
        text: x.name,
      }));
    }
  }

  deleteCol(col: Collection) {
    if (col.preColl !== -1) {
      stateProxy.collections.addWBOE_coll({ changedColl: col, add: false });
    } else {
      stateProxy.collections.addTemp_coll({ changedColl: col, add: false });
    }
  }

  addCollection() {
    let newColl: Collection = {
      id: Math.random() * 1000,
      preColl: -1,
      collection_name: "Neue Sammlung",
      editing: false,
      fillColor: "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
      borderColor: "#000",
      selected: true,
      items: [],
    };
    stateProxy.collections.addTemp_coll({ changedColl: newColl, add: true });
  }
}
</script>
<style lang="scss" scoped>
.close-btn {
  position: absolute;
  right: 12px;
  top: 12px;
}

.v-btn{
  letter-spacing: 0;
  text-transform: none;
}
</style>
