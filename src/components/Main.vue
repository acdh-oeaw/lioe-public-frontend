<template>
  <v-layout column fill-height>
    <v-flex class="pt-8" style="height: 40vh" xs12>
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
import _ from 'lodash';
import InfoText from '@/components/InfoText.vue';
import {
  getDocumentsByCollection,
  ExtendedArticle,
} from '@/api';
import { stateProxy } from '@/store/collections';
import InfoBox from '@/components/InfoBox.vue';
import { geoStore } from '@/store/geo';
import { articleStore } from '@/store/articles-store';
import { fileLinkFromXMLUrl } from '@/utilities/helper-functions';
import { indexSearchTypesDictionary } from "@/types/indexSearch"

@Component({
  components: {
    InfoText,
    InfoBox,
  },
})
export default class Main extends Vue {
  localStorage = window.localStorage;

  typeDictionary = indexSearchTypesDictionary;

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
  searchOrt: string = '';
  searchLemma: string = '';

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
  // items=[{text: 'Lemma', value: 'Lemma', disabled: false},{text: 'Ort', value: 'Ort', disabled: false}]


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

  @Watch('$route')
  siteChanged(to: any, from: any) {
    if (from.path === '/') {
      this.visited = true;
    }
  }

  async mounted() {
    console.log('indexSearchTypesDictionary', indexSearchTypesDictionary)
    this.typeDictionary = indexSearchTypesDictionary;
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
