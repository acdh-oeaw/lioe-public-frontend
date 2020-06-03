<template>
  <v-app>
    <v-content>
      <v-container fill-height class="pa-0" app>
        <v-layout column>
          <v-flex class="header-navigation">
            <!-- <v-flex class="text-xs-right" xs12>
              <v-btn class="text-no-transform" color="grey" small rounded text>test</v-btn>
              <v-btn class="text-no-transform" color="grey" small rounded text>test</v-btn>
            </v-flex> -->
            <v-layout>
              <v-flex xs12 class="text-center">
                <router-link to="/"><img class="logo mt-2" src="/static/img/logo.svg" /></router-link>
                <div class="project-name">Lexikalisches Informationssystem Österreich</div>
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex class="pl-3 pr-3 header-navigation">
            <v-flex>
              <v-tabs
                active-class="active-tab"
                grow
                class="tabs-top"
                center-active
                centered
                background-color="ci"
                dark
                color="accent"
                hide-slider
                slider-color="white">
                <v-tab to="/"><div><v-icon>mdi-home-outline</v-icon>Home</div></v-tab>
                <v-tab to="/articles"><div><v-icon>mdi-newspaper</v-icon>WBÖ-Artikel</div></v-tab>
                <v-tab to="/maps"><div><v-icon>mdi-map</v-icon>Karten</div></v-tab>
                <v-tab to="/db"><div><v-icon>mdi-database</v-icon>Belegdatenbank</div></v-tab>
                <v-tab to="/resources"><div><v-icon>mdi-folder-open</v-icon>Materialien</div></v-tab>
              </v-tabs>
            </v-flex>
          </v-flex>
          <v-flex xs12 fill-height class="pa-3">
            <keep-alive>
              <router-view />
            </keep-alive>
          </v-flex>
          <v-flex class="pl-5 pr-5 xmt-5 pb-5 text-center footer-navigation" v-if="$route.name !== 'maps'">
            <v-divider class="ma-5" />
            <h4 class="mb-2 mt-2 grey--text">Ein Projekt von</h4>
            <v-layout align-center justify-space-around wrap>
              <a target="_blank" href="https://www.oeaw.ac.at">
                <v-img aspect-ratio="1" width="150" max-height="70" contain src="https://vawadioe.acdh.oeaw.ac.at/fileadmin/bilder/oeaw_logo_446x192.png" alt="" class="src" />
              </a>
              <a target="_blank" href="https://acdh.oeaw.ac.at">
                <v-img aspect-ratio="1" width="150" max-height="70" contain src="/static/img/acdh-ch-logo-with-text.png" alt="" class="src" />
              </a>
              <a target="_blank" href="https://www.oeaw.ac.at/acdh/vawadioe/uebersicht/">
                <v-img aspect-ratio="1" width="150" max-height="125" contain src="/static/img/logo-vawadioe.png" alt="" class="src" />
              </a>
              <a target="_blank" href="https://www.oeaw.ac.at/acdh/vawadioe/projekte/wboe/">
                <v-img aspect-ratio="1" width="150" max-height="70" contain src="https://vawadioe.acdh.oeaw.ac.at/fileadmin/bilder/wboelogo_230px_transp.png" alt="" class="src" />
              </a>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { initialize as initGeo } from '../store/geo'

@Component
export default class App extends Vue {
  mounted() {
    initGeo()
  }
}
</script>

<style>
  @import 'https://fonts.googleapis.com/icon?family=Material+Icons';
  @import '../../node_modules/vuetify/dist/vuetify.min.css';
  @import '/static/css/materialdesignicons.min.css';
  @import '../styles/fonts.scss';
  @import '../styles/global.scss';
  .tabs-top .v-slide-group__prev.v-slide-group__prev--disabled {
    display: none!important;
  }
  .v-tab{
    color: #fff!important;
  }
  .active-tab{
    color: #3b89a0!important;
    background: rgba(255,255,255,.6)
  }
  .active-tab .v-icon{
    color: #3b89a0!important;
  }
</style>
<style>
html{
  font-size: 16px;
}
.application{
  line-height: 1.6;
}
</style>

<style lang="scss" scoped>
.tabs-top{
  overflow: hidden;
  border-radius: 5px;
}
.v-tabs /deep/ .v-item-group:not(.v-tabs-bar--is-mobile) .v-tab > div {
  padding-top: 4px;
}
.v-tab .v-icon{
  margin-top: -4px;
  margin-right: 10px;
  font-size: 28px;
}
.v-tabs /deep/ .v-tabs-bar--is-mobile .v-tab .v-icon{
  display: block;
  margin-top: 0;
  margin-right: 0;
  margin-bottom: 5px;
  font-size: 50px;
}
.v-tabs /deep/ .v-tabs-bar.v-tabs-bar--is-mobile {
  height: 90px!important;
}
.project-name{
  margin-top: -1em;
  margin-bottom: 1em;
  font-weight: bold;
  font-size: 90%;
  opacity: .5;
}
</style>

