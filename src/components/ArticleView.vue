<template>
  <v-expansion-panel
    :value="value"
    @change="$emit('input', $event)" v-if="editorObj != null"
    class="mt-3 article-panels"
    @click.native="$emit('article-click', $event)"
    expand>
    <article-fragment-panel
      v-if="verbreitung"
      title="Verbreitung"
      ext-info-url="wboe-artikel/verbreitung/"
      info-url="wboe-artikel/verbreitung-short/">
      <template>
        <PreviewContent :geo-store="geoStore" v-for="(v, i) in verbreitung" :key="'v'+i" :content="v" />
      </template>
    </article-fragment-panel>
    <article-fragment-panel
      v-if="belegauswahl"
      title="Belegauswahl"
      ext-info-url="wboe-artikel/belegauswahl/"
      info-url="wboe-artikel/belegauswahl-short/">
      <template>
        <PreviewContent :geo-store="geoStore" v-for="(b, i) in belegauswahl" :key="'b'+i" :content="b" />
      </template>
    </article-fragment-panel>
    <article-fragment-panel
      v-if="etymologie"
      title="Etymologie"
      ext-info-url="wboe-artikel/etymologie/"
      info-url="wboe-artikel/etymologie-short/">
      <PreviewContent :geo-store="geoStore" :content="etymologie" />
    </article-fragment-panel>
    <article-fragment-panel
      v-if="bedeutung"
      title="Bedeutung"
      ext-info-url="wboe-artikel/bedeutung/"
      info-url="wboe-artikel/bedeutung-short/">
      <PreviewContent :geo-store="geoStore" :content="bedeutung" />
    </article-fragment-panel>
    <article-fragment-panel
      v-if="wortbildung"
      title="Wortbildung"
      ext-info-url="wboe-artikel/wortbildung/"
      info-url="wboe-artikel/wortbildung-short/">
      <PreviewContent :content="wortbildung" />
    </article-fragment-panel>
    <article-fragment-panel
      v-if="redewendungen"
      title="Redewendungen"
      ext-info-url="wboe-artikel/redewendungen/"
      info-url="wboe-artikel/redewendungen-short/">
      <PreviewContent :geo-store="geoStore" :content="redewendungen" />
    </article-fragment-panel>
  </v-expansion-panel>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ViewPreview from '@components/ViewPreview/ViewPreview.vue'
import XmlObject from '../service/parser-functions/xml/Xml'
import EditorObject from '../service/parser-functions/editor/Editor'
import ParserObject from '../service/parser-functions/parser/Parser'
import PreviewContent from '@components/ViewPreview/PreviewContent.vue'
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
}
</style>
