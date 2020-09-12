<template>
  <vContainer>
    <v-list dense>
        <v-list-item dense>
          <v-list-item-content>
            <v-btn depressed small @click="newCollection">
              Neue Sammlung anlegen
              <v-icon style="margin-left:10px;">mdi-plus-thick</v-icon>
            </v-btn>
          </v-list-item-content>
        </v-list-item>
        <v-list-item dense
          v-for="gC in geoCollections"
          :key="gC.collection"
        >
          <v-list-item-action>
            <v-btn class="legendeButtons" icon small @click="removeCollection(gC.collection_name)">
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-content style="margin-right:30px">
            <v-list-item-title>{{ gC.collection_name }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-menu :close-on-content-click="false" offset-y top>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" :color="gC.fillColor" elevation="1" fab x-small></v-btn>
              </template>
               <v-color-picker hide-inputs v-model="gC.fillColor"></v-color-picker>
            </v-menu>
          </v-list-item-action>
          <v-list-item-action>
            <v-menu :close-on-content-click="false" offset-y top>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" :color="gC.borderColor" elevation="1" fab x-small></v-btn>
              </template>
               <v-color-picker hide-inputs v-model="gC.borderColor"></v-color-picker>
            </v-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list>
  </vContainer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  // if you use components add them here
  components: { },
  /* name is necessary for recursive components
   * (at least in older versions, might be auto generated through the vue-property-decorator)
   */
  name: 'MapLegende',
})
export default class MapLegende extends Vue {
  @Prop() geoCollections: Object[];

  selectedCollLocal:Number = 0;

  newCollection() {
    this.geoCollections.push(
      {
        collection_name: "Neue Sammlung " + (this.geoCollections.length + 1),
        fillColor: '#' + Math.floor(Math.random() * 16777215).toString(16) + '99',
        borderColor: '#000',
        items: [
        ]
      }
    )
    this.selectedCollLocal = this.geoCollections.length - 1;
    this.$emit('interface', this.selectedCollLocal)
  }

  removeCollection(coll: String) {
    let deletedColl = -1;
    this.geoCollections.forEach(CollInGeo => {
      //@ts-ignore
        if(coll === CollInGeo.collection_name) {
          deletedColl = this.geoCollections.indexOf(CollInGeo);
        }
    });
    if(deletedColl > -1){
      this.geoCollections.splice(deletedColl, 1);
    }
    this.selectedCollLocal = this.geoCollections.length - 1;
    this.$emit('interface', this.selectedCollLocal)
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
</style>
