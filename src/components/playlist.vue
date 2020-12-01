<template>
  <div>
    <v-flex xs12>
      <v-card>
        <v-card-text>
        </v-card-text>
        <v-list dense>
          <v-subheader>Mein Sammlungen</v-subheader>
          <v-list-item-group>
            <v-list-item
              v-for="(item, i) in temp_coll"
              :key="i"
            >
              <v-list-item-action>
                <v-checkbox
                  :input-value="item.selected"
                  color="primary"
                ></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title v-text="item.collection_name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-btn @click="addCollection()">
          Neue Sammlung anlegen
        </v-btn>
        <v-list dense>
          <v-subheader>WBÖ Sammlungen</v-subheader>
          <v-list-item-group>
            <v-list-item
              v-for="(item, i) in wboe_coll"
              :key="i"
            >
              <v-list-item-action>
                <v-checkbox
                  :input-value="item.selected"
                  color="primary"
                ></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title v-text="item.collection_name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-card-text>
        </v-card-text>
      </v-card>
    </v-flex>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { collections, Collection } from "../store/collections";


@Component
export default class Playlist extends Vue {
  get temp_coll() {
    if(collections.temp_coll === undefined) {
      return []
    }
    return collections.temp_coll;
  }

  get wboe_coll() {
    if(collections.wboe_coll === undefined) {
      return [];
    }
    return collections.wboe_coll;
  }

  addCollection(){
    let newColl:Collection = {
      id: Math.random() * 1000,
      preColl: -1,
      collection_name: 'Neue Sammlung',
      editing: true,
      fillColor: "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
      borderColor: "#000",
      selected: true,
      items: []
    }
    collections.addTemp_coll({changedColl:newColl, add:true})
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
