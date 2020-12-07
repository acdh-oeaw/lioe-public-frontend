<template>
  <div>
    <v-flex xs12>
      <v-card>
        <v-card-text>
          <v-list dense>
            <v-subheader>Mein Sammlungen</v-subheader>
            <v-list-item-group>
              <v-list-item v-for="(item, i) in temp_coll" :key="i">
                <v-list-item-action>
                  <v-checkbox
                    :input-value="item.selected"
                    color="primary"
                  ></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title
                    v-text="item.collection_name"
                  ></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
          <v-btn @click="addCollection()" style="width: 100%">
            Neue Sammlung anlegen
          </v-btn>
          <v-list dense>
            <v-subheader>WBÖ Sammlungen</v-subheader>
            <v-list-item-group>
              <v-list-item v-for="(item, i) in wboe_coll" :key="i">
                <v-list-item-action>
                  <v-checkbox
                    :input-value="item.selected"
                    color="primary"
                  ></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title
                    v-text="item.collection_name"
                  ></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
          <v-autocomplete
            :items="collectionSearchItems"
            v-model="selectedCollections"
            :search-input.sync="searchCollection"
            label="Zu tippen beginnen, um nach Sammlungen zu suchen"
            hide-details
            text
            dense
            prepend-inner-icon="search"
            solo
            flat
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
      </v-card>
    </v-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { stateProxy, Collection } from "../store/collections";
import { getDocumentsByCollection, searchCollections } from "@src/api";


@Component
export default class Playlist extends Vue {

  collectionSearchItems: any[] = [];
  selectedCollections: any[] = [];
  searchCollection: string | null = null;


  get temp_coll() {
    return stateProxy.collections.temp_coll;
  }

  get wboe_coll() {
    return stateProxy.collections.wboe_coll;
  }

  @Watch("selectedCollections")
  async selectCollections() {
    if (this.selectedCollections.length > -1) {
      await this.getLocationsOfCollections(this.selectedCollections);
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
        stateProxy.collections.addWBOE_coll({changedColl: {
          id: Math.random() * 1000,
          selected: true,
          preColl: coll,
          collection_name: collName,
          editing: false,
          fillColor:
            "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
          borderColor: "#000",
          items: CollLocation,
        }, add: true});
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

  addCollection() {
    let newColl: Collection = {
      id: Math.random() * 1000,
      preColl: -1,
      collection_name: "Neue Sammlung",
      editing: true,
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
</style>
