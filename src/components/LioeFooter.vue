<template>
  <v-flex class="pl-5 pr-5 xmt-5 pb-5 text-center footer-navigation">
    <v-divider class="ma-5" />
    <h4 class="mb-4 mt-3 grey--text">Ein Projekt von</h4>
    <v-layout align-center justify-space-around wrap>
      <a target="_blank" href="https://www.oeaw.ac.at">
        <v-img aspect-ratio="1" width="170" max-height="70" contain src="/assets/images/oeaw-logo.png" alt="" class="src" />
      </a>
      <a target="_blank" href="https://www.oeaw.ac.at/de/acdh/acdh-ch-home">
        <v-img aspect-ratio="1" width="150" max-height="70" contain src="/assets/images/acdh-ch-logo-with-text.png" alt="" class="src" />
      </a>
      <a target="_blank" href="https://www.oeaw.ac.at/de/acdh/wboe-projektcluster">
        <v-img aspect-ratio="1" width="150" max-height="70" contain src="/assets/images/wboe-logo.png" alt="" class="src" />
      </a>
      <a target="_blank" href="https://www.fwf.ac.at">
        <v-img aspect-ratio="1" width="150" max-height="70" contain src="/assets/images/fwf-logo.gif" alt="" class="src" />
      </a>
      <a target="_blank" href="https://www.univie.ac.at">
        <v-img aspect-ratio="1" width="150" max-height="70" contain src="/assets/images/uni-vienna-logo.png" alt="" class="src" />
      </a>
      <a target="_blank" href="https://dioe.at">
        <v-img aspect-ratio="1" width="150" max-height="70" contain src="/assets/images/dioe-logo.png" alt="" class="src" />
      </a>
    </v-layout>

    <div class="footer mt-5" >
      <p class="text-center">
        <v-btn exact to="/resources?link=home%2Fimpressum%2F" small rounded text>Impressum</v-btn>
        <v-btn exact to="/resources?link=home%2Fkontakt%2F" small rounded text>Kontakt</v-btn>
        <v-btn exact to="/resources?link=home%2Fdatenschutz%2F" small rounded text>Datenschutz</v-btn>
      </p>
      <div class="text-center mt-3 mb-0" style="font-size: 0.75em">
        <b>Versions:</b>
        <p class="my-1">
          Frontend: {{frontendVersion}} - {{branch}}
        </p>
        <p class="my-1">
          Article API: {{articleApiVersion}}
        </p>
        <p class="my-1">
          Article Data: {{articleDataVersion}}
        </p>
      </div>
    </div>
    <div class="flex space-around justify-center" style="font-size: 0.75em">
      <tracking-status-area/>
    </div>
    </v-flex>
</template>

<script lang="ts">
import { articleStore } from '@/store/articles-store';
import TrackingStatusArea from '@/components/GeneralComponents/Tracking/TrackingStatusArea.vue';
import { Vue, Component } from 'vue-property-decorator'

@Component({
  components: {
    TrackingStatusArea
  }
})
export default class LioeFooter extends Vue {

  created() {
    articleStore.articles.fetchVersion();
  }

  get frontendVersion() {
    return import.meta.env.VITE_APP_GIT_TAG ?? 'version';
  }

  get commit_hash()  {
    return import.meta.env.VITE_APP_GIT_COMMIT_HASH ?? 'commit hash';
  }

  get branch(){
    return import.meta.env.VITE_APP_GIT_BRANCH_NAME ?? 'branch';
  }

  get articleApiVersion() {
    return articleStore.articles.articleApiVersion;
  }

  get articleDataVersion() {
    return articleStore.articles.articleDataVersion;
  }
}
</script>
