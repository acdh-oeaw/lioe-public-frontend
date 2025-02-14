<template>
  <v-layout column>
    <v-card class="sticky-card" width="100%">
      <v-layout>
        <v-flex class="text-center" xs12>
          <v-text-field
            data-test="articles-search"
            :loading="loading"
            v-model="searchTerm"
            autofocus
            flat
            hide-details
            label="Suche Artikel…"
            prepend-inner-icon="mdi-magnify"
            append-inner-icon="mdi-information-outline"
            solo
            clearable
          />
        </v-flex>
        <v-col cols="auto" class="pa-0 divider-left">
          <v-btn-toggle
            data-test="article-search-radio"
            v-model="toggleModel"
            mandatory
          >
            <v-btn data-test="filter-retro" class="text-no-transform" text>Retrodigitalisierte Artikel</v-btn>
            <v-btn data-test="filter-current" class="text-no-transform" text>Aktuelle Artikel</v-btn>
            <v-btn data-test="filter-all" class="text-no-transform" text>Alle Artikel</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-flex>
          <v-menu open-on-hover max-width="700" max-height="95vh" top left>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" color="accent" icon text class="pt-2">
                <v-icon>mdi-information-outline</v-icon>
              </v-btn>
            </template>
            <info-text class="elevation-24 pa-4 white" path="wboe-artikel/" />
          </v-menu>
        </v-flex>
      </v-layout>
    </v-card>
    <v-flex xs12>
      <info-text subDialog="true" class="pa-4" path="wboe-artikelstruktur/" />
      <v-tabs data-test="letter-group-tabs" grow v-model="letter" class="tabs-letter my-3" color="ci" background-color="transparent" center-active centered>
        <v-tab :data-test="'letter-group-' + aLetter.char" v-for="(aLetter, i) in articlesFirstLetter" :key="'stab' + i">
          <p>{{ aLetter.char }}<span class="ml-1" style="font-size: 12px;">({{ aLetter.length }})</span></p>
        </v-tab>
      </v-tabs>
      <v-list v-if="filteredArticlesByInitial.length > 0">
        <template v-for="(articles, i) in visibleArticles">
          <v-subheader class="sticky" :key="'subheader' + i">
            {{ articles.initials }}
            <div style="height: 1px;" v-if="i === visibleArticles.length - 1 && moreArticlesAvailable" v-intersect="loadMoreVisible"/>
          </v-subheader>
          <v-list-item :to="`/articles/${ getFileLink(article.xmlUrl) }`" v-for="(article, index) in articles.articles" :key="i + index + article.filename + article.lemma">
            <v-list-item-title
              style="
                display:flex;
                flex-direction: row;"
            >
              {{ article.title }}
              <div class="ml-2" v-if="searchActive"
              style="
                display:flex;
                flex-direction: row;
                align-items:center;
                max-width: 40%;
                overflow:hidden;"
              >
                <span
                v-for="(hit, index) in getHitsFromArticle(article).slice(0, 3)"
                v-bind:key="index"
                style="font-size: 14px; color: gray;">
                  {{hit}}
                  <span v-if="(index !== getHitsFromArticle(article).length - 1)" class="mx-3">•</span>
                </span>
              </div>
              <span class="ml-1" v-if="(getHitsFromArticle(article).length > 2 && searchActive)">...</span>
            </v-list-item-title>
            <v-list-item-icon v-if="article.xmlUrl && article.xmlUrl.indexOf('%23') > -1">
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
        <v-skeleton-loader id="intersect-skeleton-loader" class="mt-4" v-if="moreArticlesAvailable" type="heading, list-item-two-line@2, heading, list-item@3" v-intersect="loadMoreVisible"></v-skeleton-loader>
      </v-list>
      <div v-else>
        <span v-if="!loading">Keine Artikel gefunden.</span>
      </div>
      <v-skeleton-loader id="loading-skeleton-loader" v-if="loading" type="heading, list-item-two-line@3, heading, list-item@5"></v-skeleton-loader>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Article, getArticles } from '@/api'
import InfoText from '@/components/InfoText.vue'
import _ from 'lodash'
import { articleStore } from '@/store/articles-store'
import { fileLinkFromXMLUrl } from '@/utilities/helper-functions'
import { type ArticleFilter } from '@/store/articles-store'

interface articleGroup {
  initials: string,
  articles: Article[],
}

const filterAll: Array<ArticleFilter> = ['finished', 'proofed', 'retro']
const filterRetro: Array<ArticleFilter> = ['retro'];
const filterCurrent: Array<ArticleFilter> = ['finished', 'proofed'];

@Component({
  components: {
    InfoText
  }
})
export default class Articles extends Vue {

  visibleArticles: articleGroup[] = [];

  getHitsFromArticle(article: Article) :string[] {
    const hits = [];

    const cleanupRegex = /[\u0300-\u036f\W_]/g;

    const normalizedSearchTerm = this.searchTerm.toLocaleLowerCase().normalize("NFD").replace(cleanupRegex, "");

    if(article.lemma.toLowerCase().normalize("NFD").replace(cleanupRegex, "").includes(normalizedSearchTerm)) {
      hits.push(article.lemma);
    }

    article.compositum?.forEach(composita => {
      if(composita.toLowerCase().normalize("NFD").replace(cleanupRegex, "").includes(normalizedSearchTerm)) {

        hits.push(composita);
      }
    });

    article.references?.forEach(reference => {
      if(reference.text.toLowerCase().normalize("NFD").replace(cleanupRegex, "").includes(normalizedSearchTerm)){
        hits.push(reference.text);
      }
    });

    return hits;
  }

  visibleArticleStepSize: number = 3;

  get moreArticlesAvailable() {
    return this.visibleArticles.length < this.filteredArticlesByInitial.length;
  }

  loadMoreVisible(entries?: IntersectionObserverEntry[]) {
      if ((entries && entries[0].isIntersecting && this.moreArticlesAvailable) || this.visibleArticles.length < 1) {
        this.visibleArticles.push( ...this.filteredArticlesByInitial.slice(this.visibleArticles.length, Math.min((this.visibleArticles.length + this.visibleArticleStepSize), this.filteredArticlesByInitial.length)));
      }
  }

  @Watch('letter')
  OnLetterChanged() {
    this.resetVisible();
    this.loadMoreVisible();
  }

  resetVisible() {
    this.visibleArticles = [];
  }

  changeVisible() {
    this.visibleArticles = this.filteredArticlesByInitial.slice(this.visibleArticles.length, Math.min((this.visibleArticles.length + this.visibleArticleStepSize), this.filteredArticlesByInitial.length));
  }

  getFileLink(xmlUrl?: string) :string {
    return fileLinkFromXMLUrl(xmlUrl);
  }

  get loading() {
    return this.searchActive ? articleStore.articles.loadingArticleSearch : articleStore.articles.loadingAll;
  }

  get totalArticleCount() {
    return this.searchActive ? articleStore.articles.searchArticleCount :  articleStore.articles.articleCount;
  }

  get filterByLetter() {
    return this.letter === 0 || !(this.articlesFirstLetter && this.articlesFirstLetter[this.letter]);
  }

  letter = 0
  searchTerm = ''
  debouncedSearchArticle = _.debounce(this.searchArticle, 500)
  toggleModel: number = 2;

  @Watch('searchTerm')
  OnSearchTermChanged() {
    this.debouncedSearchArticle(this.searchTerm);
  }

  activeArticleStatusFilters: Array<ArticleFilter> = filterAll;

  readonly characters_to_delete_for_search = /[-*<>;%†\u1AB0–\u1AFF\u1DC0–\u1DFF\u02B0-\u02FF\u20D0–\u20FF\u26a0\u0300-\u036F\uFE20–\uFE2F()\[\]"']/g
  readonly restore_umlaut_for_search_map: Record<string, string> = {
    '\u203Aa':'ä', '\u203AA':'Ä',
    '\u203Ao':'ö', '\u203AO':'Ö',
    '\u203Au':'ü', '\u203AU':'Ü',
    '\u203As':'ß'
  }

  readonly replace_for_search_map = Object.keys(this.restore_umlaut_for_search_map).reduce((ret: Record<string, string>, key: string) => {
    ret[this.restore_umlaut_for_search_map[key]] = key;
    return ret;
  }, {});

  getEasySearchLemma(lemmaName: string) {
    const ret: string = (
      lemmaName
        .replace(/[äöüÄÖÜß]/g,
          (c) => this.replace_for_search_map[c]
        )
        .normalize('NFKD')
        .replace(/\(.*\)/g, '')
        .replace(this.characters_to_delete_for_search, '')
        .replace(/\u203A./g, (s) => this.restore_umlaut_for_search_map[s])
      )
    return ret
  }

  getCleanInitial(lemmaName: string) {
    const ret: string = this.getEasySearchLemma(lemmaName)
    return (ret[0] || '').toUpperCase() + (ret[1] || '').toLowerCase()
  }

  getCleanFirstLetter(lemmaName: string) {
    const ret: string = this.getEasySearchLemma(lemmaName)
    return (ret[0] || '').toUpperCase()
  }

  @Watch("toggleModel", { deep: true })
  updateFilterStatus() {
    switch(this.toggleModel) {
      case 0: { // RETRO
        this.activeArticleStatusFilters = filterRetro;
      break;
      }
      case 1: {
        this.activeArticleStatusFilters = filterCurrent;
      break;
      }
      case 2: { // ALLE
        this.activeArticleStatusFilters = filterAll;
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
    if (this.filterByLetter) {
      return this.articlesByInitial
    } else {
      return this.articlesByInitial.filter(a => a.initials.substr(0, 1) === this.articlesFirstLetter[this.letter].char )
    }
  }

  get articlesByInitial() {
    const ret = _(this.articles)
      .groupBy((a) => this.getCleanInitial(a.title))
      .map((v, k) => ({
        initials: k,
        articles: v.sort((a, b) => this.getEasySearchLemma(a.title).localeCompare(this.getEasySearchLemma(b.title)))
      }))
      .value()
      .sort((a, b) => a.initials.localeCompare(b.initials))
    return ret
  }

  get articlesFirstLetter() {
    const totalArticles = ((this.totalArticleCount == this.articles.length) ? '' : ('/' + (this.totalArticleCount ? this.totalArticleCount : '?')));

    return [{ char: 'Alle', length:  this.articles.length + totalArticles }, ...(_(this.articles)
      .groupBy((a) => this.getCleanFirstLetter(a.title))
      .map((v, k) => ({
        char: k,
        length: v.length
      }))
      .value())
      .sort((a, b) => a.char.localeCompare(b.char))]
  }

  get activeFiltersAsString() {
    return this.activeArticleStatusFilters.join(',');
  }

  get allArticles() : Array<Article> {
    return articleStore.articles.AllArticles;
  }

  @Watch('loading')
  OnLoadingChanged() {
    if(!this.loading) {
      this.resetVisible();
      this.changeVisible();
    }
  }

  get showSearchedArticles() {
    return this.searchActive;
  }

  searchActive: boolean = false;

  get articles() : Array<Article> {
    return this.showSearchedArticles ? this.searchedArticles : this.allArticles;
  }

  get searchedArticles() : Array<Article> {
    return articleStore.articles.searchedArticles;
  }

  async mounted() {

  }

  async getArticles(search?: string) {
    console.log(this.activeFiltersAsString);
    return (await getArticles(search, this.activeFiltersAsString)).articles.filter(a => a.title !== '' && a.title !== undefined)
  }

  async searchArticle(search: string) {
    if(search === this.searchTerm) {
      if (search) {
        this.searchActive = true;
        if(search !== articleStore.articles.lastSearch || this.activeFiltersAsString !== articleStore.articles.lastFilter) {

          articleStore.articles.fetchArticleSearch({search: search, filter: this.activeFiltersAsString, pageSize: 500});
          this.resetVisible();
        }
      } else {
        this.searchActive = false;
      }
    }
    this.$matomo && this.$matomo.trackSiteSearch(search, 'search article', 0);
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
.tabs-letter ::v-deep .v-slide-group__prev.v-slide-group__prev--disabled {
  display: none!important;
}
</style>
