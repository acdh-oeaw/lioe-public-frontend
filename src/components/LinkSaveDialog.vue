<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="500"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          depressed 
          color="accent" 
          dark
          v-bind="attrs"
          v-on="on"
        >
          Auswahl teilen
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline grey lighten-2">
          URL kopieren
        </v-card-title>

        <v-divider></v-divider>

        <v-card-actions>
          <v-text-field
            label="URL"
            v-model="contentURL"
          ></v-text-field>
          <v-btn style="margin-left:15px;" icon small @click="doCopy()">
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard);

@Component({
  // if you use components add them here
  components: { },
  /* name is necessary for recursive components
   * (at least in older versions, might be auto generated through the vue-property-decorator)
   */
  name: 'SaveLink',
})
export default class SaveLink extends Vue {
  dialog: boolean = false
  contentURL:any;
  baseURL:String = "https://lioe-test.dioe.at"; // TODO change in master


  @Watch('$route.fullPath')
  changeURL() {
    this.contentURL = this.baseURL + this.$route.fullPath
  }

  beforeMount() {
    this.contentURL = this.baseURL + this.$route.fullPath
  }
  
  doCopy() {
    // @ts-ignore
    navigator.clipboard.writeText(this.baseURL + this.$route.fullPath);
  }
}

</script>
<style lang="scss" scoped>
</style>
