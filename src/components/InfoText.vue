<template>
  <div>
    <div class="pa-2 mb-2 grey--text text-center" v-if="error">
      could not load {{ path }}.
    </div>
    <div class="info-text" v-else>
      <slot />
      <div class="pa-2 grey--text text-center" v-if="html === ''">
        <v-icon>code</v-icon> <br> "{{ path }}" is empty
      </div>
      <div v-if="subHtml !== null && !subDialog">
        <div>
          <v-btn @click="subHtml = null" text small><v-icon small>arrow_back</v-icon> Zurück</v-btn>
        </div>
        <div ref="infoContent" class="info-content" v-html="subHtml" />
        <div>
          <v-btn @click="subHtml = null" text small><v-icon small>arrow_back</v-icon> Zurück</v-btn>
        </div>
      </div>
      <div
        v-else
        v-html="html"
        ref="infoContent"
        class="info-content"
        :style="lines && !expanded ? {height: (lines * 1.6) + 'em', overflow: 'hidden'} : {}"
      />
      <div class="text-center" v-if="lines !== null">  
        <v-btn color="primary" @click="expanded = !expanded" text rounded>
          <span v-if="!expanded">Mehr</span>
          <span v-else>Weniger</span>
          &nbsp;anzeigen
        </v-btn>
      </div>
      <div class="pt-3" v-if="showLinkList && links.length">
        <h3>Weiterführend</h3>
        <ul class="mt-3 pl-4">
          <li v-for="link in links" :key="link.link">
            <a @click.prevent="maybeInternalLink(link.link)" :href="link.link">{{ link.text }}</a>
          </li>
        </ul>
      </div>
      <v-dialog v-model="showSubDialog" max-width="1000" color="#2b2735" scrollable v-if="subDialog">
        <v-card text class="fill-height pa-4">
          <div class="close-btn">
            <v-btn :href="subInternalUrl" target="_blank" class="mr-2" text icon v-if="subInternalUrl"><v-icon dark>mdi-open-in-new</v-icon></v-btn>
            <v-btn @click="showSubDialog = false" class="mr-2" text icon><v-icon dark>close</v-icon></v-btn>
          </div>
          <v-card-text class="pa-0 fill-height">
            <info-text class="pa-4 white fill-height" :path="subUrl" v-if="subUrl" />
            <div v-else>No subUrl!</div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getWebsiteHtml, isExternUrl, isLocalUrl } from '../api'

@Component({ name: 'info-text' })
export default class InfoText extends Vue {

  @Prop({ default: null }) path: string|null
  @Prop({ default: false }) subDialog: boolean
  @Prop({ default: false }) linkList: boolean|string
  @Prop({ default: null }) lines: number|null

  expanded = false
  html: string|null = null
  subHtml: string|null = null
  subUrl: string|null = null
  subInternalUrl: string|null = null
  showSubDialog: boolean = false
  error = false
  prefix = 'https://vawadioe.acdh.oeaw.ac.at/lioetxt/'

  maybeInternalLink(l: string) {
    if (l.indexOf(this.prefix) > -1) {
      const link = l.replace(this.prefix, '')
      this.$router.push({ path: '/resources', query: { link } })
    } else {
      window.open(l)
    }
  }

  get showLinkList() {
    return this.linkList === '' || this.linkList === true
  }

  get links() {
    if (this.html !== null) {
      const e = document.createElement('div')
      e.innerHTML = this.html
      return Array.from(e.querySelectorAll(`a[href]`))
        .map((v) => {
          return {
            text: v.textContent,
            link: v.getAttribute('href') as string
          }
        })
    } else {
      return []
    }
  }

  @Watch('html')
  @Watch('subHtml')
  htmlChanged() {
    Vue.nextTick(() => {
      const aIcHtml: any = this.$refs['infoContent']
      aIcHtml.querySelectorAll('a').forEach((aLnk: any) => {
        // first remove the handler, so we can’t have duplicate listeners
        aLnk.removeEventListener('click', this.linkClickHandler)
        aLnk.addEventListener('click', this.linkClickHandler)
        if (aLnk.href !== aLnk.href.replace(this.prefix, '') && !isLocalUrl(aLnk.href)) {
          aLnk.dataset.infoLnk = aLnk.href
          aLnk.href = '/resources?link=' + encodeURIComponent(aLnk.href.replace(this.prefix, ''))
        }
      }, this)
    })
  }

  async linkClickHandler(e: Event) {
    if (e.target && e.target instanceof HTMLAnchorElement && e.target.href) {
      e.preventDefault()
      const iLU = isLocalUrl(e.target.href)
      if (iLU) {
        this.$router.push(iLU)
      } else if (e.target.hash === '#top') {
        if (this.subDialog) {
          document.body.scrollTop = 0
          document.documentElement.scrollTop = 0
        } else {
          const el = (this.$parent.$el.parentElement as HTMLElement)
          el.scrollTop = 0
        }
      } else if (!e.target.dataset.infoLnk && isExternUrl(e.target.href)) {
        window.open(e.target.href, '_blank')
      } else {
        if (this.subDialog) {
          this.subUrl = e.target.dataset.infoLnk || e.target.href
          this.subInternalUrl = e.target.dataset.infoLnk ? e.target.href : null
          this.showSubDialog = true
        } else {
          this.subHtml = await getWebsiteHtml(e.target.dataset.infoLnk || e.target.href)
        }
      }
    }
  }

  @Watch('showSubDialog')
  ssdChanged(nVal: boolean) {
    if (!nVal) {
      this.subUrl = null
      this.subInternalUrl = null
    }
  }

  maybeExpand() {
    this.lines = null
  }

  @Watch('path')
  async init() {
    if (this.path !== null) {
      try {
        console.log('init/path', this.path)
        this.html = await getWebsiteHtml(this.path)
        this.htmlChanged()
      } catch (e) {
        console.log('error', e)
        this.error = true
      }
    }
  }

  async mounted() {
    this.init()
  }
}
</script>
<style lang="scss" scoped>
.close-btn {
  position: absolute;
  right: 0;
}
div /deep/ .frame > p:last-child {
  margin-bottom: 0;
}
.info-text{
  max-width: 47.5em;
  margin-left: auto;
  margin-right: auto;
}
.info-text /deep/ h1,
.info-text /deep/ h2,
.info-text /deep/ h3 {
  margin-bottom: .35em;
}
div /deep/ a{
  text-decoration: none;
}
div /deep/ a.button {
  display: inline-block;
  background-color: #408ca3;
  color: #fff;
  font-size: 18px;
  border-radius: 5px;
  padding: 10px 15px;
}
.info-content /deep/ {
  img {
    max-width: 100%;
    height: auto;
  }
  .fx-table-1, .fx-table-2 {
    border-collapse: collapse;
    width: 100%;
  }
  .fx-table-2 {
    table-layout: fixed;
  }
  .fx-table-1 td, .fx-table-1 th, .fx-table-2 td, .fx-table-2 th {
    border: 1px solid #fff;
    padding: 12px;
    vertical-align: middle;
    p:last-child {
      margin-bottom: 0;
    }
  }
  .fx-table-1 tr:nth-child(even), .fx-table-2 tr:nth-child(even) {
    background-color: #ebf3f5;
  }
  .fx-table-1 th, .fx-table-2 th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #3b89a0;
    color: white;
  }
  .frame-space-before-extra-small {
    margin-top: 0.5rem;
  }
  .frame-space-before-small {
    margin-top: 1rem;
  }
  .frame-space-before-medium {
    margin-top: 2rem;
  }
  .frame-space-before-large {
    margin-top: 3rem;
  }
  .frame-space-before-extra-large {
    margin-top: 5rem;
  }
  .frame-space-after-extra-small {
    margin-bottom: 0.5rem;
  }
  .frame-space-after-small {
    margin-bottom: 1rem;
  }
  .frame-space-after-medium {
    margin-bottom: 2rem;
  }
  .frame-space-after-large {
    margin-bottom: 3rem;
  }
  .frame-space-after-extra-large {
    margin-bottom: 5rem;
  }
  .fx-box {
    .col-12 {
      padding: 0.5rem;
    }
    .frame-default {
      background-color: #3b89a0;
      height: 100%;
      padding: 0.75rem;
      color: #fff;
    }
    .frame-default a {
      color: #fff;
      text-decoration: underline;
    }
    .ce-center figure.image {
      display: flex;
      min-height: 7rem;
    }
    .ce-center img, .ce-center a {
      display: block;
      margin: auto auto;
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 6rem;
      text-decoration: none;
    }
  }
}
</style>
