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

<!-- TRY -->

<v-layout column>
  <v-flex>
    <v-row no-gutters>
    <v-col><v-text-field
      :loading="loading"
        autofocus
        text
        v-model="searchTerm"
        label="Suche nach Wort" 
        @input="debouncedSearchArticle"
        prepend-inner-icon="search"
        solo
        clearable
    ></v-text-field></v-col>
    <v-col><v-autocomplete
      :loading="loading" 
      :items='locationsSearchItems'
      :value="locationsSearchItems"
      @input="selectLocations"
        label="Suche nach Ort"
        autofocus
        v-model="searchOrt" 
        item-text="text"
        item-value="value"
        text
        hide-details
        chips 
        prepend-inner-icon="search"
        solo
        clearable
        >
        <template v-slot:item="{ item }">
          <v-list-item-content>
            <v-list-item-title v-text="item.text"></v-list-item-title>
        <router-link :to="`/maps`"></router-link>
          </v-list-item-content>
        </template>
        </v-autocomplete>
    </v-col>
    <!-- <v-col><v-text-field TODO : bind here Lemma once exists
      :loading="loading"
        autofocus
        text
        v-model="searchLemma"
        label="Suche nach Lemma" 
        prepend-inner-icon="search"
        solo
        clearable
    ></v-text-field></v-col> -->
  </v-row>
  </v-flex>
  </v-layout>


<!-- END TRY -->

    <v-flex style="height: 40vh" xs12>
      <!-- <v-progress-linear
        height="1"
        class="pa-0 ma-0 absolute"
        v-if="wordProgress !== null && wordProgress !== 100"
        indeterminate
      /> -->



      <vue-word-cloud
        :enter-animation="{ opacity: 0, transform: 'scale3d(0.3, 1, 0.3)' }"
        :rotation="searchTerm === '' ? .875 : 0"
        :words="filteredWords"
        :animation-overlap="searchTerm === '' ? 10 : 1"
        :animation-duration="searchTerm === '' ? ((visited) ? 0 : 5000) : 500"
        :spacing=".2"
        @update:progress="updateWordProgress"
        font-weight="800"
        font-family="fiduz">
      <template slot-scope="{text, weight, word}">
        <router-link class="word-cloud-link" :to="`/articles/${findArticleByTitle(text).filename.replace('.xml', '')}`">
          {{ text }}
        </router-link>
      </template>
      </vue-word-cloud>
    </v-flex>
    <div class="text-center mt-5">{{ articles ? articles.length.toLocaleString() : '?' }} WBÖ Artikel</div>
    <v-layout row>
      <v-flex class="xs7 mx-auto">
        <InfoBox class="mt-5">
          <h4 class="headline">Sie suchen das WBÖ-Projekt?</h4>
          <div>Alle Informationen zum „Wörterbuch der bairischen Mundarten in Österreich“ finden Sie <a href="https://www.oeaw.ac.at/acdh/vawadioe/projekte/wboe/" target="_blank">hier</a>.</div>
        </InfoBox>
      </v-flex>
    </v-layout>
    <v-flex class="pt-4">
      <info-text subDialog="true" path="home/einleitungstext/" />
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import * as _ from 'lodash'
import InfoText from '@components/InfoText.vue'
import { getArticles } from '../api'
import InfoBox from '@components/InfoBox.vue'
import { get } from 'http'
import { geoStore } from '../store/geo'


@Component({
  components: {
    InfoText,
    InfoBox
  }
})
export default class Main extends Vue {

  wordProgress: number|null = null
  searchTerm: string = ''
  searchOrt: string = '' 
  searchLemma: string = '' 
  articles: Array<{title: string, filename: string}> = []
  articlesPlus: Array<{title: string, filename: string, ort: string}> = []  //extended articles list
  loading = false
  visited: boolean = false
  debouncedSearchArticle = _.debounce(this.findArticleByTitle, 250) //TODO RECHECK what to debounce
  autoFit = false
  loc: string|null
  geoStore = geoStore
  items={text: 'Ort', value: 'Ort', disabled: false}


  findArticleByTitle(title: string) { //check also based on ort
    return this.articles.find(a => a.title === title) 
  }

 get words(): string[] {
    return this.articles.map(w => w.title)
  }


  get wordsWithWeights(): Array<[string, number]> {
    return this.words.map((w: string) => {
      return [w, _.random(1, 5, true)] as [string, number]
    })
  }


  get filteredWords() {

    if (this.searchTerm) {
      return this.wordsWithWeights.filter(w => {
        return w[0].toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1
      })
    }
    else {
      return _(this.wordsWithWeights).sampleSize(25).value()
    }
  }

  updateWordProgress(e: any) {
    if (e !== null) {
      this.wordProgress = e.completedWords / e.totalWords * 100
    }
  }

    get locationsSearchItems() {
      var lokaleOrtsliste = this.geoStore.ortslisteGeo.map((f: any) => {
          return {
            text: f.name,
            value: f.sigle//,
           // parents: (f.parentsObj ? f.parentsObj.slice().reverse().map((o: any) => o.name).join(', ') : '')
          }
      })
      return lokaleOrtsliste = lokaleOrtsliste.filter((el:any) => {
        return el != null;
      });
    }

  selectLocations(locs: string[]) {
    if (locs.length === 0) {
      this.loc = ''
    } else {
      this.$router.push({
        path: '/maps',
        query: {
          loc : locs
        }
      })
    }
  }

  log(e: any) {
    console.log(e)
  }


  @Watch('$route')
  siteChanged(to: any, from: any) {
    if (from.path === '/') {
      this.visited = true
    }
  }

  async mounted() {
    this.loading = true
    this.articles = await getArticles()
    this.loading = false
  }
}
</script>
<style lang="scss" scoped>
.word-cloud-link{
  opacity: .6;
  color: #3B89A0;
  text-decoration: none;
  &:hover{
    opacity: 1;
  }
}
</style>
