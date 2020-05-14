<template>
  <view-preview
    v-if="editorObj !== null"
    :start="true"
    :filename="filename"
    :object="editorObj"
    :options="{}" />
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ViewPreview from '@components/ViewPreview/ViewPreview.vue'
import XmlObject from '../service/parser-functions/xml/Xml'
import EditorObject from '../service/parser-functions/editor/Editor'
import ParserObject from '../service/parser-functions/parser/Parser'
import { localEndpoint } from '../api'
import * as xlsx from 'xlsx'

const replace = async (input: string, regex: RegExp, replacer: any) => {
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
    ViewPreview
  }
})
export default class ArticleView extends Vue {

  @Prop({required: true}) xml: string
  @Prop({required: true}) filename: string

  parserDefinitionPath = '/static/parser-xml/'
  editorObj: null|any = null
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
    const xmlWithImports = await (await fetch(path)).text()
    // replace the <?import {{filename}}> tags with contents of the referenced file
    return replace(xmlWithImports, /<\?import "(.+)" \?>/gi, async (match: string, capture: string) => {
      // get the imported file
      return (await (await fetch(this.parserDefinitionPath + capture)).text())
        // remove the opening xml tag from the imported file
        .replace(/<\?xml.+\?>/gi, '')
    })
  }

  async mounted() {
    console.log(this.xml)
    this.defs = await this.getAllParserDefinitions()
    const parserFilePath = this.parserDefinitionPath + 'parser.xml'
    const parserXML = await this.getParserMainDef(parserFilePath)
    console.log(parserXML)
    const parser = new ParserObject.ParserBase(parserXML, parserFilePath, this.getAdditionalFile)
    const xmlObj = new XmlObject.XmlBase(this.xml, (...a: any[]) => console.log('changed 1', a))
    this.editorObj = new EditorObject.EditorBase(parser, xmlObj, (...a: any[]) => console.log('changed 2', a))
  }
}
</script>
<style lang="scss" scoped>
</style>
