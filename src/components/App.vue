<template>
  <v-app>
    <v-main>
      <v-container fill-height class="py-0 px-2" app>
        <v-layout column>
          <v-flex class="header-navigation pb-3">
            <v-layout>
                <v-flex xs12 :class="['text-center', 'logo-container', $route.name === 'maps' && 'logo-hidden']">
                  <router-link to="/"><img  class="logo mt-5" src="/assets/images/logo.svg"
                    height="100" width="250" /></router-link>
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
                <v-tab to="/" id="tabHome"><div><v-icon color="white">mdi-home-outline</v-icon>Home</div></v-tab>
                <v-tab to="/articles"  id="tabWBOE"><div><v-icon color="white">mdi-newspaper</v-icon>WBÖ-Artikel</div></v-tab>
                <v-tab to="/db" id="tabBelegDB"><div><v-icon color="white">mdi-database</v-icon>Belegdatenbank</div></v-tab>
                <v-tab to="/maps" id="tabMap"><div><v-icon color="white">mdi-map</v-icon>Kartierung</div></v-tab>
                <v-tab to="/resources" id="tabInformationen"><div><v-icon color="white">mdi-information-variant</v-icon>Informationen</div></v-tab>
              </v-tabs>
            </v-flex>
          </v-flex>
          <v-flex xs12 fill-height class="pa-3">
            <keep-alive>
              <router-view />
            </keep-alive>
          </v-flex>
          <lioe-footer id="logo" v-if="$route.name !== 'maps'"/>
          <notifications-module/>
        </v-layout>
      </v-container>
      <CookieNotification/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { articleStore } from '@/store/articles-store';
import { initMatomoTracking } from '@/utilities/trackingHelpers';
import { Vue, Component } from 'vue-property-decorator'
import { initialize as initGeo } from '@/store/geo'
import CookieNotification from '@/components/GeneralComponents/Tracking/CookieNotification.vue';
import LioeFooter from '@/components/LioeFooter.vue'
import NotificationsModule from '@/components/NotificationsModule.vue'

@Component({
  components: {
    CookieNotification,
    LioeFooter,
    NotificationsModule
  }
})
export default class App extends Vue {

  created() {
    initMatomoTracking()
  }

  async mounted() {
    initGeo();
    articleStore.articles.fetchArticles();
  }
}
</script>

<style>
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
    color: var(--v-primary-base,#3b89a0)!important;
    background: rgba(255,255,255,.6)
  }
  .active-tab .v-icon{
    color: var(--v-primary-base,#3b89a0)!important;
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
.v-step[data-v-54f9a632]{
    background: var(--v-ci-base, #3B89A0);
}
.v-step__arrow--dark[data-v-54f9a632]:before{background:var(--v-secondary-base,#2C6374)}
.v-step__header[data-v-54f9a632]{
    background-color: var(--v-secondary-base, #2C6374);
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

/* Needed to disable the click prevention from the tour */
body.v-tour--active {
  pointer-events: auto!important;
}

</style>

<style lang="scss" scoped>
.tabs-top{
  overflow: hidden;
  border-radius: 5px;
}
.v-tabs ::v-deep .v-item-group:not(.v-tabs-bar--is-mobile) .v-tab > div {
  padding-top: 4px;
}
.v-tab .v-icon{
  margin-top: -4px;
  margin-right: 10px;
  font-size: 30px;
}
.v-tabs ::v-deep .v-tabs-bar--is-mobile .v-tab .v-icon{
  display: block;
  margin-top: 0;
  margin-right: 0;
  margin-bottom: 5px;
}
.v-tabs ::v-deep .v-tabs-bar.v-tabs-bar--is-mobile {
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

