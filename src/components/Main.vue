<template>
  <v-layout column fill-height>
    <!-- <v-flex class="text-center">
      <v-text-field
        :loading="loading"
        autofocus
        text
        v-model="searchTerm"
        label="Suche…"
        prepend-inner-icon="search"
        solo
        clearable
      />
    </v-flex> -->

    <v-layout column>
      <v-flex>
        <v-col class="pa-0">
          <v-autocomplete
            :loading="loading"
            :items="searchItems"
            @input="selectItems"
            test-id="omni-search"
            label="Alle Ressourcen durchsuchen..."
            autofocus
            @update:search-input="debouncedPerformSearch"
            v-model="searchedItem"
            text
            class="mb-4"
            hide-details
            prepend-inner-icon="search"
            solo
            clearable
            append-icon='$dropdown'
            id="mainOmnisearch"
          >
            <template v-slot:item="{ item }">
              <v-list-item
                test-id="omni-search-result"
                :to="
                  item.type === 'article'
                    ? `/articles/${
                      getArticleFileLinkByLemma(item.text)}`
                    : item.type !== 'collection'
                    ? `/db?q=Sigle1,${item.value}`
                    : ``
                "
                @click="
                  item.type === 'collection'
                    ? getLocationsOfCollections(item, 'page')
                    : null
                "
              >
                <v-list-item-avatar>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon v-if="item.type === 'article'" v-on="on"
                        >mdi-newspaper</v-icon
                      >
                    </template>
                    <span>Artikel anzeigen</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon v-if="item.type === 'place'" v-on="on"
                        >map</v-icon
                      >
                    </template>
                    <span>Ort in Datenbank anzeigen</span>
                  </v-tooltip>
                  <v-icon v-if="item.type === 'collection'"
                    >mdi-folder-outline</v-icon
                  >
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title> {{ item.text }}</v-list-item-title>
                  <!-- <v-list-item-subtitle v-if="item.type === 'article'">  Beleg zum Artikel anzeigen </v-list-item-subtitle> -->
                  <v-list-item-subtitle v-if="item.type === 'collection'">
                    {{ item.description }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="item.type === 'place'">
                    {{ item.value }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn
                    v-if="item.type === 'place'"
                    color="ci"
                    class="text-no-transform"
                    text
                    @click.stop.prevent="routeToMaps(item)"
                  >
                    Ort auf Karte anzeigen</v-btn
                  >
                  <v-btn
                    v-if="item.type === `article`"
                    text
                    color="ci"
                    class="text-no-transform"
                    @click.stop.prevent="
                      $router.replace(`/db?q=HL,${item.text}`)
                    "
                    >&rarr; Belege in Datenbank anzeigen</v-btn
                  >
                  <v-btn
                    text
                    v-if="item.type === `collection`"
                    class="text-no-transform"
                    color="ci"
                    @click.stop.prevent="getLocationsOfCollections(item, 'btn')"
                    >&rarr; Sammlung auf Karte anzeigen</v-btn
                  >
                </v-list-item-action>
              </v-list-item>
            </template>
            <template v-slot:no-data>
              <v-list-item v-if="isSearching">
                <v-list-item-title class="text-center caption">
                  Lade…
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-else-if="searchTerm !== null && searchTerm.trim() !== ''"
                :to="`db?q=HL,${searchTerm}`"
              >
                <v-list-item-title class="caption">
                  Der gesuchte Begriff konnte nicht gefunden werden. Zum
                  Weitersuchen in der Belegdatenbank:
                </v-list-item-title>
                <v-list-item-action>
                  <v-btn text color="ci"> &rarr; {{ searchTerm }} </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-list-item v-else>
                <v-list-item-title class="caption">
                  Suchen Sie nach Artikeln, Belegen oder Orten.
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-slot:append>
              <v-btn
                color="accent"
                icon
                @click="startTour()"
                id='mainInfoButton'
              >
                <v-icon>info</v-icon>
              </v-btn>
            </template>
          </v-autocomplete>

        </v-col>
      </v-flex>
    </v-layout>

    <v-flex style="height: 40vh" xs12>
      <!-- <v-progress-linear
        height="1"
        class="pa-0 ma-0 absolute"
        v-if="wordProgress !== null && wordProgress !== 100"
        indeterminate
      /> -->
      <vue-word-cloud
        style="height: 360px"
        :enter-animation="{ opacity: 0, transform: 'scale3d(0.3, 1, 0.3)' }"
        :rotation="0.875"
        :words="filteredWords"
        :animation-overlap="10"
        :animation-duration="visited ? 0 : 5000"
        :spacing="0.2"
        @update:progress="updateWordProgress"
        font-weight="800"
        font-family="fiduz"
      >
        <template slot-scope="{ text, weight, word }">
          <router-link
            class="word-cloud-link"
            :to="`/articles/${getArticleFileLinkByLemma(text)}`"
          >
            {{ text }}
          </router-link>
        </template>
      </vue-word-cloud>
    </v-flex>
    <div v-if="!articlesCount" class="text-center grey--text mt-5">Laden…</div>
    <div v-else class="text-center grey--text mt-5">
      {{ articlesCount ? articlesCount.toLocaleString() : '?' }} WBÖ-Artikel
    </div>

    <v-flex class="pt-4">
      <info-text subDialog="true" path="home/einleitungstext/" />
    </v-flex>
      <v-tour
        name="mainTour"
        :steps="mainTour_Steps"
        :options="{
          useKeyboardNavigation: true,
          highlight: true,
          labels: {
            buttonSkip: 'Tour schließen',
            buttonPrevious: 'Zurück',
            buttonNext: 'Weiter',
            buttonStop: 'Tour beenden'
          }
        }"
        :callbacks="tourCallbacks"
      >
      </v-tour>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import * as _ from 'lodash';
import InfoText from '@components/InfoText.vue';
import {
  getArticles,
  searchCollections,
  getDocumentsByCollection,
  Article,
  ExtendedArticle,
} from '../api';
import { stateProxy } from '../store/collections';
import InfoBox from '@components/InfoBox.vue';
import { geoStore } from '../store/geo';
import { articleStore } from '@src/store/articles-store';
import { fileLinkFromXMLUrl } from '@src/utilities/helper-functions';

@Component({
  components: {
    InfoText,
    InfoBox,
  },
})
export default class Main extends Vue {
  localStorage = window.localStorage;

  mainTour_Steps = [
    {
      target:'#mainInfoButton',
      header: {
        title: 'Hilfe',
      },
      content: 'Wenn Sie zum ersten Mal hier sind, soll Ihnen diese Tour dabei helfen, sich zurechtzufinden. Mit "Tour schließen" können Sie die Tour überspringen. Wenn Sie die Tour später doch anschauen wollen, können Sie einfach auf dieses Icon klicken. ',
      params: {
        enableScrolling: false,
        placement: 'left' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      }
    },
    {
      target:'#mainOmnisearch',
      header: {
        title: 'Omnisearch',
      },
      content: 'Hier können Sie alles finden, was wir in unseren Ressourcen zu Ihrem Suchbegriff bereit haben.',
      params: {
        enableScrolling: false,
        placement: 'bottom' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      }
    },
    {
      target:'#tabWBOE',
      content: 'Hier geht es zu unseren fertigen Wörterbuchartikeln.',
      params: {
        enableScrolling: false,
        placement: 'bottom' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      }
    },
    {
      target:'#tabBelegDB',
      content: 'Hier können Sie alle Belege durchsuchen, die für das Wörterbuch gesammelt wurden. Sie können auch eigene Analysen machen.',
      params: {
        enableScrolling: false,
        placement: 'bottom' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      }
    },
    {
      target:'#tabMap',
      content: 'Hier können Belege zu einem Ort gesucht oder die in der Datenbank erstellten Sammlungen auf einer Karte angezeigt werden.',
      params: {
        enableScrolling: false,
        placement: 'bottom' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
      }
    },
    {
      target:'#tabInformationen',
      content: 'Hier finden Sie Informationen rund um das Projekt und die Plattform.',
      params: {
        enableScrolling: false,
        placement: 'bottom'
      }
    },

  ]

  tourCallbacks = {
    onSkip: this.disableTourOnLoad,
    onFinish: this.disableTourOnLoad,
  }

  disableTourOnLoad(currentStep?: any) {
    this.localStorage.setItem('mainTourEnabled', 'false');
  }

  enableTourOnLoad(currentStep?: any) {
    this.localStorage.setItem('mainTourEnabled', 'true');
  }

  onLandingTourHandler() {
    if(!localStorage.getItem('mainTourEnabled')) {
      this.enableTourOnLoad();
    }
    if(localStorage.getItem('mainTourEnabled') === 'true') {
      this.startTour();
    }
  }

  startTour() {
    // @ts-ignore
    this.$tours['mainTour'].start();
  }

  wordProgress: number | null = null;
  searchTerm: string = '';
  searchOrt: string = '';
  searchedItem: string = '';
  searchLemma: string = '';

  get loading() {
    return articleStore.articles.loading || articleStore.articles.loadingAll;
  }

  get articles() {
    return articleStore.articles.AllArticles;
  }
  get articlesCount() {
    return articleStore.articles.articleCount;
  }

  articlesPlus: Array<ExtendedArticle> = []; //extended articles list
  visited: boolean = false;
  debouncedSearchArticle = _.debounce(this.findArticleByLemma, 250);
  autoFit = false;
  loc: string | null;
  geoStore = geoStore;
  isSearching = false;
  searchItems: Array<{
    type: string;
    text: string;
    value: string;
    description: string;
  }> = [];
  // items=[{text: 'Lemma', value: 'Lemma', disabled: false},{text: 'Ort', value: 'Ort', disabled: false}]

  debouncedPerformSearch = _.debounce(this.performSearch, 300);

  // normalization helpers
  characters_to_delete_for_search = /[-*<>;%†\u1AB0–\u1AFF\u1DC0–\u1DFF\u02B0-\u02FF\u20D0–\u20FF\u26a0\u0300-\u036F\uFE20–\uFE2F()\[\]"']/g;
  restore_umlaut_for_search_map: Record<string, string> = {
      '\u203Aa':'ä', '\u203AA':'Ä',
      '\u203Ao':'ö', '\u203AO':'Ö',
      '\u203Au':'ü', '\u203AU':'Ü',
      '\u203As':'ß'
  };
  replace_for_search_map = Object.keys(this.restore_umlaut_for_search_map).reduce((ret: Record<string, string>, key: string) => {
      ret[this.restore_umlaut_for_search_map[key]] = key;
      return ret;
  }, {});


  async performSearch(s: string | null) {
    if (s !== null && s.trim() !== '') {
      this.searchTerm = s;
      this.isSearching = true;
      const collections = (await searchCollections(s)).results.map((c) => ({
        type: 'collection',
        text: c.name,
        value: c.value,
        description: c.description,
      }));
      const articles = this.articles.map((a) => ({
        type: 'article',
        text: a.title,
        value: a.xmlUrl,
        description: '',
      }));
      const places = this.geoStore.ortslisteGeo.map((f: any) => ({
        type: 'place',
        text: f.name,
        value: f.sigle,
        description: '',
      }));
      const results = [...articles, ...places, ...collections].filter(
        (i) => i !== null
      );
      this.searchItems = results;
      this.isSearching = false;
    }
  }

  selectItems(input: string) {
    console.log(input);
  }

  findArticleByLemma(lemma: string) {
    //check also based on ort
    return this.articles.find((a) => this.advanceCompare(a.lemma, lemma));
  }

  advanceCompare(lemmaA: string, lemmaB: string): boolean {
    const normalizedLemmaA: string = (lemmaA.replace(/[äöüÄÖÜß]/g,
        (c) => this.replace_for_search_map[c])
      .normalize('NFKD')
      .replace(/\(.*\)/g, '')
      .replace(this.characters_to_delete_for_search, '')
      .replace(/\u203A./g, (s) => this.restore_umlaut_for_search_map[s])
    );
    const normalizedLemmaB: string = (lemmaB.replace(/[äöüÄÖÜß]/g,
        (c) => this.replace_for_search_map[c])
      .normalize('NFKD')
      .replace(/\(.*\)/g, '')
      .replace(this.characters_to_delete_for_search, '')
      .replace(/\u203A./g, (s) => this.restore_umlaut_for_search_map[s])
    );

    return normalizedLemmaA === normalizedLemmaB;
  }

  getArticleFileLinkByLemma(lemma: string) {
    const article = this.findArticleByLemma(lemma);

    const xmlUrl = article?.xmlUrl;
    if(!xmlUrl) return '';


    return fileLinkFromXMLUrl(xmlUrl);
  }

  get words(): string[] {
    return this.articles.map((w) => w.lemma).filter(w => {
      const hasSpecialCharsAndNumbers = w.match(/\d/g)
      return !Boolean(hasSpecialCharsAndNumbers);
    }).filter(w => !w.includes('¹') && !w.includes('²'));
  }

  get wordsWithWeights(): Array<[string, number]> {
    return this.words.map((w: string) => {
      return [w, _.random(1, 5, true)] as [string, number];
    });
  }

  get filteredWords() {
    return _(this.wordsWithWeights).sampleSize(25).value();
  }

  updateWordProgress(e: any) {
    if (e !== null) {
      this.wordProgress = (e.completedWords / e.totalWords) * 100;
    }
  }

  selectLocations(locs: string[]) {
    if (locs.length === 0) {
      this.loc = '';
    } else {
      this.$router.push({
        path: '/maps',
        query: {
          loc: locs,
        },
      });
    }
  }

  log(e: any) {
    console.log(e);
  }

  getColStr(val: any) {
    let output = JSON.stringify([
      {
        id: 0,
        tempColl: -1,
        collection_name: 'Sammlung Neu',
        editing: false,
        fillColor:
          '#' + Math.floor(Math.random() * 16777215).toString(16) + '99',
        borderColor: '#000',
        items: [val],
      },
    ]);
    return output;
  }

  strRouting(item: any) {
    this.getLocationsOfCollections(item, 'page');
    return '';
  }

  async getLocationsOfCollections(item: any, val: string) {
    let colls: Number[] = item.value;
    if (!Array.isArray(colls)) {
      var tmp = new Array();
      tmp.push(colls);
      colls = tmp;
    }

    if (colls.length === 0) {
      return;
    }

    const res: any = await getDocumentsByCollection(
      [colls[0].toString()],
      1,
      1000
    );
    let CollLocation: any[] = [];
    //@ts-ignore
    res.documents.forEach((document) => {
      let sigle: string = document.ortsSigle;
      if (sigle) {
        if (!CollLocation.includes(document.ortsSigle.split(' ')[0])) {
          CollLocation.push(document.ortsSigle.split(' ')[0]);
        }
      }
    });

    stateProxy.collections.addWBOE_coll({
      changedColl: {
        id: Math.random() * 1000,
        selected: true,
        preColl: item.value,
        collection_name: item.text,
        collection_desc: item.description,
        editing: false,
        fillColor:
          '#' + Math.floor(Math.random() * 16777215).toString(16) + '99',
        borderColor: '#000',
        items: CollLocation,
      },
      add: true,
    });
    if (val === 'btn') {
      this.$router.push({
        path: '/maps',
      });
    } else if (val === 'page') {
      this.$router.push({
        path: '/db',
      });
    }
  }

  routeToMaps(item: any) {
    stateProxy.collections.setLocations([item.value]);
    this.$router.push({
      path: '/maps',
    });
  }

  @Watch('$route')
  siteChanged(to: any, from: any) {
    if (from.path === '/') {
      this.visited = true;
    }
  }

  async mounted() {
    this.onLandingTourHandler();

  }
}
</script>
<style lang="scss" scoped>
.word-cloud-link {
  opacity: 0.6;
  color: #3b89a0;
  text-decoration: none;
  &:hover {
    opacity: 1;
  }
}
</style>
