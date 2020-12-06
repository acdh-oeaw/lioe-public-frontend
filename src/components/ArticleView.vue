<template>
  <div>
    <v-layout class="article-tools" align-end>
      <v-flex @click="$emit('handleArticleClick')" xs12>
        <PreviewContent
          :geo-store="geoStore"
          :content="topData"
          v-for="(topData, tdKey) in topDatas"
          :key="'td' + tdKey"
        />
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn small rounded text @click="$emit('toggleAll')">{{
          isEveryArticleExpanded ? "Einklappen" : "Ausklappen"
        }}</v-btn>
      </v-flex>
      <!-- <v-flex v-if="userStore.showPdfPrintButton"> -->
       <v-flex class="text-xs-right">
        <v-btn small rounded text @click="$emit('downloadPdfArticle')">PDF</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn small rounded text @click="$emit('printArticle')">PRINT</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn small rounded text @click="$emit('showEditor')">XML/TEI</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-menu open-on-hover max-width="400" max-height="95vh" top left>
          <template v-slot:activator="{ on }">
            <v-btn color="grey" class="mr-3" small v-on="on" icon text>
              <v-icon>info_outline</v-icon>
            </v-btn>
          </template>
          <info-text
            class="elevation-24 pa-4 white"
            path="wboe-artikel/grammatische-angaben-short/"
          />
          <!-- <v-btn block color="ci" class="ma-0" dark>Weitere Informationen</v-btn> -->
        </v-menu>
      </v-flex>
    </v-layout>
    <v-expansion-panels
      :value="value"
      @change="$emit('input', $event)"
      v-if="editorObj != null"
      class="mt-3 article-panels"
      @click.native="$emit('article-click', $event)"
      accordion
      multiple
    >
      <article-fragment-panel
        v-show="verbreitung"
        title="Verbreitung"
        ext-info-url="wboe-artikel/verbreitung/"
        info-url="wboe-artikel/verbreitung-short/"
      >
        <template v-if="verbreitung">
          <PreviewContent
            :geo-store="geoStore"
            v-for="(v, i) in verbreitung"
            :key="'v' + i"
            :content="v"
          />
        </template>
      </article-fragment-panel>
      <article-fragment-panel
        v-show="belegauswahl || lautung.length > 0"
        title="Lautung"
        ext-info-url="wboe-artikel/lautung/"
        info-url="wboe-artikel/lautung-short/"
      >
        <template v-if="lautung.length > 0">
          <article-fragment-header title="Überblick" />
          <!-- ext-info-url="wboe-artikel/ueberblick/" info-url="wboe-artikel/ueberblick-short/" -->
          <PreviewContent
            :geo-store="geoStore"
            v-for="(u, i) in lautung"
            :key="'u' + i"
            :content="u"
          />
        </template>
        <template v-if="belegauswahl">
          <article-fragment-header class="mb-3" title="Belegauswahl" />
          <!--  ext-info-url="wboe-artikel/belegauswahl/" info-url="wboe-artikel/belegauswahl-short/" -->
          <PreviewContent
            :geo-store="geoStore"
            v-for="(b, i) in belegauswahl"
            :key="'b' + i"
            :content="b"
          />
        </template>
      </article-fragment-panel>
      <article-fragment-panel
        v-show="etymologie"
        title="Etymologie"
        ext-info-url="wboe-artikel/etymologie/"
        info-url="wboe-artikel/etymologie-short/"
      >
        <PreviewContent
          v-if="etymologie"
          :geo-store="geoStore"
          :content="etymologie"
        />
      </article-fragment-panel>
      <article-fragment-panel
        v-show="bedeutung"
        title="Bedeutung"
        ext-info-url="wboe-artikel/bedeutung/"
        info-url="wboe-artikel/bedeutung-short/"
      >
        <PreviewContent
          v-if="bedeutung"
          :geo-store="geoStore"
          :content="bedeutung"
        />
      </article-fragment-panel>
      <article-fragment-panel
        v-show="wortbildungen && wortbildungen.length > 0"
        title="Wortbildung"
        ext-info-url="wboe-artikel/wortbildung/"
        info-url="wboe-artikel/wortbildung-short/"
      >
        <template v-if="wortbildungen && wortbildungen.length > 0">
          <PreviewContent
            :content="wortbildung"
            v-for="(wortbildung, wbKey) in wortbildungen"
            :key="'wb' + wbKey"
          />
        </template>
      </article-fragment-panel>
      <article-fragment-panel
        v-show="redewendungen && redewendungen.length > 0"
        title="Redewendungen"
        ext-info-url="wboe-artikel/redewendungen/"
        info-url="wboe-artikel/redewendungen-short/"
      >
        <template v-if="redewendungen && redewendungen.length > 0">
          <PreviewContent
            :geo-store="geoStore"
            :content="redewendung"
            v-for="(redewendung, rwKey) in redewendungen"
            :key="'rw' + rwKey"
          />
        </template>
      </article-fragment-panel>
    </v-expansion-panels>
    <v-tooltip
      top
      color="ci"
      :activator="noteAuthor.el"
      v-if="noteAuthor && noteAuthor.el"
    >
      <span>{{ noteAuthor.name }}</span>
    </v-tooltip>
    <div class="text-xs-right pa-4">
      <v-tooltip top color="ci">
        <template v-slot:activator="{ on }">
          <span v-on="on">{{
            autor.initials ? autor.initials : autor.fullname || ""
          }}</span>
        </template>
        <span>{{ autor.fullname || "" }}</span>
      </v-tooltip>
    </div>
    <QuotationSection
      :noteAutor="noteAuthor"
      :filename="filename"
      :autor="autor"
      :xml="xml"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";
import InfoText from "@components/InfoText.vue";
import ViewPreview from "@components/ViewPreview/ViewPreview.vue";
import XmlObject from "../service/parser-functions/xml/Xml";
import EditorObject from "../service/parser-functions/editor/Editor";
import ParserObject from "../service/parser-functions/parser/Parser";
import PreviewContent from "@components/ViewPreview/PreviewContent.vue";
import ArticleFragmentHeader from "@components/ArticleFragmentHeader.vue";
import ArticleFragmentPanel from "@components/ArticleFragmentPanel.vue";
import QuotationSection from "@components/QuotationSection.vue";

import { localEndpoint } from "../api";
import * as xlsx from "xlsx";
import { userStore } from "../store/user";
import { log } from "util";

const replaceAsync = async (input: string, regex: RegExp, replacer: any) => {
  // we need to remove the 'g' flag, if defined, so that all replacements can be made
  const flags = (regex.flags || "").replace("g", "");
  const re = new RegExp(regex, flags);
  let index = 0;
  let match;
  // tslint:disable-next-line:no-conditional-assignment
  while ((match = re.exec(input.slice(index)))) {
    const value = await replacer(...match);
    index += match.index;
    input =
      input.slice(0, index) + value + input.slice(index + match[0].length);
    index += match[0].length;
    // if 'g' was not defined on flags, break
    if (flags === regex.flags) {
      break;
    }
  }
  return input;
};

interface ParserFile {
  fullFileName: string;
  ext: string;
  JSON?: object;
}

@Component({
  components: {
    InfoText,
    ViewPreview,
    PreviewContent,
    ArticleFragmentHeader,
    ArticleFragmentPanel,
    QuotationSection,
  },
})
export default class ArticleView extends Vue {
  @Prop({ required: true }) xml: string;
  @Prop({ required: true }) filename: string;
  @Prop({ default: {} }) geoStore: any;
  @Prop() value: boolean[];
  @Prop() isEveryArticleExpanded: any;
  @Prop() autor: any;

  parser: any = null;
  parserDefinitionPath = "/static/parser-xml/";
  editorObj: null | any = null;

  topDatas: any = null;
  bedeutung: any = null;
  verbreitung: any = null;
  belegauswahl: any = null;
  etymologie: any = null;
  wortbildungen: any = null;
  redewendungen: any = null;
  lautung: any = null;
  userStore = userStore;

  noteAuthor: any = {
    id: null as any,
    name: null as any,
    el: null as any,
  };

  allDefinitionPaths = [
    "Literaturliste_Belegsätze_und_Sekundärliteratur_WBÖ_gesamt.xlsx",
    "Ortsdatenbank_Orte-Gemeinden-Kleinregionen-Großregionen-Bundesländer_nur+Ö+STir.xlsx",
  ];

  defs: ParserFile[] = [];

  async getAllParserDefinitions(): Promise<ParserFile[]> {
    return Promise.all(
      this.allDefinitionPaths.map(async (d) => {
        const fpath = this.parserDefinitionPath + d;
        const f = await (await fetch(fpath)).arrayBuffer();
        const ext = fpath.substr(fpath.lastIndexOf(".") + 1);
        return {
          fullFileName: fpath,
          ext,
          JSON: await (async () => {
            if (ext === "xls" || ext === "xlsx") {
              const excelFile = xlsx.read(f, { type: "array" });
              const sheet = xlsx.utils.sheet_to_json(
                excelFile.Sheets[excelFile.SheetNames[0]]
              );
              return sheet;
            } else {
              return undefined;
            }
          })(),
        };
      })
    );
  }

  getAdditionalFile(fname: string): ParserFile | undefined {
    return this.defs.find(
      (d) => d.fullFileName === this.parserDefinitionPath + fname
    );
  }

  async getParserMainDef(path: string): Promise<string> {
    // get the orignal file
    const xmlWithImportTags = await (await fetch(path)).text();
    // replace the <?import {{filename}}> tags with contents of the referenced file
    return replaceAsync(
      xmlWithImportTags,
      /<\?import "(.+)" \?>/gi,
      async (match: string, capture: string) => {
        // get the imported file
        return (
          (await (await fetch(this.parserDefinitionPath + capture)).text())
            // remove the opening xml tag from the imported file
            .replace(/<\?xml.+\?>/gi, "")
        );
      }
    );
  }

  async initParser(): Promise<any> {
    this.defs = await this.getAllParserDefinitions();
    const parserFilePath = this.parserDefinitionPath + "parser.xml";
    const parserXML = await this.getParserMainDef(parserFilePath);
    this.parser = new ParserObject.ParserBase(
      parserXML,
      parserFilePath,
      this.getAdditionalFile
    );
  }
  publicationDate: Date | any = null;

  @Watch("xml")
  showArticle() {
    const xmlObj = new XmlObject.XmlBase(this.xml, () => void 0);
    const editorObj = new EditorObject.EditorBase(
      this.parser,
      xmlObj,
      () => void 0
    ) as any;
    let noteObj = editorObj.getAllEditorObjById("note")[0];
    let aNotePersons = {} as any;
    (noteObj.parserObj.options.get(
      "attributes.resp.possibleValues"
    ) as any).forEach((a: any) => {
      aNotePersons[a.value] = a.title;
    });
    if (noteObj.uId) {
      this.noteAuthor = {
        id: "po" + noteObj.uId,
        name: aNotePersons[noteObj.orgXmlObj.attributes.resp],
        el: null,
      };
    }
    // console.log('getNote', noteObj.uId, this.noteAuthor, noteObj)
    this.topDatas = [
      // ...editorObj.getAllEditorObjById('variante'),
      ...editorObj
        .getAllEditorObjById("gramGrp")
        .filter(
          (aGramGrp: any) => aGramGrp.parents[0].parserObj.name === "entry"
        ),
      ...editorObj.getAllEditorObjById("diminutiv"),
      ...editorObj.getAllEditorObjById("movierung"),
      ...editorObj.getAllEditorObjById("shortform"),
      ...editorObj.getAllEditorObjById("kurzform"),
      ...editorObj.getAllEditorObjById("diminuierteskurzwort"),
      ...editorObj.getAllEditorObjById("kurzwort"),
      ...editorObj.getAllEditorObjById("diminuiertekurzform"),
      ...editorObj.getAllEditorObjById("nebenform"),
    ];
    this.bedeutung = editorObj.getEditorObjById("senseMain");
    this.verbreitung = editorObj.getAllEditorObjById("usg-geo-verbreitung");
    this.belegauswahl = editorObj.getAllEditorObjById("form-dialect");
    this.etymologie = editorObj.getEditorObjById("etymologie");
    this.wortbildungen = editorObj.getAllEditorObjById("re-compound");
    this.redewendungen = editorObj.getAllEditorObjById("re-MWE");
    this.lautung = editorObj.getAllEditorObjById("note").filter((e: any) => {
      return (
        e.orgXmlObj !== undefined &&
        e.orgXmlObj.attributes !== undefined &&
        e.orgXmlObj.attributes.type === "kommentar" &&
        e.orgXmlObj.childs.length > 0
      );
    });
    this.editorObj = editorObj;
  }

  updated() {
    this.$nextTick(() => {
      if (this.noteAuthor) {
        let aElement: any = document.getElementById(this.noteAuthor.id);
        if (aElement) {
          aElement = aElement.getElementsByClassName("layout-right") as any;
          if (aElement && aElement[0]) {
            this.noteAuthor.el = aElement[0];
          }
        }
      }
    });
  }

  async mounted() {
    const parser = await this.initParser();
    this.showArticle();
  }
}
</script>
<style lang="scss">
.article-panels {
  .h1,
  .h2,
  .h3,
  .h4,
  .h5,
  .h6 {
    display: none;
  }
  [data-geo-sigle] {
    cursor: pointer;
    color: dimgray;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
