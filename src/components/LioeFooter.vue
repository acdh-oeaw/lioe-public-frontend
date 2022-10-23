<template>
  <v-flex class="pl-5 pr-5 xmt-5 pb-5 text-center footer-navigation">
    <v-divider class="ma-5" />
    <h4 class="mb-4 mt-3 grey--text">Ein Projekt von</h4>
    <v-layout align-center justify-space-around wrap>
      <a target="_blank" href="https://www.oeaw.ac.at">
        <v-img aspect-ratio="1" width="170" max-height="70" contain src="/static/img/oeaw_logo_446x192.png" alt="" class="src" />
      </a>
      <a target="_blank" href="https://acdh.oeaw.ac.at">
        <v-img aspect-ratio="1" width="150" max-height="70" contain src="/static/img/acdh-ch-logo-with-text.png" alt="" class="src" />
      </a>
      <a target="_blank" href="https://www.oeaw.ac.at/acdh/sprachwissenschaft/projekte/wboe">
        <v-img aspect-ratio="1" width="150" max-height="70" contain src="/static/img/wboelogo_230px_transp.png" alt="" class="src" />
      </a>
      <a target="_blank" href="https://www.fwf.ac.at">
        <v-img aspect-ratio="1" width="150" max-height="70" contain src="/static/img/fwf-logo.gif" alt="" class="src" />
      </a>
      <a target="_blank" href="https://www.univie.ac.at">
        <v-img aspect-ratio="1" width="150" max-height="70" contain src="/static/img/uni-logo.png" alt="" class="src" />
      </a>
      <a target="_blank" href="https://dioe.at/">
        <v-img aspect-ratio="1" width="150" max-height="70" contain src="/static/img/logodioe.png" alt="" class="src" />
      </a>
    </v-layout>
    <div class="mt-5 text-center footer">
      <v-btn exact to="/resources?link=home%2Fimpressum%2F" small rounded text>Impressum</v-btn>
      <v-btn exact to="/resources?link=home%2Fkontakt%2F" small rounded text>Kontakt</v-btn>
      <v-btn exact to="/resources?link=home%2Fdatenschutz%2F" small rounded text>Datenschutz</v-btn>
      <v-btn :to="'/password?initial_url=' + $route.fullPath" small rounded text>Login</v-btn>
    </div>
    </v-flex>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class LioeFooter extends Vue {
  // path = this.$router.currentRoute.fullPath
  // @Watch('$route')
  // onChangeRoute(newRoute: string) {

  // }
}
</script>
<style lang="scss" scoped>
</style>
