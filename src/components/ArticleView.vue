<template>
  <div v-if="!refresh">
    <v-layout class="article-tools fx-info-2" align-end>
      <v-flex @click="$emit('handleArticleClick')" xs12>
        <PreviewContent
          :geo-store="geoStore"
          :content="topData"
          v-for="(topData, tdKey) in topDatas"
          :key="'td' + tdKey"
        />
      </v-flex>
      <v-flex class="text-xs-right"
        v-if="!isRetro"
      >
        <v-btn small rounded text @click="$emit('toggleAll')">{{
          isEveryArticleExpanded ? "Einklappen" : "Ausklappen"
        }}</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn small rounded text @click="$emit('printArticle')">PDF/PRINT</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn small rounded text @click="$emit('showEditor')">XML/TEI</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-menu open-on-hover max-width="400" max-height="95vh" top left>
          <template v-slot:activator="{ on }">
            <v-btn color="grey" class="mr-3" small v-on="on" icon text>
              <v-icon>mdi-information-outline</v-icon>
            </v-btn>
          </template>
          <info-text
            class="elevation-24 pa-4 white"
            :path="isRetro ? 'wboe-artikel/grammatische-angaben-retro/' : 'wboe-artikel/grammatische-angaben-short/'"
          />
        </v-menu>
      </v-flex>
    </v-layout>
    <template v-if="isRetro">
      <article-retro-renderer
        :xmlObjRetro="xmlObjRetro"
        :retroXml="retroXml"
        :autor="autor"
        :noteAutor="noteAuthor"
        class="mt-3 article-panels"
        v-if="retroXml"
      />
    </template>
    <v-expansion-panels
      :value="value"
      @change="$emit('input', $event)"
      v-else-if="editorObj != null"
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
        v-if="(lautung.length > 0 && lautungTxt.length >= 20) || (belegauswahl && belegauswahl.length)"
      >
        <template v-if="lautung.length > 0 && lautungTxt.length >= 20">
          <article-fragment-header title="Überblick" />
          <PreviewContent
            :geo-store="geoStore"
            v-for="(u, i) in lautung"
            :key="'u' + i"
            :content="u"
          />
        </template>
        <template v-if="belegauswahl && belegauswahl.length">
          <article-fragment-header class="mb-3" title="Belegauswahl" />
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
    <div class="text-xs-right pa-4 text-right">
      <v-tooltip top color="ci" :disabled="!autor.initials || autor.fullname.length === 0">
        <template v-slot:activator="{ on }">
          <span v-on="on">{{
            autor.initials ? autor.initials : autor.fullname || ""
          }}</span>
        </template>
        <span>{{ autor.fullname || "" }} </span>
      </v-tooltip>
    </div>
    <div class="row align-center mx-auto justify-center">
      <div :class="isRetro ? 'col-12 col-sm-11 col-md-8' : 'col-12 col-sm-11 col-md-10'">
        <QuotationSection
          :noteAutor="noteAuthor"
          :filename="filename"
          :lautung="lautung"
          :autor="autor"
          :retroAutor="retroAutor"
          :xml="xml"
          :isRetro="isRetro"
          :pbFacs="pbFacs"
        />
      </div>
      <div class="col-12 col-md-2" v-if="isRetro">
        <div class="mx-auto" style="width: fit-content;">
          <p>In Zusammenarbeit mit</p>
          <img class="d-block" style="max-width: 100%; height: auto" src="/assets/images/oeaw_logo_de.svg" width="250" height="100" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import InfoText from "@/components/InfoText.vue";
import ViewPreview from "@/components/ViewPreview/ViewPreview.vue";
import XmlObject from "@/service/parser-functions/xml/Xml";
import EditorObject from "@/service/parser-functions/editor/Editor";
import ParserObject from "@/service/parser-functions/parser/Parser";
import PreviewContent from "@/components/ViewPreview/PreviewContent.vue";
import ArticleFragmentHeader from "@/components/ArticleFragmentHeader.vue";
import ArticleRetroRenderer from "@/components/ArticleRetroRenderer.vue";
import ArticleFragmentPanel from "@/components/ArticleFragmentPanel.vue";
import QuotationSection from "@/components/QuotationSection.vue";

import * as xlsx from "xlsx";
import { userStore } from "@/store/user";

const replaceAsync = async (input: string, regex: RegExp, replacer: any) => {
  // we need to remove the 'g' flag, if defined, so that all replacements can be made
  const flags = (regex.flags || "").replace("g", "");
  const re = new RegExp(regex, flags);
  let index = 0;
  let match;
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
    ArticleRetroRenderer,
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
  @Prop() retroAutor: any;
  @Prop({ default: null}) retroXml: string[];
  @Prop({ default: false}) isRetro: boolean[];
  @Prop({ default: null}) pbFacs: string[];

  parser: any = null;
  parserDefinitionPath = "/parser-xml/";
  editorObj: null | any = null;

  xmlObjRetro: null | any = null;

  topDatas: any = null;
  bedeutung: any = null;
  verbreitung: any = null;
  belegauswahl: any = null;
  etymologie: any = null;
  wortbildungen: any = null;
  redewendungen: any = null;
  lautung: any = null;
  lautungTxt: any = null;
  userStore = userStore;

  refresh: boolean = false;

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

  @Watch("refresh")
  refreshing() {
    if (this.refresh) {
      this.$nextTick(() => {
        this.refresh = false
      })
    }
  }

  @Watch("xml")
  showArticle() {
    const xmlObj = new XmlObject.XmlBase(this.xml, () => void 0);
    if (this.retroXml) {
      this.xmlObjRetro = xmlObj
      this.editorObj = null
      this.topDatas = null
      console.log('retro', this.xmlObjRetro)
    } else {
      this.xmlObjRetro = null
      const editorObj = new EditorObject.EditorBase(
        this.parser,
        xmlObj,
        () => void 0
      ) as any;
      if (Object.keys(editorObj.errors).length > 0) {
        Object.keys(editorObj.errors).forEach(e => {
          editorObj.errors[e].forEach((e2: any, i: any) => {
            console.log('err', e, i, e2)
          })
        })
        console.log('editorObj Error', Object.keys(editorObj.errors).length, editorObj.errors[Object.keys(editorObj.errors)[0]][0], editorObj)
      }
      let noteObj = editorObj.getAllEditorObjById("note")[0];
      let aNotePersons = {} as any;
      if (noteObj && noteObj.parserObj && noteObj.parserObj.options) {
        (noteObj.parserObj.options.getOption("attributes.resp.possibleValues") as any).forEach((a: any) => {
          aNotePersons[a.value] = a.title;
        });
      }
      if (noteObj && noteObj.uId) {
        this.noteAuthor = {
          id: "po" + noteObj.uId,
          name: aNotePersons[noteObj.orgXmlObj.attributes.resp],
          el: null,
        };
      }
      this.topDatas = [
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
      this.lautungTxt = [].concat.apply([], this.lautung.map((e: any) => e.orgXmlObj.getValue())).join(' ')
      // console.log(this.lautung, this.lautungTxt)
      this.editorObj = editorObj;
    }
    this.refresh = true
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
