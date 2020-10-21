<template>
  <v-layout column>
    <v-flex xs12>
      <v-autocomplete
        class="article-search"
        label="Suche Artikel…"
        :value="{ text: title, value: filename.replace('.xml', '') }"
        :loading="loading"
        clearable
        solo
        text
        @change="loadArticle"
        :items="articles"
        prepend-inner-icon="search"
      />
      <template v-if="articleAvailable">
        <v-layout align-end>
          <v-flex @click="handleArticleClick" xs12>
            <div v-html="lemmaXML" class="lemma" />
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
                path="wboe-artikel/lemma-short/"
              />
              <!-- <v-btn block color="ci" class="ma-0" dark>Weitere Informationen</v-btn> -->
            </v-menu>
          </v-flex>
        </v-layout>
        <article-view
          @article-click="handleArticleClick"
          @handleArticleClick="handleArticleClick"
          @toggleAll="toggleAll"
          @printArticle="printArticle"
          @showEditor="showEditor = true"
          :autor="editor"
          :isEveryArticleExpanded="isEveryArticleExpanded"
          v-if="articleXML !== null"
          :xml="articleXML"
          :filename="filename"
          v-model="expanded"
          :geo-store="geoStore"
        />
        <v-flex
          class="comment-box"
          xs12
          sm12
          md10
          lg8
          xl6
          offset-md1
          offset-lg2
          offset-xl3
          v-if="userStore.showComment"
        >
          <v-card>
            <v-card-text class="pa-0">
              <iframe :src="commentUrl" class="comment" />
            </v-card-text>
          </v-card>
        </v-flex>
      </template>
      <template v-else>
        <h3 class="pt-5 mt-5 text-center grey--text">Der Artikel zu ”{{ filename }}” befindet sich derzeit in Bearbeitung.</h3>
      </template>
    </v-flex>
    <v-dialog
      transition="none"
      v-model="showEditor"
      max-width="1000"
      content-class="fill-height"
      color="#2b2735"
      scrollable
    >
      <v-card color="#342f40" dark text class="fill-height">
        <v-card-title class="pt-1 pb-1">
          <v-flex>{{ filename }}</v-flex>
          <v-flex class="text-right">
            <v-btn
              class="pl-3 pr-3"
              small
              rounded
              text
              @click="downloadEditorXML"
              >download</v-btn
            >
            <v-btn small rounded text @click="saveEditorXML">view</v-btn>
          </v-flex>
        </v-card-title>
        <v-card-text class="pa-0 fill-height">
          <xml-editor
            v-if="showEditor"
            :show="showEditor"
            class="fill-height"
            v-model="articleXML"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script lang="ts">
// tslint:disable:max-line-length
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import { getArticleByFileName, getArticles } from "../api"
import XmlEditor from "@components/XmlEditor.vue"
import { geoStore } from "../store/geo"
import * as _ from "lodash"
import InfoText from "@components/InfoText.vue"
import ArticleViewLegacy from "@components/ArticleViewLegacy.vue"
import ArticleView from "@components/ArticleView.vue"
import * as FileSaver from "file-saver"
import { userStore, ArticleStatus } from "../store/user"

@Component({
  components: {
    XmlEditor,
    InfoText,
    ArticleViewLegacy,
    ArticleView,
  },
})
export default class Article extends Vue {

  @Prop() filename: string

  showEditor = false
  articles: Array<{ text: string; value: string }> = []
  geoStore = geoStore
  loading = false
  articleAvailable = true
  editor = {
    id: "",
    initials: "",
    fullname: "",
  }
  expanded: number[] = [3]

  articleXML: string | null = ""
  title: string | null = null
  bedeutungXML: string | null = null
  verbreitungXML: string | null = null
  belegauswahlXML: string | null = null
  etymologieXML: string | null = null
  wortbildungXML: string | null = null
  redewendungenXML: string | null = null
  lemmaXML: string | null = null
  diminutiveXML: string | null = null
  userStore = userStore

  get commentUrl(): string {
    return (
      "https://vawadioe.acdh.oeaw.ac.at/lioecomment/?artikel=" +
      this.title +
      "&author=" +
      (this.editor.initials
        ? this.editor.initials.toLowerCase()
        : this.editor.fullname)
    );
  }

  getGrossregionFromGemeinde(sigle: string): string | null {
    if (geoStore.grossregionen !== null) {
      const s = sigle.split(/([a-z])/)[0];
      const g = geoStore.grossregionen.features.find((f) => {
        return f.properties!.Sigle === s;
      });
      return g ? g.properties!.Grossreg : null;
    } else {
      return null;
    }
  }

  printArticle() {
    // expand all
    this.expanded = [0, 1, 2, 3, 4, 5];
    // set pdf title, store old title
    const oldTitle = document.title;
    document.title = "wboe_" + this.title;
    // wait for expansion (a bit overly cautious)
    this.$nextTick(() => {
      setTimeout(() => {
        requestAnimationFrame(() => {
          // open print dialog
          window.print();
          // reset title
          document.title = oldTitle;
        });
      }, 500);
    });
  }

  isPlaceNameElement(el: HTMLElement | any) {
    return el.nodeName === "PLACENAME" && el.hasAttribute("ref");
  }

  getPlacenameSigleFromRef(ref: string | null): string | null {
    if (ref === null) {
      return null;
    } else {
      return _.last(ref.split(/([#p])/)) || null;
    }
  }

  getCollectionLink(el: HTMLElement | any): string | null {
    return (
      el.getAttribute("collection-href") ||
      el.parentElement.getAttribute("collection-href")
    );
  }

  getLemmaLinkElement(el: HTMLElement): string | false | null {
    // this is awful.
    return (
      el.getAttribute("data-target") ||
      (el.parentElement !== null &&
        el.parentElement.getAttribute("data-target")) ||
      (el.parentElement !== null &&
        el.parentElement.parentElement !== null &&
        el.parentElement.parentElement.getAttribute("data-target"))
    );
  }

  handleArticleClick(e: MouseEvent) {
    if (e.target instanceof HTMLElement) {
      if (this.isPlaceNameElement(e.target)) {
        const sigle = this.getPlacenameSigleFromRef(
          e.target.getAttribute("ref")
        );
        if (sigle !== null) {
          this.openMapsWithPlaces([sigle]);
        }
      } else if (e.target.dataset.geoSigle !== undefined) {
        this.openMapsWithPlaces([e.target.dataset.geoSigle]);
      } else if (this.getCollectionLink(e.target) !== null) {
        const id = this.getCollectionLink(e.target)!;
        this.$router.push({ path: "/db", query: { collection_ids: id } });
        // Verweis auf anderes Lemma
      } else if (
        typeof this.getLemmaLinkElement(e.target as HTMLElement) === "string"
      ) {
        const s = this.getLemmaLinkElement(e.target as HTMLElement) as string;
        const t = /(.+)\.xml/g.exec(s);
        console.log(t);
        if (t !== null && t[1] !== null) {
          this.$router.push({ path: "/articles/" + t[1] });
        }
      }
    }
  }

  openMapsWithPlaces(placeIds: string[]) {
    this.$router.push({
      path: "/maps",
      query: { col: this.getColStr(placeIds.join(",")), source: "article" },
    });
  }

  getColStr(val: any) {
    let output;
    console.log(val.split(","));
    output = JSON.stringify([
      {
        id: 0,
        tempColl: -1,
        collection_name: "Sammlung Neu",
        editing: false,
        fillColor:
          "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
        borderColor: "#000",
        items: val.split(","),
      },
    ]);
    return output;
  }

  get isEveryArticleExpanded(): boolean {
    return this.expanded.length === 6;
  }

  toggleAll() {
    this.expanded = this.isEveryArticleExpanded ? [] : [0, 1, 2, 3, 4, 5];
  }

  loadArticle(e: string) {
    if (e && e.trim() !== "") {
      this.$router.push(`/articles/${e}`);
    } else {
      this.$router.push("/articles/");
    }
  }

  isEmptyXML(xml: string): boolean {
    const d = document.createElement("div");
    d.innerHTML = xml;
    return d.innerText.trim() === "";
  }

  fragementFromSelector(selector: string, body: string, contains?: string) {
    const elements = Array.from(this.elementsFromDom(selector, body));
    if (contains !== undefined) {
      return elements
        .filter((e) => e.querySelectorAll(contains).length > 0)
        .reduce((m, e) => (m = m + e.outerHTML), "");
    } else {
      return elements.reduce((m, e) => (m = m + e.outerHTML), "");
    }
  }

  elementsFromDom(selector: string, body: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(body, "text/xml");
    return xmlDoc.querySelectorAll(selector);
  }

  @Watch("filename")
  onFileChange() {
    this.initArticle(this.filename);
  }

  saveEditorXML() {
    this.showEditor = false;
    this.initXML(this.articleXML!);
  }

  downloadEditorXML() {
    const blob = this.articleXML;
    if (blob !== null) {
      FileSaver.saveAs(new Blob([blob]), this.filename + ".xml");
    }
  }

  async mounted() {
    this.articles = (await getArticles())
      .filter((a) => a.title !== "" && a.title !== undefined)
      .map((t) => ({ text: t.title, value: t.filename.replace(".xml", "") }))
      .sort((a, b) => a.text.localeCompare(b.text));
    this.initArticle(this.filename);
  }

  linkParentsToCollection(selector: string, xml: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    Array.from(xmlDoc.querySelectorAll(selector)).forEach((v, i) => {
      const p = v.parentElement;
      const href = v.getAttribute("target")
        ? _.last(v.getAttribute("target")!.split("#c"))
        : null;
      if (
        p !== null &&
        p.firstElementChild !== null &&
        href !== null &&
        href !== undefined
      ) {
        p.firstElementChild.setAttribute("collection-href", href);
      }
      v.remove();
    });
    const s = new XMLSerializer();
    return s.serializeToString(xmlDoc);
  }

  appendGrossregionViaRef(selector: string, xml: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    Array.from(xmlDoc.querySelectorAll(selector)).forEach((v, i) => {
      const sigle = this.getPlacenameSigleFromRef(v.getAttribute("ref"));
      if (sigle !== null) {
        const reg = this.getGrossregionFromGemeinde(sigle);
        if (reg !== null) {
          const grossregion = document.createElement("grossregion");
          grossregion.innerHTML = reg;
          v.appendChild(grossregion);
        }
      }
    });
    const s = new XMLSerializer();
    return s.serializeToString(xmlDoc);
  }

  articleContainsStatuses(xml: string, statuses: ArticleStatus[]): boolean {
    const f = this.fragementFromSelector('teiHeader listChange change', xml)
    return statuses.some(s => f.includes(s))
  }

  initXML(xml: string) {
    const shouldAllowViewing = this.articleContainsStatuses(xml, userStore.articleStatus)
    if (!shouldAllowViewing) {
      this.articleAvailable = false
    } else {
      this.articleAvailable = true
      const idInitials: any = { PhS: "PS" };
      xml = xml.split("<body>").join("").split("</body>").join("");
      xml = this.linkParentsToCollection("ptr[type=collection]", xml);
      xml = this.appendGrossregionViaRef(
        "form[type=dialect] placeName[type=gemeinde], cit placeName[type=gemeinde]",
        xml
      );
      this.lemmaXML = this.fragementFromSelector("entry > form[type=lemma]", xml);
      this.diminutiveXML = this.fragementFromSelector(
        "entry > form[subtype=diminutive]",
        xml
      );
      this.bedeutungXML = this.fragementFromSelector("entry > sense", xml);
      this.verbreitungXML = this.fragementFromSelector(
        "entry > usg[type=geo]",
        xml
      );
      this.belegauswahlXML = this.fragementFromSelector(
        "entry > form[type=dialect]:not([subtype])",
        xml
      );
      this.etymologieXML = this.fragementFromSelector("entry > etym", xml);
      this.wortbildungXML = this.fragementFromSelector(
        "entry > re",
        xml,
        "[subtype=compound]"
      );
      this.redewendungenXML = this.fragementFromSelector(
        "entry > re",
        xml,
        "[subtype=MWE]"
      );
      this.title = this.elementsFromDom("title", xml)[0].innerHTML;
      const aEditor = this.elementsFromDom(
        "teiHeader > fileDesc > titleStmt > respStmt > name[ref]",
        xml
      )[0];
      let aInitials = aEditor.getAttribute("ref");
      aInitials = typeof aInitials === "string" ? aInitials.substr(1) : "";
      this.editor = {
        id: aInitials,
        initials: idInitials[aInitials] || aInitials,
        fullname: aEditor.innerHTML,
      };
    }
  }

  async initArticle(fileName: string) {
    this.loading = true;
    this.articleXML = await getArticleByFileName(fileName + ".xml");
    this.initXML(this.articleXML);
    this.loading = false;
  }
}
</script>
<style lang="scss">
@media print {
  // FIREFOX HAS A PROBLEM WITH FLEXBOX
  // IN PRINT MODE, SO WE NEED TO (RATHER STUPIDLY)
  // CONVERT ALL FLEX BOXES TO BLOCK BOXES BEFORE
  // PRINTING.
  #app,
  .application--wrap,
  .v-content,
  .v-content__wrap,
  .container,
  .layout,
  .flex,
  .v-expansion-panel,
  .article-fragment,
  .v-expansion-panel__header,
  .v-expansion-panel__body,
  .v-card__text {
    display: block !important;
  }

  .header-navigation,
  .footer-navigation,
  .article-search,
  .v-btn,
  .v-icon,
  .comment-box,
  .article-tools {
    display: none !important;
  }

  .article-fragment {
    border-top: 0 !important;
  }

  .article-panels {
    box-shadow: none;
  }

  .v-expansion-panel__header,
  .v-expansion-panel__body {
    padding-left: 0;
    padding-right: 0;
  }
  body {
    font-size: 14px;
  }
}
</style>

<style lang="scss">
iframe.comment {
  border: none;
  width: 100%;
  height: 100%;
  min-height: 500px;
}
.lemma {
  form[type="lemma"] {
    display: inline-block;
  }
  form[type="lemma"] > orth {
    display: inline-block;
    font-size: 2.5em;
  }
  > form[type="lemma"] + form[type="lemma"]::before {
    content: ",";
  }
}

.wortbildung,
.redewendungen {
  re {
    display: block;
    margin-bottom: 1em;
    sense {
      display: inline;
      sense {
        margin-left: 0;
        sense {
          margin-left: 0;
        }
      }
    }
  }
  form {
    font-style: italic;
    margin-right: 0.5em;
  }
}
*[collection-href] {
  position: relative;
  cursor: pointer;
}
*[collection-href]:hover {
  text-decoration: underline;
}
*[collection-href]:after {
  content: "\F01BC";
  display: inline-block;
  font: normal normal normal 24px/1 "Material Design Icons";
  font-size: inherit;
  text-rendering: auto;
  line-height: inherit;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  margin-left: 5px;
  color: #ccc;
  text-decoration: none;
}
*[collection-href]:hover:after {
  color: #666;
}

*[data-target] {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
