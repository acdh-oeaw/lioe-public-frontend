<template>
  <vContainer>
    <v-list dense>
      <v-list-item dense>
        <v-list-item-content>
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
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list dense class="listHeight-s listHeight-m listHeight-l">
      <v-list-item
        dense
        v-for="gC in geoCollections"
        :key="gC.id"
        @click="selectedCollLocal = gC.id"
      >
        <v-list-item-action style="width: 0px">
          <div v-if="gC.id === selectedCollLocal" id="marker">.</div>
        </v-list-item-action>
        <v-list-item-content style="margin-right: 30px">
          <v-text-field
            v-if="gC.editing === true"
            @blur="
              gC.editing = false;
              safeCollectionsInURL();
            "
            @keypress.enter="
              gC.editing = false;
              safeCollectionsInURL();
            "
            v-model="gC.collection_name"
            autofocus
          ></v-text-field>
          <v-list-item-title v-else>
            {{ gC.collection_name }}
            <span
              class="mdi mdi-pencil"
              id="editLegendEntry"
              @click="gC.editing = true"
            >
            </span>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-menu :close-on-content-click="false" offset-y top>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                class="legendeButtons"
                :color="gC.fillColor"
                elevation="1"
                fab
                x-small
              ></v-btn>
            </template>
            <v-color-picker hide-inputs v-model="gC.fillColor"></v-color-picker>
          </v-menu>
        </v-list-item-action>
        <v-list-item-action>
          <v-menu :close-on-content-click="false" offset-y top>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                class="legendeButtons"
                :color="gC.borderColor"
                elevation="1"
                fab
                x-small
              ></v-btn>
            </template>
            <v-color-picker
              hide-inputs
              v-model="gC.borderColor"
            ></v-color-picker>
          </v-menu>
        </v-list-item-action>
        <v-list-item-action>
          <v-btn
            icon
            small
            class="legendeButtons"
            @click="removeCollection(gC.id)"
          >
            <v-icon>mdi-window-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-list dense>
      <v-list-item>
        <v-list-item-content>
          <v-btn depressed small @click="newCollection">
            Neue Sammlung anlegen
            <v-icon style="margin-left: 10px">mdi-plus-thick</v-icon>
          </v-btn>
        </v-list-item-content>
        <v-list-item-action>
          <save-link></save-link>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </vContainer>
</template>

<script lang="ts">
import { getDocumentsByCollection, searchCollections } from "@src/api";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import SaveLink from "@components/LinkSaveDialog.vue";

@Component({
  // if you use components add them here
  components: {
    SaveLink,
  },
  /* name is necessary for recursive components
   * (at least in older versions, might be auto generated through the vue-property-decorator)
   */
  name: "MapLegende",
})
export default class MapLegende extends Vue {
  @Prop() geoCollections: Object[];

  selectedCollLocal: Number = 0;
  collectionSearchItems: any[] = [];
  selectedCollections: any[] = [];
  searchCollection: string | null = null;

  newCollection() {
    const newID = Math.random() * 1000;
    this.geoCollections.push({
      id: newID,
      tempColl: -1,
      collection_name: "Unbenannte Sammlung",
      editing: false,
      fillColor: "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
      borderColor: "#000",
      items: [],
    });
    this.selectedCollLocal = newID;
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
      this.geoCollections.forEach((CollInGeo) => {
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
        this.geoCollections.push({
          id: Math.random() * 1000,
          tempColl: coll,
          collection_name: collName,
          editing: false,
          fillColor:
            "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
          borderColor: "#000",
          items: CollLocation,
        });
        this.safeCollectionsInURL();
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

  @Watch("selectedCollLocal")
  emitNewSelectedColl() {
    this.$emit("interface", this.selectedCollLocal);
  }

  //@Watch("geoCollections.length")
  /*setCurrentCollectionToTheCorrectOne() {
    //@ts-ignore
    this.selectedCollLocal = this.geoCollections[this.geoCollections.length-1].id;
  }*/

  removeCollection(coll: String) {
    let deletedColl = -1;
    let deletedCollModel = -1;
    let deleteCollID = "";
    this.geoCollections.forEach((CollInGeo) => {
      //@ts-ignore
      if (coll === CollInGeo.id) {
        deletedColl = this.geoCollections.indexOf(CollInGeo);
        //@ts-ignore
        deleteCollID = CollInGeo.tempColl;
      }
    });
    deletedCollModel = this.selectedCollections.indexOf(deleteCollID);
    if (deletedColl > -1) {
      this.geoCollections.splice(deletedColl, 1);
      this.selectedCollections.splice(deletedCollModel, 1);
    }
    if (this.geoCollections.length < 1) {
      this.geoCollections.push({
        id: 0,
        tempColl: -1,
        collection_name: "Unbenannte Sammlung",
        editing: false,
        fillColor:
          "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
        borderColor: "#000",
        items: [],
      });
    }
    //@ts-ignore
    this.selectedCollLocal = this.geoCollections[this.geoCollections.length-1].id;
    this.$emit("interface", this.selectedCollLocal);
    this.safeCollectionsInURL();
  }

  safeCollectionsInURL() {
    if (this.geoCollections.length === 0) {
      this.$router.replace({ query: {} });
    } else {
      this.$router.replace({
        query: { col: JSON.stringify(this.geoCollections) },
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

#editLegendEntry {
  font-size: large;
  margin-left: 7px;
}

#editLegendEntry:hover {
  cursor: pointer;
}

#marker {
  width: 5px;
  height: fit-content;
  background-color: #3b89a0;
  color: #3b89a0;
}

@media only screen and (min-height: 10px) {
  .listHeight-s {
    overflow-y: scroll;
    max-height: 10vh;
  }
}

@media only screen and (min-height: 700px) {
  .listHeight-s {
    overflow-y: scroll;
    max-height: 23vh;
  }
}

@media only screen and (min-height: 900px) {
  .listHeight-m {
    overflow-y: scroll;
    max-height: 40vh;
  }
}

@media only screen and (min-height: 1000px) {
  .listHeight-l {
    overflow-y: scroll;
    max-height: 40vh;
  }
}

.legendeButtons {
  margin-left: 5px;
  margin-right: 5px;
}
</style>
