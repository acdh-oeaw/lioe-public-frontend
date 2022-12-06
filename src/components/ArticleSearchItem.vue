<template>
  <v-list-item-content class="pt-0">
    <v-list-item-title>
      {{article.lemma}} <span class="pl-2" style="color: grey; font-size: 14px;"> {{ article.title }} </span>
    </v-list-item-title>
    <v-list-item-subtitle
      v-if="displayCompositaAndReferences"
      class="ma-0 pa-0 mb-1">
      <div class="composita-container" v-if="sortedComposita && sortedComposita.length > 0">

        <b class="mr-1">Komposita:  </b>
        <div
          v-for="(composita, index) in sortedComposita"
          v-bind:key="index"
          class="ma-0 composita-item"
        >
          <template
          v-if="index <= 3">
            <p class="ma-0">
              {{ composita }}
            </p>
            <v-divider
              v-if="index > 0 && article.compositum && index < article.compositum.length - 1"
              class="mx-2 ma-0"
              style="height: inherit"
              vertical
            ></v-divider>
          </template>
        </div>
        <p class="ma-0" v-if="article.compositum && article.compositum.length > 3">
          ...
        </p>
      </div>

      <div class="reference-container" v-if="sortedReferences && sortedReferences.length > 0">

        <b class="mr-1">Referenzen:  </b>
        <div
        v-for="(reference, index) in sortedReferences"
        v-bind:key="index"
        class="ma-0 reference-item"
        >
          <template
          v-if="index <= 3">
            <p class="ma-0">
              {{ reference }}
            </p>
            <v-divider
              v-if="index > 0 && article.references && index < article.references.length - 1"
              class="mx-2 ma-0"
              style="height: inherit"
              vertical
            ></v-divider>
          </template>
        </div>
        <p class="ma-0" v-if="article.references && article.references.length > 3">
          ...
        </p>
      </div>

    </v-list-item-subtitle>
  </v-list-item-content>
</template>

<script lang="ts">
import { Article } from '@src/api'
import { sortByTerm } from '@src/utilities/helper-functions';
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component
export default class ArticleSearchItem extends Vue {

  @Prop()
  article: Article;

  @Prop()
  search: string;

  hideExtras = true;

  get displayCompositaAndReferences() {
    return (this.article.compositum && this.article.compositum.length > 0) || (this.article.references && this.article.references.length > 0)
      && !this.hideExtras;
  }

  get sortedComposita() {
    if(!this.article.compositum) return void 0;
    return sortByTerm(this.article.compositum, this.search) ?? void 0;
  }

  get sortedReferences() {
    if(!this.article.references) return void 0;
    return sortByTerm(this.article.references.map(a => a.text), this.search) ?? void 0;
  }
}
</script>

<style scoped>
.composita-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 4px;
  margin-bottom: 0px;
  margin-left: 8px;
  margin-right: 0px;
}

.composita-item {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}

.reference-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 4px;
  margin-bottom: 0px;
  margin-left: 8px;
  margin-right: 0px;
}

.reference-item {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}
</style>
