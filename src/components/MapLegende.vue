<template>
  <vContainer>
    <v-list dense id="legende" v-if="geoCollections.length > 0">
        <v-list-item dense>
          <v-list-item-content>
            <v-btn depressed small @click="title = !title">
              <span v-if="title">Titel</span>
              <span v-else>Beschreibung</span>
              <v-icon style="margin-left:10px;">mdi-swap-horizontal</v-icon>
            </v-btn>
          </v-list-item-content>
        </v-list-item>
        <v-list-item dense
          v-for="gC in geoCollections"
          :key="gC.collection"
        >
          <v-list-item-action>
            <v-btn class="legendeButtons" icon small @click="removeCollection(gC.collection)">
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-if="title">{{ gC.name }}</v-list-item-title>
            <v-list-item-title v-else> {{ gC.description }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-menu :close-on-content-click="false" offset-y top>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" :color="gC.color" elevation="1" fab x-small></v-btn>
              </template>
               <v-color-picker @input="updateColor" hide-inputs v-model="gC.color"></v-color-picker>
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
export default class ShowCaseComponent extends Vue {
  @Prop(String) readonly msg: String | undefined;

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
