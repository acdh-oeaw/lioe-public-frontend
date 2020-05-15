<template>
  <v-expansion-panel-content>
    <v-layout slot="header">
      <v-flex xs12>
        <b>{{ title }}</b>
      </v-flex>
      <v-flex>
        <v-menu open-on-hover v-if="infoUrl" max-width="400" max-height="95vh" top left>
          <v-icon class="mr-3" slot="activator">info_outline</v-icon>
          <info-text class="elevation-24 pa-4 white" :path="infoUrl" />
          <v-btn @click="showDetails = true" block color="ci" class="ma-0" dark v-if="extInfoUrl">Weitere Informationen</v-btn>
        </v-menu>
      </v-flex>
      <v-dialog v-model="showDetails" max-width="1000" color="#2b2735" scrollable v-if="extInfoUrl">
        <v-card flat class="fill-height pa-4">
          <div class="close-btn">
            <v-btn @click="showDetails = false" flat icon><v-icon dark>close</v-icon></v-btn>
          </div>
          <v-card-text class="pa-0 fill-height">
            <info-text class="pa-4 white fill-height" :path="extInfoUrl" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-card class="article-xml">
      <v-card-text class="pl-4 pt-1 pr-4 pb-4">
        <slot />
      </v-card-text>
    </v-card>
  </v-expansion-panel-content>
</template>

<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import InfoText from '@components/InfoText.vue'

@Component({
  components: {
    InfoText
  }
})
export default class ArticleFragementPanel extends Vue {

  @Prop() title: string|null
  @Prop() infoUrl: string|null
  @Prop() extInfoUrl: string|null

  showDetails = false

}
</script>
<style lang="scss" scoped>
.close-btn {
  position: absolute;
  right: 0;
}
.article-xml {
  font-size: 100%;
}
</style>
