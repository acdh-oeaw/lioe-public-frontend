<template>
  <vContainer>
    <div id="list_legy" v-if="geoCollections.length > 0">
      <div style="text-align:center; width: fill;">
      <b>Legende</b>
      </div>
      <v-list
        dense
        class="legend_items list listHeight-s listHeight-m listHeight-l"
      >
        <draggable
          v-model="geoCollections"
          group="collections"
          @start="drag = true"
          @end="drag = false"
        >
          <v-list-item
            class="legend_items"
            v-for="gC in geoCollections"
            :key="gC.id"
          >
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
              <div :color="gC.borderColor" style="width: 18px; height: 18px">
                <v-menu
                  :close-on-content-click="false"
                  offset-y
                  top
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      :color="gC.borderColor"
                      elevation="1"
                      fab
                      style="width: 18px; height: 18px; margin-bottom: 20px"
                    >
                      <v-btn
                        :color="gC.fillColor"
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
                      v-model="gC.borderColor"
                    ></v-color-picker>
                    Farbe des Inhalts
                    <v-color-picker
                      hide-inputs
                      v-model="gC.fillColor"
                    ></v-color-picker>
                  </div>
                </v-menu>
              </div>
            </v-list-item-action>
          </v-list-item>
        </draggable>
      </v-list>
    </div>
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
    return allItems.filter((el: any) => {
      return el.selected;
    });
  }

  set geoCollections(colls: Collection[]) {}
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
    overflow-y: auto;
    max-height: 10vh;
  }
}

@media only screen and (min-height: 700px) {
  .listHeight-s {
    overflow-y: auto;
    max-height: 23vh;
  }
}

@media only screen and (min-height: 900px) {
  .listHeight-m {
    overflow-y: auto;
    max-height: 40vh;
  }
}

@media only screen and (min-height: 1000px) {
  .listHeight-l {
    overflow-y: auto;
    max-height: 40vh;
  }
}

.legend_items {
  background-color: rgba($color: #ddeeff, $alpha: 0);
}

#list_legy {
  background-color: rgba($color: #fff, $alpha: 0.8);
  padding: 5px;
  border-radius: 2.5px;
}

#menuItem {
  padding: 5px;
  background-color: rgba($color: #fff, $alpha: 0.8);
  text-align: left;
}
</style>
