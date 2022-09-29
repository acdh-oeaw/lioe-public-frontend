<template>
  <div>
    <v-flex xs12 :style="fstyle" v-if="show">
      <v-card>
        <v-card-text class="pa-5" primary-title>
          <div class="close-btn">
            <v-btn @click="show = false" small text icon><v-icon dark>close</v-icon></v-btn>
          </div>
          <slot/>
        </v-card-text>
      </v-card>
    </v-flex>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getWebsiteHtml, isExternUrl, isLocalUrl } from '../api'

@Component

export default class InfoBox extends Vue {
  @Prop({ default: null }) fstyle: string|null
  show: boolean = true
}
</script>
<style lang="scss" scoped>
.close-btn {
  position: absolute;
  right: 12px;
  top: 12px;
}
</style>
