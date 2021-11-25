<template>
  <v-card class="pa-4">
    <div
      v-html="htmlRetro"
      class="retro-box"
    />
    <!-- <code class="mt-4">{{ retroXml }}</code> -->
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({
  components: {
  }
})
// tslint:disable:max-line-length
export default class ArticleRetroRenderer extends Vue {
  @Prop({ required: true }) retroXml: string;
  @Prop({ default: {} }) xmlObjRetro: any;

  htmlRetro: any = null;

  @Watch("retroXml")
  makeHtmlRetro() {
    let renderer = (e: any, t: any) => {
      let out = '';
      if (e) {
        if (e.type === "ELEMENT") {
          let classes: any = []
          let before = ''
          if (e.attributes && Object.keys(e.attributes).length > 0) {
            Object.keys(e.attributes).forEach((a: any) => {
              let av = e.attributes[a].trim()
              let ac = 'a-' + a.toLowerCase()
              classes.push(ac + ' ' + ac + '-' + av.toLowerCase().replaceAll(/[^a-z0-9\s]/g, '').replaceAll(/\s/g, '-'))
              if (a === 'n') {
                before += '<span class="fx-n">' + av + '</span>'
              }
            })
            console.log(e)
          }
          out += '<span class="element e-' + e.name + (classes.length > 0 ? ' ' + classes.join(' ') : '') + '">'
          out += before
          if (e.childs && e.childs.length > 0) {
            e.childs.forEach((c: any) => {
              out += renderer(c, t)
            });
          }
          out += '</span>'
        } else if (e.type === "TEXT") {
          let tVal = e.value.trim()
          if (tVal[0] !== ',' && tVal[0] !== '.' && tVal[0] !== ';' && tVal[0] !== ':' && tVal[0] !== ')' && tVal[0] !== ']' && tVal[0] !== '}') {
            out += '<span class="ws"> </span>'
          }
          out += e.value
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
  }

  async mounted() {
    this.makeHtmlRetro();
  }
}
</script>
<style lang="scss" scoped>
  .retro-box /deep/ {
    .e-entry {
      display: block;
    }
    .e-entry > .e-etym {
      display: block;
    }
    .e-entry > .e-etym:before {
      content: "Etymologie";
      display: block;
      font-weight: bold;
      margin: 0.5rem 0 0.2rem 0;
    }
    .a-type-header {
      display: block;
      margin: 1rem 0 0.25rem 0;
      font-weight: bold;
      font-size: 1.1rem;
    }
    .e-pc:after {
      content: " ";
    }
    .e-quote {
      font-style: italic;
    }
    .e-re {
      display: block;
    }
    .e-form.a-type.a-type-lemma.a-subtype.a-subtype-compound {
      font-style: italic;
    }
    .e-form.a-type.a-type-lemma.a-subtype.a-subtype-compound:first-child {
      margin-right: 2rem;
    }
    .e-note {
      display: block;
      margin: 1rem 0;
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
    }
  }
</style>
