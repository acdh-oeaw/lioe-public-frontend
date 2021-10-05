<template>
  <v-app>
    <v-content>
      <v-container fill-height class="py-0 px-2" app>
        <v-layout column>
          <v-flex class="header-navigation pb-3">
            <!-- <v-flex class="text-xs-right" xs12>
              <v-btn class="text-no-transform" color="grey" small rounded text>test</v-btn>
              <v-btn class="text-no-transform" color="grey" small rounded text>test</v-btn>
            </v-flex> -->
            <v-layout>
                <v-flex xs12 :class="['text-center', 'logo-container', $route.name === 'maps' && 'logo-hidden']">
                  <router-link to="/"><img  class="logo mt-5" src="/static/img/logo.svg" 
                    height="100" width="250" /></router-link>
                  <!-- <div class="project-name">Lexikalisches Informationssystem Österreich</div> -->
                </v-flex>
            </v-layout>
          </v-flex>
          <v-flex class="pl-3 pr-3 header-navigation">
            <v-flex>
              <v-tabs
                show-arrows
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
                <v-tab to="/"><div><v-icon color="white">mdi-home-outline</v-icon>Home</div></v-tab>
                <v-tab to="/articles"><div><v-icon color="white">mdi-newspaper</v-icon>WBÖ-Artikel</div></v-tab>
                <v-tab to="/db" id="tabs"><div><v-icon color="white">mdi-database</v-icon>Belegdatenbank</div></v-tab>
                <v-tab to="/maps"><div><v-icon color="white">mdi-map</v-icon>Karten</div></v-tab>
                <v-tab to="/resources"><div><v-icon color="white">mdi-folder-open</v-icon>Materialien</div></v-tab>
              </v-tabs>
            </v-flex>
          </v-flex>
          <v-flex xs12 fill-height class="pa-3">
            <keep-alive>
              <router-view />
            </keep-alive>
          </v-flex>
          <lioe-footer id="logo" v-if="$route.name !== 'maps'"/>
          <v-tour 
            name="databaseTour" 
            :steps="databaseTour_Steps" 
            :options="{ 
              useKeyboardNavigation: true,
              debug: true, // TODO: Remove
              highlight: true
            }"
          >
            <!-- <template slot-scope="tour">
              <transition name="fade">
                <v-step
                  v-if="tour.steps[tour.currentStep]"
                  :key="tour.currentStep"
                  :step="tour.steps[tour.currentStep]"
                  :previous-step="tour.previousStep"
                  :next-step="tour.nextStep"
                  :stop="tour.stop"
                  :skip="tour.skip"
                  :is-first="tour.isFirst"
                  :is-last="tour.isLast"
                  :labels="tour.labels"
                  :highlight="tour.highlight"
                >
                  <template>
                    <div slot="actions">
                      <v-btn @click="tour.previousStep" color="primary">Previous step</v-btn>
                      <v-btn @click="tour.nextStep" color="primary">Next step</v-btn>
                    </div>
                  </template>
                </v-step>
              </transition>
            </template> -->
          </v-tour>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { initialize as initGeo } from '../store/geo'
import LioeFooter from './LioeFooter.vue'

@Component({
  components: {
    LioeFooter
  }
})
export default class App extends Vue {
  mounted() {
    initGeo();
    // @ts-ignore
    this.$tours['databaseTour'].start();
  }

  databaseTour_Steps = [
    {
      target:'#dbSearchbar',
      header: {
        title: 'Suchleiste',
      },
      content: 'Hier kannst du die Belegdatenbank durchsuchen. Beachte: Dies geht nur wenn du dir alle Belege und nicht wenn du dir Sammlungen anschaust.',
      params: {
        enableScrolling: false,
        placement: 'bottom' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      }
    },
    {
      target:'#dbBelegTable',
      header: {
        title: 'Beleg Datenbank',
      },
      content: 'Hier siehst du die Belege aus allen Quellen, die du momentan ausgewählt hast (standardmäßig sind das alle Belege).',
      params: {
        enableScrolling: false,
        placement: 'top' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      }
    },
    {
      target:'#dbBelegTableRow-0',
      content: 'Das ist ein Beleg, klicke entweder auf den Eintrag oder die Checkbox um ihn aus-/abzuwählen.',
      params: {
        enableScrolling: false,
        placement: 'bottom' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      }
    },
    {
      target:'#dbPagination',
      content: 'Hier kannst du zwischen unterschiedlichen Seiten wechseln um mehr Belege anzuschauen, oder mehr Belege auf einer Seite anzuzeigen.',
      params: {
        placement: 'left' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      }
    },
    {
      target:'#dbBelegSourceBanner',
      header: {
        title: 'Beleg Quellen',
      },
      content: 'Hier siehst du aus welchen Quellen dir gerade Belege angezeigt werden.',
      params: {
        enableScrolling: false,
        placement: 'bottom' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      }
    },
    {
      target:'#dbPlaylistToggleBtn',
      content: 'Klicke hier um die Sammlungsübersicht zu öffnen.',
      params: {
        enableScrolling: false,
        placement: 'right'       
      }
    },

  ]
}
</script>

<style>
  @import 'https://fonts.googleapis.com/icon?family=Material+Icons';
  @import 'https://cdn.materialdesignicons.com/5.3.45/css/materialdesignicons.min.css';
  @import '../../node_modules/vuetify/dist/vuetify.min.css';
  @import '../styles/fonts.scss';
  @import '../styles/global.scss';
  @import '../../node_modules/vue-tour/dist/vue-tour.css'; /* Neede to make vue-tour work! */
  .tabs-top .v-slide-group__prev.v-slide-group__prev--disabled {
    display: none!important;
  }
  .header-navigation {
    z-index: 8;
  }
  .header-navigation .v-tab{
    color: #fff!important;
  }
  .active-tab{
    color: #3b89a0!important;
    background: rgba(255,255,255,.6)
  }
  .active-tab .v-icon{
    color: #3b89a0!important;
  }
  .logo-container{
    transition: .5s;
    height: 130px;
  }
  .logo-container.logo-hidden{
    overflow: hidden;
    height: 20px;
    opacity: 0;
  }
</style>
<style>
html{
  font-size: 16px;
}
.application{
  line-height: 1.6;
}
.lines{
  color: #AAA;
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
  font-size: 30px;
}
.v-tabs /deep/ .v-tabs-bar--is-mobile .v-tab .v-icon{
  display: block;
  margin-top: 0;
  margin-right: 0;
  margin-bottom: 5px;
}
.v-tabs /deep/ .v-tabs-bar.v-tabs-bar--is-mobile {
  height: 80px!important;
}
.project-name{
  margin-top: -1em;
  margin-bottom: 1em;
  font-weight: bold;
  font-size: 90%;
  opacity: .5;
}
</style>

