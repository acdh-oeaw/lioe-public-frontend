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
            label="Suche…"
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
              <v-btn v-on="on" color="accent" icon text>
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
      <v-list>
        <template v-for="(articles, i) in articlesByInitial">
          <v-subheader class="sticky" :key="'subheader' + i">{{ articles.initials }}</v-subheader>
          <v-list-item :to="`/articles/${ article.filename.replace('.xml', '') }`" v-for="article in articles.articles" :key="article.filename">
            <v-list-item-title>
              {{ article.title }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
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
  debouncedSearchArticle = _.debounce(this.searchArticle, 250)

  getCleanInitial(lemmaName: string) {
    return (lemmaName.replace(/\(.*\)/g, '')[0] || '').toUpperCase() + (lemmaName.replace(/\(.*\)/g, '')[1] || '').toLowerCase()
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
</style>
