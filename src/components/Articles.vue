<template>
  <v-layout column>
    <v-card class="sticky-card" width="100%">
      <v-layout>
        <v-flex class="text-center" xs12>
          <v-text-field
            :loading="loading"
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
                  <v-icon v-on="on">archive</v-icon>
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
        Keine Artikel gefunden.
      </div>
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getArticles } from '../api'
import InfoText from '@components/InfoText.vue'
import * as _ from 'lodash'

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
  debouncedSearchArticle = _.debounce(this.searchArticle, 250)

  getCleanInitial(lemmaName: string) {
    return (
      lemmaName
        .replace(/\(.*\)/g, '')
        .replace('-', '')[0] || ''
      )
      .toUpperCase()
      + (lemmaName.replace(/\(.*\)/g, '')[1] || '')
      .toLowerCase()
  }

  getCleanFirstLetter(lemmaName: string) {
    return (
      lemmaName
        .replace(/\(.*\)/g, '')
        .replace('-', '')[0] || ''
      )
      .toUpperCase()
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

  async mounted() {
    this.loading = true
    this.articles = await this.getArticles()
    this.loading = false
  }

  async getArticles(search?: string) {
    return (await getArticles(search)).filter(a => a.title !== '' && a.title !== undefined)
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
