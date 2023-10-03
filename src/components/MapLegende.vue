<template>
  <vContainer>
    <div id="list_legy" v-if="geoCollections.length > 0">
      <div style="text-align: center; width: fill">
        <b>Legende</b>
      </div>
      <v-list
        dense
        class="legend_items list listHeight-s listHeight-m listHeight-l"
      >
        <v-list-item
          class="legend_items"
          v-for="gC in geoCollections"
          :key="gC.id"
        >
          <v-list-item-content style="margin-right: 30px">
            <v-list-item-title>
              {{ gC.collection_name }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <colorPickerCollections
              :borderColor.sync="gC.borderColor"
              :fillColor.sync="gC.fillColor"
              >
            </colorPickerCollections>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
  </vContainer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { stateProxy, Collection } from "@/store/collections";
import SaveLink from "@/components/LinkSaveDialog.vue";
import draggable from "vuedraggable";
import colorPickerCollections from "@/components/colorPickerCollections.vue"

@Component({
  components: {
    SaveLink,
    draggable,
    colorPickerCollections,
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
