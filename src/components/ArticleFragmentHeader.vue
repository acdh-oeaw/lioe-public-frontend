<template>
  <v-row no-gutters>
    <v-col class="header">
      {{ title }}
    </v-col>
    <v-col class="text-right" cols="1">
      <v-menu
        v-if="infoUrl"
        open-on-hover
        max-width="400"
        max-height="95vh"
        top
        left>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on" class="mr-3">info_outline</v-icon>
        </template>
        <info-text class="elevation-24 pa-4 white" :path="infoUrl" />
        <v-btn @click="showDetails = true" block color="ci" class="ma-0" dark v-if="extInfoUrl">Weitere Informationen</v-btn>
      </v-menu>
    </v-col>
    <v-dialog v-model="showDetails" max-width="1000" color="#2b2735" scrollable v-if="extInfoUrl">
      <v-card text class="fill-height pa-4">
        <div class="close-btn">
          <v-btn @click="showDetails = false" text icon><v-icon dark>close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-0 fill-height">
          <info-text class="pa-4 white fill-height" :path="extInfoUrl" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import InfoText from '@components/InfoText.vue'

@Component({
  components: {
    InfoText
  }
})
export default class ArticleFragmentHeader extends Vue {

  @Prop() title: string|null
  @Prop() infoUrl: string|null
  @Prop() extInfoUrl: string|null

  showDetails = false

}
</script>
<style lang="scss" scoped>
.header{
  font-weight: bold;
  font-size: 100%;
  line-height: 1.6em;
}
.close-btn {
  position: absolute;
  right: 0;
}
</style>
