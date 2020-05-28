<template>
  <v-expansion-panels
    :value="value"
    @change="$emit('input', $event)" v-if="editorObj != null"
    class="mt-3 article-panels"
    @click.native="$emit('article-click', $event)"
    accordion
    multiple>
    <article-fragment-panel
      v-show="verbreitung"
      title="Verbreitung"
      ext-info-url="wboe-artikel/verbreitung/"
      info-url="wboe-artikel/verbreitung-short/">
      <template v-if="verbreitung">
        <PreviewContent :geo-store="geoStore" v-for="(v, i) in verbreitung" :key="'v'+i" :content="v" />
      </template>
    </article-fragment-panel>
    <article-fragment-panel
      v-show="belegauswahl || lautung.length > 0"
      title="Lautung"
      ext-info-url="wboe-artikel/lautung/"
      info-url="wboe-artikel/lautung-short/">
      <template v-if="lautung.length > 0">
        <article-fragment-header title="Überblick" /> <!-- ext-info-url="wboe-artikel/ueberblick/" info-url="wboe-artikel/ueberblick-short/" -->
        <PreviewContent :geo-store="geoStore" v-for="(u, i) in lautung" :key="'u'+i" :content="u" />
      </template>
      <template v-if="belegauswahl">
        <article-fragment-header class="mb-3" title="Belegauswahl" /> <!--  ext-info-url="wboe-artikel/belegauswahl/" info-url="wboe-artikel/belegauswahl-short/" -->
        <PreviewContent :geo-store="geoStore" v-for="(b, i) in belegauswahl" :key="'b'+i" :content="b" />
      </template>
    </article-fragment-panel>
    <article-fragment-panel
      v-show="etymologie"
      title="Etymologie"
      ext-info-url="wboe-artikel/etymologie/"
      info-url="wboe-artikel/etymologie-short/">
      <PreviewContent v-if="etymologie" :geo-store="geoStore" :content="etymologie" />
    </article-fragment-panel>
    <article-fragment-panel
      v-show="bedeutung"
      title="Bedeutung"
      ext-info-url="wboe-artikel/bedeutung/"
      info-url="wboe-artikel/bedeutung-short/">
      <PreviewContent v-if="bedeutung" :geo-store="geoStore" :content="bedeutung" />
    </article-fragment-panel>
    <article-fragment-panel
      v-show="wortbildung"
      title="Wortbildung"
      ext-info-url="wboe-artikel/wortbildung/"
      info-url="wboe-artikel/wortbildung-short/">
      <PreviewContent v-if="wortbildung" :content="wortbildung" />
    </article-fragment-panel>
    <article-fragment-panel
      v-show="redewendungen"
      title="Redewendungen"
      ext-info-url="wboe-artikel/redewendungen/"
      info-url="wboe-artikel/redewendungen-short/">
      <PreviewContent v-if="redewendungen" :geo-store="geoStore" :content="redewendungen" />
    </article-fragment-panel>
  </v-expansion-panels>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ViewPreview from '@components/ViewPreview/ViewPreview.vue'
import XmlObject from '../service/parser-functions/xml/Xml'
import EditorObject from '../service/parser-functions/editor/Editor'
import ParserObject from '../service/parser-functions/parser/Parser'
import PreviewContent from '@components/ViewPreview/PreviewContent.vue'
import ArticleFragmentHeader from '@components/ArticleFragmentHeader.vue'
import ArticleFragmentPanel from '@components/ArticleFragmentPanel.vue'
import { localEndpoint } from '../api'
import * as xlsx from 'xlsx'

const replaceAsync = async (input: string, regex: RegExp, replacer: any) => {
  // we need to remove the 'g' flag, if defined, so that all replacements can be made
  const flags = (regex.flags || '').replace('g', '');
  const re = new RegExp(regex, flags);
  let index = 0;
  let match;
  // tslint:disable-next-line:no-conditional-assignment
  while ((match = re.exec(input.slice(index)))) {
    const value = await replacer(...match);
    index += match.index;
    input = input.slice(0, index) + value + input.slice(index + match[0].length);
    index += match[0].length;
    // if 'g' was not defined on flags, break
    if (flags === regex.flags) {
      break
    }
  }
  return input
}

interface ParserFile {
  fullFileName: string
  ext: string
  JSON?: object
}

@Component({
  components: {
    ViewPreview,
    PreviewContent,
    ArticleFragmentHeader,
    ArticleFragmentPanel
  }
})
export default class ArticleView extends Vue {

  @Prop({required: true}) xml: string
  @Prop({required: true}) filename: string
  @Prop({ default: {} }) geoStore: any
  @Prop() value: boolean[]

  parser: any = null
  parserDefinitionPath = '/static/parser-xml/'
  editorObj: null|any = null

  bedeutung: any = null
  verbreitung: any = null
  belegauswahl: any = null
  etymologie: any = null
  wortbildung: any = null
  redewendungen: any = null
  lautung: any = null

  allDefinitionPaths = [
    'Literaturliste_Belegsätze_und_Sekundärliteratur_WBÖ_gesamt.xlsx',
    'Ortsdatenbank_Orte-Gemeinden-Kleinregionen-Großregionen-Bundesländer_nur+Ö+STir.xlsx'
  ]

  defs: ParserFile[] = []

  async getAllParserDefinitions(): Promise<ParserFile[]> {
    return Promise.all(this.allDefinitionPaths.map(async (d) => {
      const fpath = this.parserDefinitionPath + d
      const f = await (await fetch(fpath)).arrayBuffer()
      const ext = fpath.substr(fpath.lastIndexOf('.') + 1);
      return {
        fullFileName: fpath,
        ext,
        JSON: await (async () => {
          if (ext === 'xls' || ext === 'xlsx') {
            const excelFile = xlsx.read(f, {type: 'array'})
            const sheet = xlsx.utils.sheet_to_json(excelFile.Sheets[excelFile.SheetNames[0]])
            return sheet
          } else {
            return undefined
          }
        })()
      }
    }))
  }

  getAdditionalFile(fname: string): ParserFile|undefined {
    return this.defs.find(d => d.fullFileName === this.parserDefinitionPath + fname)
  }

  async getParserMainDef(path: string): Promise<string> {
    // get the orignal file
    const xmlWithImportTags = await (await fetch(path)).text()
    // replace the <?import {{filename}}> tags with contents of the referenced file
    return replaceAsync(xmlWithImportTags, /<\?import "(.+)" \?>/gi, async (match: string, capture: string) => {
      // get the imported file
      return (await (await fetch(this.parserDefinitionPath + capture)).text())
        // remove the opening xml tag from the imported file
        .replace(/<\?xml.+\?>/gi, '')
    })
  }

  async initParser(): Promise<any> {
    this.defs = await this.getAllParserDefinitions()
    const parserFilePath = this.parserDefinitionPath + 'parser.xml'
    const parserXML = await this.getParserMainDef(parserFilePath)
    this.parser = new ParserObject.ParserBase(parserXML, parserFilePath, this.getAdditionalFile)
  }

  @Watch('xml')
  showArticle() {
    const xmlObj = new XmlObject.XmlBase(this.xml, () => void(0))
    const editorObj = new EditorObject.EditorBase(this.parser, xmlObj, () => void(0)) as any
    this.bedeutung = editorObj.getEditorObjById('senseMain')
    this.verbreitung = editorObj.getAllEditorObjById('usg-geo-verbreitung')
    this.belegauswahl = editorObj.getAllEditorObjById('form-dialect')
    this.etymologie = editorObj.getEditorObjById('etymologie')
    this.wortbildung = editorObj.getEditorObjById('re-compound')
    this.redewendungen = editorObj.getEditorObjById('re-MWE')
    this.lautung = editorObj.getAllEditorObjById('note').filter((e: any) => {
      return e.orgXmlObj !== undefined
        && e.orgXmlObj.attributes !== undefined
        && e.orgXmlObj.attributes.type === 'kommentar'
        && e.orgXmlObj.childs.length > 0
    })
    this.editorObj = editorObj
  }

  async mounted() {
    const parser = await this.initParser()
    this.showArticle()
  }
}
</script>
<style lang="scss">
.article-panels{
  .h1, .h2, .h3, .h4, .h5, .h6 {
    display: none;
  }
  [data-geo-sigle] {
    cursor: pointer;
    color: dimgray;
    &:hover{
      text-decoration: underline;
    }
  }
}
</style>
