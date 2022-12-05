<template>
  <v-card class="pa-4">
    <div
      v-html="htmlRetro"
      class="retro-box"
    />
    <!-- <code class="mt-4">{{ retroXml }}</code> -->
    <template v-for="(h, k) in htmlHeader">
      <v-menu open-on-hover max-width="400" max-height="95vh" top left :key="k" v-if="htmlHeaderUrls[h.name]">
        <template v-slot:activator="{ on }">
          <v-btn color="grey" class="fx-header-info-btn" :style="{top: h.top + 'px'}" small v-on="on" icon text>
            <v-icon>info_outline</v-icon>
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
import InfoText from "@components/InfoText.vue";

@Component({
  components: {
    InfoText,
  }
})
// tslint:disable:max-line-length
export default class ArticleRetroRenderer extends Vue {
  @Prop({ required: true }) retroXml: string;
  @Prop({ default: {} }) xmlObjRetro: any;

  htmlRetro: any = null
  htmlHeader: any = []
  htmlHeaderUrls: any = {
    'start': 'wboe-artikel/artikel-einleitung-retro',
    'etym': 'wboe-artikel/etymologie-retro/',
    'urkundlich': 'wboe-artikel/urkundlich-retro/',
    'belegauswahl-lautung': 'wboe-artikel/lautung-retro/',
    'bedeutung': 'wboe-artikel/bedeutung-retro/',
    'wortbildung-komposita': 'wboe-artikel/wortbildungen-komposita-retro/',
    'wortbildung-ableitung': 'wboe-artikel/wortbildungen-ableitungen-retro/',
  }

  @Watch("retroXml")
  makeHtmlRetro() {
    let htmlHeader: any = [{name: 'start', top: 0}]
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
          out += '<span class="element e-' + e.name + (classes.length > 0 ? ' ' + classes.join(' ') : '') + '">'
          if (e.name === 'etym' && e.parents[0].name === 'entry') {
            out += '<span class="fx-element a-type-header"><div id="i-marker-etym" class="i-marker"></div><span class="ws"> </span>Etymologie</span>'
            htmlHeader.push({name: 'etym', top: 0})
          }
          if (e.attributes['type'] && e.attributes['type'].toLowerCase() === 'header' && e.childs && e.childs[0] && e.childs[0].type === 'TEXT') {
            const markerName = e.childs[0].value.toLowerCase().replace(' ', '-').replace(/[\(\)]/g, '')
            out += '<div id="i-marker-' + markerName + '" class="i-marker"></div>'
            htmlHeader.push({name: markerName, top: 0})
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
            out += '<span class="ws"> </span>'
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
    this.htmlRetro = '<div id="i-marker-start" class="i-marker"></div>' + renderer(this.xmlObjRetro.family.filter((e: any) => e.name === 'entry')[0], '');
    this.htmlHeader = htmlHeader
    this.$nextTick(() => {
      this.getHtmlHeaderTop()
    })
    setTimeout(this.getHtmlHeaderTop, 500)
  }

  getHtmlHeaderTop () {
    console.log('getHtmlHeaderTop')
    this.htmlHeader.forEach((h: any) => {
      const aD = document.getElementById('i-marker-' + h.name)
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
    right: 0.5rem;
  }
  .retro-box /deep/ {
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
    .e-re {
      display: block;
    }
    .e-form.a-type.a-type-lemma.a-subtype.a-subtype-compound:first-child {
      margin-right: 2rem;
    }
    .e-note {
      display: block;
      margin-bottom: 1rem;
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
    .e-sense > .e-def {
      font-style: italic;
    }
    .i-marker {
      position: relative;
    }
  }
</style>
