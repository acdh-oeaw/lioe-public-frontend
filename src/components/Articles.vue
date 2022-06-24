<template>
  <v-layout column>
    <v-card class="sticky-card" width="100%">
      <v-layout>
        <v-flex class="text-center" xs12>
          <v-text-field
            :loading="loading"
            v-model="searchTerm"
            autofocus
            flat
            hide-details
            label="Suche Artikel…"
            prepend-inner-icon="search"
            @input="debouncedSearchArticle"
            append-inner-icon="info"
            solo
            clearable
          />
        </v-flex>
        <v-col cols="auto" class="pa-0 divider-left">
          <v-btn-toggle v-model="toggleModel" mandatory>
            <v-btn class="text-no-transform" text>Retrodigitalisierte Artikel</v-btn>
            <v-btn class="text-no-transform" text>Aktuelle Artikel</v-btn>
            <v-btn class="text-no-transform" text>Alle Artikel</v-btn>
          </v-btn-toggle>
        </v-col>
        <!-- <v-flex>
          <v-menu open-on-hover max-width="700" max-height="95vh" top left :close-on-content-click="false" @input="onFilterMenuToggle">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" color="accent" icon text class="pt-2">
                <v-icon>mdi-filter</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-for="filter in articleStatusFilters" :key="filter.label">
                <v-list-item-action>
                  <v-checkbox v-model="filter.selected"/>
                </v-list-item-action>
                {{filter.label}}
              </v-list-item>
            </v-list>
        </v-menu>
      </v-flex> -->
        <v-flex>
          <v-menu open-on-hover max-width="700" max-height="95vh" top left>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" color="accent" icon text class="pt-2">
                <v-icon>info</v-icon>
              </v-btn>
            </template>
            <info-text class="elevation-24 pa-4 white" path="wboe-artikel/showcases/" />
          </v-menu>
        </v-flex>
      </v-layout>
    </v-card>
    <v-flex xs12>
      <info-text subDialog="true" class="pa-4" path="wboe-artikel/wboe-artikelstruktur/" />
      <v-tabs grow v-model="letter" class="tabs-letter my-3" color="ci" background-color="transparent" center-active centered>
        <v-tab v-for="(aLetter, i) in articlesFirstLetter" :key="'stab' + i">
          {{ aLetter.char }}<span class="ml-1" style="font-size: 12px;">({{ aLetter.length }})</span>
        </v-tab>
      </v-tabs>
      <v-skeleton-loader v-if="loading" type="heading, list-item-two-line@3, heading, list-item@5"></v-skeleton-loader>
      <v-list v-if="filteredArticlesByInitial.length > 0">
        <template v-for="(articles, i) in filteredArticlesByInitial">
          <v-subheader class="sticky" :key="'subheader' + i">{{ articles.initials }}</v-subheader>
          <v-list-item :to="`/articles/${ article.filename.replace('.xml', '') }`" v-for="article in articles.articles" :key="article.filename">
            <v-list-item-title>
              {{ article.title }}
            </v-list-item-title>
            <v-list-item-icon v-if="article.filename.indexOf('%23') > -1">
              <v-tooltip top max-width="220" >
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on">&#128366; </v-icon>
                </template>
                <span>
                  Retrodigitalisierter Artikel
                </span>
              </v-tooltip>
            </v-list-item-icon>
          </v-list-item>
        </template>
      </v-list>
      <div v-else>
        <span v-if="!loading">Keine Artikel gefunden.</span>
      </div>
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getArticles } from '../api'
import InfoText from '@components/InfoText.vue'
import * as _ from 'lodash'
import { filter } from 'vue/types/umd'

@Component({
  components: {
    InfoText
  }
})
// tslint:disable:max-line-length
export default class Articles extends Vue {

  articles: Array<{ title: string, filename: string }> = []
  loading = false
  letter = 0
  searchTerm = ''
  debouncedSearchArticle = _.debounce(this.searchArticle, 250)
  toggleModel: number = 2;

  articleStatusFilters = [
    {
      selected: true,
      label: 'Kontroliert',
      filter: 'proofed'
    }, 
    {
      selected: true,
      label: 'Fertiggestellt',
      filter:'finished'
    },
    {
      selected: true,
      label: 'Retro',
      filter:'retro'
    },
    {
      selected: false,
      label: 'Retro Verweise',
      filter:'retro Verweis'
    }
  ]

  characters_to_delete_for_search = /[-;%\u1AB0–\u1AFF\u1DC0–\u1DFF\u02B0-\u02FF\u20D0–\u20FF\u26a0\u0300-\u036F\uFE20–\uFE2F;()\[\]"']/u
  replace_for_search_map: Record<string, string> = {
    '\u203Aa':'ä', '\u203AA':'Ä',
    '\u203Ao':'ö', '\u203AO':'Ö',
    '\u203Au':'ü', '\u203AU':'Ü',
    '\u203As':'ß'  
  }
  restore_umlaut_for_search_map = Object.keys(this.replace_for_search_map).reduce((ret: Record<string, string>, key: string) => {
    ret[this.replace_for_search_map[key]] = key;
    return ret;
  }, {});
  
  getCleanInitial(lemmaName: string) {
    return (
      lemmaName
        .normalize('NFKD')
        .replace(/\(.*\)/g, '')
        .replace(/[-†]+/, '')[0] || ''
        .replace(this.characters_to_delete_for_search, '')
      )
      .toUpperCase()
      + (lemmaName.replace(/\(.*\)/g, '')[1] || '')
      .toLowerCase()
  }

  getCleanFirstLetter(lemmaName: string) {
    return (
      lemmaName
        .normalize('NFKD')
        .replace(/\(.*\)/g, '')
        .replace(/[-†]+/, '')[0] || ''
        .replace(this.characters_to_delete_for_search, '')
      )
      .toUpperCase()
  }

  @Watch("toggleModel", { deep: true })
  updateFilterStatus() {
    switch(this.toggleModel) { 
      case 0: { // RETRO
        for (var i = 1; i < 4; i++) {
          this.articleStatusFilters[i].selected = i >= 2 ? true : false;
        } 
      break; 
      } 
      case 1: {
        for (var i = 1; i < 4; i++) {
          this.articleStatusFilters[i].selected = i >= 2 ? false : true;
        } 
      break; 
      } 
      case 2: { // ALLE
        for (var i = 0; i < 4; i++) {
          this.articleStatusFilters[i].selected = true;
        } 
      break; 
      } 
      default: { 
      //statements; 
      break; 
      } 
    } 
      this.searchArticle(this.searchTerm);
  }

  get filteredArticlesByInitial() {
    if (this.letter === 0 || !(this.articlesFirstLetter && this.articlesFirstLetter[this.letter])) {
      return this.articlesByInitial
    } else {
      return this.articlesByInitial.filter(a => a.initials.substr(0, 1) === this.articlesFirstLetter[this.letter].char )
    }
  }

  get articlesByInitial() {
    return _(this.articles)
      .groupBy((a) => this.getCleanInitial(a.title))
      .map((v, k) => ({
        initials: k,
        articles: v.sort((a, b) => a.title.localeCompare(b.title))
      }))
      .value()
      .sort((a, b) => a.initials.localeCompare(b.initials))
  }

  get articlesFirstLetter() {
    return [{ char: 'Alle', length: this.articles.length}, ...(_(this.articles)
      .groupBy((a) => this.getCleanFirstLetter(a.title))
      .map((v, k) => ({
        char: k,
        length: v.length
      }))
      .sortBy(v => v.char)
      .value())]
  }

  get activeFiltersAsString() {
    return this.articleStatusFilters
    .filter((item) => { return item.selected === true})
    .map((item) => { return item.filter})
    .join('|');
  }

  async mounted() {
    this.loading = true
    this.articles = await this.getArticles()
    this.loading = false
  }

  async getArticles(search?: string) {
    console.log(this.activeFiltersAsString);
    return (await getArticles(search, this.activeFiltersAsString)).filter(a => a.title !== '' && a.title !== undefined)
  }

  async searchArticle(search: string) {
    this.loading = true
    if (search) {
      this.articles = await this.getArticles(search)
    } else {
      this.articles = await this.getArticles()
    }
    this.loading = false
  }

  menuFilterStatus = '';
  onFilterMenuToggle(opened: any) {
    if(opened) {
      this.menuFilterStatus = this.activeFiltersAsString;
    }
    if (!opened) {
      if(this.menuFilterStatus !== this.activeFiltersAsString) {
        // Todo
        this.searchArticle(this.searchTerm);
      }
        
    }
  }
}
</script>
<style lang="scss" scoped>
.sticky{
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  border-bottom: 1px solid rgba(0,0,0,.12)
}
.tabs-letter{
  font-weight: bold;
}
.tabs-letter /deep/ .v-slide-group__prev.v-slide-group__prev--disabled {
  display: none!important;
}
</style>
