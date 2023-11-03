<template>
  <article-fragment-panel v-if="!isEmptyXML(content)" :title="title" :info-url="infoUrl" :ext-info-url="extInfoUrl">
    <div class="article-xml" v-html="content" />
  </article-fragment-panel>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import ArticleFragmentPanel from '@/components/ArticleFragmentPanel.vue'

@Component({
  components: {
    ArticleFragmentPanel
  }
})
export default class ArticleFragment extends Vue {

  @Prop({ default: null }) content: string|null
  @Prop({ default: null }) infoUrl: string|null
  @Prop({ default: null }) extInfoUrl: string|null
  @Prop({ default: null }) title: string|null

  showDetails = false

  isEmptyXML(xml: string): boolean {
    const d = document.createElement('div')
    d.innerHTML = xml
    return d.innerText.trim() === ''
  }
}
</script>

<style lang="scss">
.close-btn {
  position: absolute;
  right: 0;
}
.article-xml {
  font-size: 100%;
  [collection-href] {
    cursor: pointer;
    border-bottom: 1px solid rgba(0,0,0,.2)
  }
  form {
    display: inline-block;
  }
  form[type="dialect"] {
    &[subtype="diminutive"] orth{
      font-style: italic
    }
    &::after{
      display: inline-block;
      margin-left: -.25em;
      margin-right: .25em;
      content: ', ';
    }
    &:last-of-type::after{
      content: '';
      display: none;
    }
  }
  > form[type="lemma"] > orth {
    display: inline-block;
    font-size: 2.5em;
  }
  > form[type="lemma"] + form[type="lemma"]::before {
    content: ','
  }
  cit quote {
    &::before{
      content: "— "
    }
    font-style: italic;
  }
  gram {
    &[type="gender"]::before {
      display: inline;
      content: '(';
    }
    &[type="gender"] + [type="gender"]::before {
      content: none;
    }
    &[type="gender"] ~ [type="gender"]::after {
      content: ', '
    }
    &[type="gender"]:last-of-type::after{
      content: ')';
    }
  }
  > gramgrp{
    padding-left: 1em;
    &::after{
      display: block;
      content: ' ';
      margin-bottom: -1em;
    }
  }
  > form[type=variant] {
    display: block;
  }
  def{
    letter-spacing: .075em;
    &::before{
      content: "'"
    }
    &::after{
      content: "'"
    }
  }
  cit, form[type=dialect] {
    usg[type=geo] {
      &::before {
        opacity: .6;
        margin-right: -.25em;
        display: inline;
        content: '('
      }
      & ~ usg::before {
        content: none;
      }
      &:last-of-type::after {
        opacity: .6;
        margin-left: -.25em;
        content: ')'
      }
      grossregion::before{
        content: ', '
      }
    }
  }
  usg[type=geo] {
    &:last-of-type placename{
      &:last-child{
        &::after{
          display: none;
        }
      }
    } 
  }
  placename[ref] {
    cursor: pointer;
    display: inline;
    opacity: .6;
    &[type=bundesland]{
      &::after{
        content: ';'
      }
    }
    &[type=grossregion]{
      &::after{
        content: ','
      }
    }
    &[type=gemeinde]{
      &::after{
        content: ','
      }
    }
    &:hover{
      text-decoration: underline
    }
  }
  &.belegauswahl{
    pron{
      font-style: italic;
    }
    form:not(:last-child)::after{
      content: ',';
      margin-left: -.25em;
    }
  }
  cit{
    form{
      font-style: italic;
    }
  }
  ref[type="bibl"]{
    font-variant: small-caps;
    * {
      font-variant: normal;
    }
    &::before {
      content: "("
    }
    &::after {
      content: ")"
    }
    &>*:last-child {
      margin-right: -.25em
    }
    &>*:first-child {
      margin-left: -.25em
    }
    citedrange::before{
      content: ":";
      // margin-left: -.25em;
      margin-right: .25em;
    }
  }
  sense {
    margin-bottom: 1em;
    display: block;
    margin-left: 1em;
    padding-left: 1.5em;
    counter-increment: roman-counter;
    &:only-of-type{
      margin-left: 0em;
      padding-left: 0em;
    }
    &:empty{
      display: none;
    }
    &:not(:only-of-type)::before{
      width: 1.6em;
      position: absolute;
      margin-left: -2em;
      font-weight: 700;
      text-align: right;
      content: counter(roman-counter, upper-roman) ". "
    }
    sense {
      margin: 0;
      counter-increment: decimal-counter;
      &:not(:only-of-type)::before{
        font-weight: 700;
        content: counter(decimal-counter, decimal) ". "
      }
      sense {
        margin: 0;
        counter-increment: alpha-counter;
        &:not(:only-of-type)::before{
          font-weight: 700;
          content: counter(alpha-counter, lower-alpha) ") "
        }
        sense {
          margin: 0;
          counter-increment: greek-counter;
          &:not(:only-of-type)::before {
            font-weight: 700;
            content: counter(greek-counter, lower-greek) ". "
          }
        }
      }
    }
  }
}
</style>
