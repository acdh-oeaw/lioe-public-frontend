<template>
  <v-expansion-panel>
    <v-expansion-panel-header>
      <article-fragment-header :title="title" :ext-info-url="extInfoUrl" :info-url="infoUrl" />
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <div class="article-xml">
        <slot />
      </div>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import ArticleFragmentHeader from '@/components/ArticleFragmentHeader.vue'

@Component({
  components: {
    ArticleFragmentHeader
  }
})
export default class ArticleFragementPanel extends Vue {

  @Prop() title: string|null
  @Prop() infoUrl: string|null
  @Prop() extInfoUrl: string|null

  showDetails = false

}
</script>

<style lang="scss" scoped>
.article-xml {
  font-size: 100%;
}
</style>
