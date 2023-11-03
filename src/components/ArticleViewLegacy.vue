<template>
  <v-expansion-panel class="mt-3 article-panels" @click.native="$emit('article-click', $event)" expand>
    <article-fragment-legacy class="article-fragment" ext-info-url="wboe-artikel/verbreitung/" info-url="wboe-artikel/verbreitung-short/" :content="xmls.verbreitungXML" title="Verbreitung" />
    <article-fragment-legacy class="article-fragment" ext-info-url="wboe-artikel/belegauswahl/" info-url="wboe-artikel/belegauswahl-short/" :content="xmls.belegauswahlXML" title="Belegauswahl" />
    <article-fragment-legacy class="article-fragment" ext-info-url="wboe-artikel/etymologie/" info-url="wboe-artikel/etymologie-short/" :content="xmls.etymologieXML" title="Etymologie" />
    <article-fragment-legacy class="article-fragment" ext-info-url="wboe-artikel/bedeutung/" info-url="wboe-artikel/bedeutung-short/" :content="xmls.bedeutungXML" title="Bedeutung" />
    <article-fragment-legacy class="article-fragment" ext-info-url="wboe-artikel/wortbildung/" info-url="wboe-artikel/wortbildung-short/" :content="xmls.wortbildungXML" title="Wortbildung" />
    <article-fragment-legacy
      ext-info-url="wboe-artikel/redewendungen/"
      info-url="wboe-artikel/redewendungen-short/"
      :content="xmls.redewendungenXML"
      title="Redewendungen"
      class="article-fragment redewendungen"
    />
  </v-expansion-panel>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ArticleFragmentLegacy from '@/components/ArticleFragmentLegacy.vue'

@Component({
  components: {
    ArticleFragmentLegacy
  }
})
export default class ArticleViewLegacy extends Vue {
  @Prop({ required: true }) xmls: {[fragmentName: string]: string}
}
</script>
