<template>
  <v-card class="pa-4">
    <div
      v-html="htmlRetro"
      :class="'retro-box band-' + (autor && autor.initials ? autor.initials.replace(/WBÖ Band ([0-9]).*/i, '$1') : 'x')"
    />
    <!-- <code class="mt-4">{{ retroXml }}</code> -->
    <template v-for="(h, k) in htmlHeader">
      <v-menu open-on-hover max-width="400" max-height="95vh" top left :key="k" v-if="htmlHeaderUrls[h.name]">
        <template v-slot:activator="{ on }">
          <v-btn color="grey" class="fx-header-info-btn" :style="{top: h.top + 'px'}" small v-on="on" icon text>
            <v-icon>mdi-information-outline</v-icon>
          </v-btn>
        </template>
        <info-text
          class="elevation-24 pa-4 white"
          :path="htmlHeaderUrls[h.name]"
        />
      </v-menu>
    </template>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import InfoText from "@/components/InfoText.vue";

@Component({
  components: {
    InfoText,
  }
})
export default class ArticleRetroRenderer extends Vue {
  @Prop({ required: true }) retroXml: string;
  @Prop({ default: {} }) xmlObjRetro: any;
  @Prop() autor: any
  @Prop() noteAutor: any

  htmlRetro: any = null
  htmlHeader: any = []
  htmlHeaderUrls: any = {
    'start': 'wboe-artikel/artikel-einleitung-retro',
    'etym': 'wboe-artikel/etymologie-retro/',
    'historische-belege': 'wboe-artikel/urkundlich-retro/',
    'belegauswahl-lautung': 'wboe-artikel/lautung-retro/',
    'bedeutung': 'wboe-artikel/bedeutung-retro/',
    'wortbildung-komposita': 'wboe-artikel/wortbildungen-komposita-retro/',
    'wortbildung-ableitung': 'wboe-artikel/wortbildungen-ableitungen-retro/',
    'synonyme': 'wboe-artikel/synonyme-retro/',
    'redewendungen': 'wboe-artikel/redensarten-retro/',
    'bestimmungswort': 'wboe-artikel/lemma-bestimmungswort-retro/',
  }

  @Watch("retroXml")
  makeHtmlRetro() {
    let noNote = false
    let htmlHeader: any = []
    const renderer = (e: any, t: any) => {
      let out = '';
      if (e) {
        if (e.type === 'ELEMENT') {
          let classes: any = []
          let before = ''
          if (e.attributes && Object.keys(e.attributes).length > 0) {
            Object.keys(e.attributes).forEach((a: any) => {
              const av = e.attributes[a].trim()
              const ac = 'a-' + a.toLowerCase()
              classes.push(ac + ' ' + ac + '-' + av.toLowerCase().replaceAll(/[^a-z0-9\s]/g, '').replaceAll(/\s/g, '-'))
              if (a === 'n') {
                before += '<span class="fx-n">' + av + '</span>'
              }
            })
            // console.log(e)
          }
          if (!noNote && e.name === 'etym' && e.parents[0].name === 'entry' && htmlHeader.filter((h: any) => h.name === 'etym').length === 0 && htmlHeader.filter((h: any) => h.name === 'start').length === 0) {
            classes.push('etym-first-no-note')
            noNote = true
          }
          out += '<span class="element e-' + e.name + (classes.length > 0 ? ' ' + classes.join(' ') : '') + '">'
          if (!noNote && e.name === 'note' && e.parents[0].name === 'entry') {
            if (htmlHeader.filter((h: any) => h.name === 'start').length === 0) {
              out += '<div id="i-marker-start" class="i-marker"></div>'
              htmlHeader.push({name: 'start', id: 'start', top: 0})
            }
          }
          if (e.name === 'etym' && e.parents[0].name === 'entry') {
            let markerDg = htmlHeader.filter((h: any) => h.name === 'etym').length
            let markerId = 'etym' + (markerDg > 0 ? '-' + (markerDg + 1) : '')
            out += '<span class="fx-element a-type-header"><div id="i-marker-' + markerId + '" class="i-marker"></div><span class="ws"> </span>Etymologie</span>'
            htmlHeader.push({name: 'etym', id: markerId, top: 0})
          }
          if (e.attributes['type'] && e.attributes['type'].toLowerCase() === 'header') {
            let markerName: any = null
            if (e.childs && e.childs[0] && e.childs[0].type === 'TEXT') {
              markerName = e.childs[0].value.toLowerCase().replace(/[\(\)\.\:\,]/g, '').replace(/ /g, '-').trim()
              const multiNames: any = {
                'historische-belege': ['urkundlich', 'urkundl', 'urkdl-oft-belegt-auswahl', 'urkdl', 'urkundlich', 'histor-belege', 'hist-belege', 'historische-belege', 'urkdl-belege', 'ältere-spr', 'schreibungen-in-späterer-zeit-auswahl', 'belege-in-ält-spr', 'histor-formen', 'histor-belege', 'historische-belege'],
                'wortbildung-komposita': ['trikomposs'],
                'wortbildung-ableitung': ['abtlg'],
                'synonyme': ['synonym', 'syn', 'synn', 'synn-u-sinnverwandte', 'synonyma', 'synn'],
                'redewendungen': ['redensarten', 'stehende-wendungen-und-raa', 'redeww-mit-a', 'raa', 'redewendungen-und-redensarten', 'volkskundliches-und-raa', 'redensarten-und-sprüche', 'raa', 'sachliches-und-raa', 'redensarten-bauernregeln-und-volksglaube'],
              }
              Object.keys(multiNames).forEach((n: string) => {
                if (multiNames[n] && multiNames[n].indexOf(markerName) > -1) {
                  markerName = n
                }
              })
            } else {
              if (e.getXML().toLowerCase().indexOf('bestimmungswort') > -1 || e.getXML().toLowerCase().indexOf('als bestw') > -1) {
                markerName = 'bestimmungswort'
              }
            }
            if (markerName) {
              let markerDg = htmlHeader.filter((h: any) => h.name === markerName).length
              let markerId = markerName + (markerDg > 0 ? '-' + (markerDg + 1) : '')
              out += '<div id="i-marker-' + markerId + '" class="i-marker"></div>'
              htmlHeader.push({name: markerName, id: markerId, top: 0})
            }
          }
          out += before
          if (e.childs && e.childs.length > 0) {
            e.childs.forEach((c: any) => {
              out += renderer(c, t)
            });
          }
          if (e.name === 'pc') {
            out += ' '
          }
          if (e.name === 'def' && e.parents[0].name === 're' && out.trim().slice(-1) === ',') {
            out += '<br>'
          }
          out += '</span>'
        } else if (e.type === 'TEXT') {
          const tVal = e.value.trim()
          if (tVal[0] !== ',' && tVal[0] !== '.' && tVal[0] !== ';' && tVal[0] !== ':' && tVal[0] !== ')' && tVal[0] !== ']' && tVal[0] !== '}') {
            let aPos = this.xmlObjRetro.family.indexOf(e)
            let lChar = ''
            if (aPos > 0) {
              lChar = (this.xmlObjRetro.family.slice(Math.max(0, aPos - 5), aPos - 1).map((e: any) => e.type === 'TEXT' ? e.value : '').join('') || '').slice(-1)
            }
            if (!lChar || (lChar !== '(' && lChar !== '[' && lChar !== '{')) {
              out += '<span class="ws"> </span>'
            }
          }
          if (tVal === 'Belegauswahl (Lautung)') {
            out += 'Lautung'
          // } else if (tVal === 'Wortbildung (Komposita)') {
          //   out += 'Wortbildung'
          } else {
            out += e.value
          }
          // console.log(e.value)
          t += tVal
        } else if (e.type === "PROCESSING_INSTRUCTION") {
          out += '<span class="pi p-' + e.name + '">' + e.value + '</span>'
          t += e.value.trim()
        } else {
          console.log(e)
        }
      }
      return out
    }
    this.htmlRetro = renderer(this.xmlObjRetro.family.filter((e: any) => e.name === 'entry')[0], '');
    this.htmlHeader = htmlHeader
    this.$nextTick(() => {
      this.getHtmlHeaderTop()
    })
    setTimeout(this.getHtmlHeaderTop, 500)
  }

  getHtmlHeaderTop () {
    // console.log('getHtmlHeaderTop', this.htmlHeader)
    this.htmlHeader.forEach((h: any) => {
      const aD = document.getElementById('i-marker-' + h.id)
      if (aD) {
        h.top = aD.offsetTop
      }
    })
  }

  async mounted() {
    this.makeHtmlRetro();
  }
}
</script>

<style lang="scss" scoped>
  .fx-header-info-btn {
    position: absolute;
    margin-top: 0;
    right: 0.75rem;
  }
  .retro-box ::v-deep {
    #i-marker-start {
      position: absolute;
      top: 0.5rem;
    }
    .e-entry {
      display: block;
    }
    .e-entry > .e-etym {
      display: block;
    }
    .e-entry > .e-form > .e-usg,
    .e-entry > .e-form > .a-type-diminutive {
      display: table;
    }
    .e-entry > .e-form.a-type-lemma,
    .e-entry > .e-gramGrp > .e-gram.a-type-pos,
    .e-entry > .e-gramGrp > .e-gram.a-type-gender {
      display: none;
    }
    .a-type-header {
      display: block;
      margin: 1rem 0 0.25rem 0;
      font-weight: bold;
      font-size: 1.1rem;
    }
    .a-type-header::before {
      content: "";
      border-top: 1px solid #ddd;
      display: block;
      margin-left: -16px;
      margin-right: -16px;
      margin-bottom: 16px;
      margin-top: 16px;
    }
    .etym-first-no-note .a-type-header::before {
      content: none;
      display: none;
    }
    .etym-first-no-note .a-type-header {
      margin-top: 0;
    }
    .e-re {
      display: block;
    }
    .e-form.a-type.a-type-lemma.a-subtype.a-subtype-compound:first-child {
      margin-right: 2rem;
    }
    .e-note {
      display: block;
      margin-bottom: 1rem;
      padding-right: 1.5rem;
    }
    .e-sense.a-n {
      display: block;
      position: relative;
      margin-left: 2rem;
      margin-bottom: 0.5rem;
      margin-top: 0.5rem;
    }
    .fx-n {
      margin-right: 0.5rem;
    }
    .e-sense.a-n > .fx-n {
      position: absolute;
      left: -2rem;
      font-weight: bold;
    }
    .e-sense.a-n > .e-usg {
      display: block;
      margin-bottom: 0.3rem;
      letter-spacing: 0.15rem;
    }
    .e-sense > .e-sense {
      display: table;
    }
    .e-sense > .e-def:first-child {
      display: table;
    }
    .e-pb.a-facs {
      display: none;
    }
    .e-form.a-type.a-type-lemma.a-subtype.a-subtype-compound {
      font-style: italic;
    }
    .e-pRef {
      font-style: italic;
    }
    .e-q {
      font-style: italic;
    }
    .e-quote {
      font-style: italic;
    }
    .e-orth {
      font-style: italic;
    }
    // .e-sense > .e-def {
    //   font-style: italic;
    // }
    .i-marker {
      position: relative;
    }
    .a-opt-true {
      letter-spacing: normal!important;
    }
    .e-re > .e-def {
      letter-spacing: 0.15rem;
    }
  }
  .retro-box.band-2 ::v-deep {
    .fx-n + .e-usg {
      display: inline!important;
    }
    .fx-n + .e-usg::after {
      content: "";
      display: table;
    }
    .e-form.a-type.a-type-lemma.a-subtype.a-subtype-compound:first-child {
      margin-right: 0;
    }
    .e-m {
      font-style: italic;
    }
    .e-c {
      font-style: italic;
    }
    .e-xr.a-type-synonym > .e-ref {
      font-style: italic;
    }
    .e-re > .e-sense > .e-def:first-child {
      display: inline;
    }
    .e-form.a-n {
      display: block;
      position: relative;
      margin-left: 2rem;
      margin-bottom: 0.5rem;
      margin-top: 0.5rem;
    }
    .fx-n::before {
      content: "";
      display: table;
    }
    .e-form.a-n > .fx-n {
      position: absolute;
      left: -2rem;
      font-weight: bold;
    }
    .e-form.a-n > .e-usg {
      display: block;
      margin-bottom: 0.3rem;
      letter-spacing: 0.15rem;
    }
  }
</style>
