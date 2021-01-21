<template>
  <vContainer>
    <v-list
      v-if="geoCollections.length > 0"
      dense
      class="list listHeight-s listHeight-m listHeight-l"
    >
      <draggable
        v-model="geoCollections"
        group="collections"
        @start="drag = true"
        @end="drag = false"
      >
        <v-list-item v-for="gC in geoCollections" :key="gC.id">
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
              <v-color-picker
                hide-inputs
                v-model="gC.fillColor"
              ></v-color-picker>
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
        </v-list-item>
      </draggable>
    </v-list>
  </vContainer>
</template>

<script lang="ts">
import { getDocumentsByCollection, searchCollections } from "@src/api";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { stateProxy, Collection } from "../store/collections";
import SaveLink from "@components/LinkSaveDialog.vue";
import draggable from "vuedraggable";

@Component({
  // if you use components add them here
  components: {
    SaveLink,
    draggable,
  },
  /* name is necessary for recursive components
   * (at least in older versions, might be auto generated through the vue-property-decorator)
   */
  name: "MapLegende",
})
export default class MapLegende extends Vue {
  selectedCollLocal: Number = 0;

  get temp_coll() {
    return stateProxy.collections.temp_coll;
  }

  get wboe_coll() {
    return stateProxy.collections.wboe_coll;
  }

  get geoCollections() {
    let allItems: Collection[];
    allItems = [
      ...stateProxy.collections.temp_coll,
      ...stateProxy.collections.wboe_coll,
    ];
    return allItems.filter(this.checkIfSelected);
  }

  checkIfSelected(coll: Collection) {
    if (coll.selected) {
      return true;
    }
    return false;
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

.list {
  margin: 0;
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
</style>
