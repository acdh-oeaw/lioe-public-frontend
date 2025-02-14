<template>
  <v-layout column :class="isRetro ? 'retro-xml' : ''">
    <v-flex xs12>
      <v-autocomplete
        class="article-search"
        label="Suche Artikel…"
        :loading="loading"
        clearable
        solo
        text
        @change="loadArticle"
        :items="articleList"
        item-text="title"
        item-value="xmlUrl"
        prepend-inner-icon="mdi-magnify"
        v-model:search-input="searchTerm"
      >
        <template v-slot:item="{ props, item, on }">
          <v-list-item
            v-bind="props"
            v-on="on"
          >
            <article-search-item
            :article="item"
            :search="searchTerm">
            </article-search-item>
          </v-list-item>
        </template>
      </v-autocomplete>
      <template>
        <div class="mb-3">
            <v-row class="px-2 py-0 my-0" justify="center" align="center" v-if="listLoading === true">
              <v-col class="py-0 my-0">
                <v-skeleton-loader class="py-0" type="button"></v-skeleton-loader>
              </v-col>
              <v-col class="py-0 my-0">
                <v-skeleton-loader class="py-0 my-0" type="button"></v-skeleton-loader>
              </v-col>
              <v-col class="py-0 my-0">
                <v-skeleton-loader class="py-0 my-0" type="button"></v-skeleton-loader>
              </v-col>
              <v-col class="py-0 my-0">
                <v-skeleton-loader class="py-0 my-0" type="button"></v-skeleton-loader>
              </v-col>
              <v-col class="py-0 my-0">
                <v-skeleton-loader class="py-0 my-0" type="button"></v-skeleton-loader>
              </v-col>
            </v-row>
          <vue-horizontal v-else responsive snap="center" ref="horizontal_articles">
            <section v-for="item in truncatedArticleList" :key="item.xmlUrl">
              <v-btn class="ml-6 mx-2" text :to="`/articles/${ getFileLink(item.xmlUrl) }`" :key="item.xmlUrl">{{item.title}}</v-btn>
            </section>
          </vue-horizontal>
        </div>
      </template>
      <template v-if="articleAvailable">
        <v-layout align-end>
          <v-flex @click="handleArticleClick" xs12>
            <div v-html="lemmaXML" class="lemma" />
          </v-flex>
          <v-flex class="text-xs-right fx-info-1">
            <v-menu open-on-hover max-width="400" max-height="95vh" top left>
              <template v-slot:activator="{ on }">
                <v-btn color="grey" class="mr-3" small v-on="on" icon text>
                  <v-icon>mdi-information-outline</v-icon>
                </v-btn>
              </template>
              <info-text
                class="elevation-24 pa-4 white"
                :path="isRetro ? 'wboe-artikel/lemma-retro/' : 'wboe-artikel/lemma-short/'"
              />
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
          :retroAutor="retroAutor"
          :isEveryArticleExpanded="isEveryArticleExpanded"
          v-if="articleXML !== null"
          :xml="articleXML"
          :filename="filename"
          v-model="expanded"
          :geo-store="geoStore"
          :retro-xml="retroXML"
          :is-retro="isRetro"
          :pb-facs="pbFacs"
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
              medium
              rounded
              text
              @click="downloadEditorXML"
              >download</v-btn
            >
            <v-btn class="pl-3 pr-3" small rounded text @click="saveEditorXML"><v-icon>mdi-close</v-icon></v-btn>
          </v-flex>
        </v-card-title>
        <v-card-text class="pa-0 fill-height">
          <div
            v-if="showEditor"
            class="xml-viewer fill-height"
            v-html="highlightedXML"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
    <div
      tabindex="0"
      :style="{left: bibliographieToolTip.x + 'px', top: bibliographieToolTip.y + 'px', 'margin-top': -(5 + bibliographieToolTip.h) + 'px'}"
      @blur="bibliographieToolTipBlur"
      ref="bibliographieToolTip"
      v-if="bibliographieToolTip.show" v-html="bibliographieToolTip.html" class="bib-tool-tip"
    />
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import { getArticleByFileName, getCollectionByIds, getDocumentsByCollection } from "@/api"
import { geoStore } from "@/store/geo"
import _ from "lodash"
import InfoText from "@/components/InfoText.vue"
import ArticleViewLegacy from "@/components/ArticleViewLegacy.vue"
import ArticleView from "@/components/ArticleView.vue"
import * as FileSaver from "file-saver"
import { userStore, ArticleStatus } from "@/store/user"
import { stateProxy } from "@/store/collections"
import VueHorizontal from 'vue-horizontal';
import { articleStore }from "@/store/articles-store"
import { getWebsiteHtml } from '@/api'
import { fileLinkFromXMLUrl } from "@/utilities/helper-functions"
import ArticleSearchItem  from "@/components/ArticleSearchItem.vue"
import { type Article as ApiArticle } from "@/api"
import { arrayOutputType } from "zod"

@Component({
  components: {
    InfoText,
    ArticleViewLegacy,
    ArticleView,
    VueHorizontal,
    ArticleSearchItem
  },
})
export default class Article extends Vue {

  @Prop() filename: string

  searchTerm: string = '';

  showEditor = false
  geoStore = geoStore
  loading = false
  articleAvailable = true
  editor = {
    id: "",
    initials: "",
    fullname: "",
  }
  expanded: number[] = [3]

  retroAutor: any = []
  articleXML: string | null = ""
  title: string | null = null
  bedeutungXML: string | null = null
  verbreitungXML: string | null = null
  belegauswahlXML: string | null = null
  etymologieXML: string | null = null
  wortbildungXML: string | null = null
  redewendungenXML: string | null = null
  lemmaXML: string | null = null
  retroXML: string | null = null
  diminutiveXML: string | null = null
  pbFacs: string | null = null
  pbFacsPdfLink: string | null = null
  isRetro: boolean | null = false
  userStore = userStore

  bibliographieObj: any | null = null
  bibliographieToolTip: any = {
    x: 0,
    y: 0,
    h: 0,
    html: null,
    show: false
  }

  updateHorizontalArticleList: boolean = true;

  get truncatedArticleList() {
    const size = 53;

    const index = this.getArticleIndex(this.articleList);

    console.log(`index: ${index}`)

    let minIndex = Math.max(0, index - Math.floor(size / 2));
    const minDiff = index - minIndex;
    let maxIndex = Math.min(index + Math.floor(size / 2) + 1, this.articleList.length);
    const maxDiff = maxIndex - index;
    if(Math.abs(minDiff) < size/2) {
      maxIndex = maxIndex + (size/2 - minDiff);
    } else if (maxDiff < size/2) {
      minIndex = minIndex - (size/2 - maxDiff);
    }    

    const subarray = this.articleList.slice(
      minIndex,
      maxIndex
    );
    return subarray;
  }

  get articleList() {
    return articleStore.articles.AllArticles;
  }

  get listLoading() {
    return articleStore.articles.loadingAll;
  }

  get commentUrl(): string {
    return (
      "https://lioe-cms.acdh-dev.oeaw.ac.at/lioecomment/?artikel=" +
      this.title +
      "&author=" +
      (this.editor.initials
        ? this.editor.initials.toLowerCase()
        : this.editor.fullname)
    );
  }

  getFileLink(xmlUrl?: string) : string {
    return fileLinkFromXMLUrl(xmlUrl);
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

  getDataTargetElement(el: HTMLElement): any[] {
    let dt = el.getAttribute("data-target")
    let maxDg = 10
    let aEl = el
    while (!dt && aEl.parentElement !== null && maxDg > 0) {
      aEl = aEl.parentElement
      dt = aEl.getAttribute("data-target")
      maxDg -= 1
    }
    return [dt, aEl]
  }

  bibliographieToolTipBlur() {
    this.bibliographieToolTip.show = false
  }

  handleArticleClick(e: MouseEvent) {
    if (e.target instanceof HTMLElement) {
      if (!this.isRetro) {
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
          this.goToDB(id);
          // this.$router.push({ path: "/db", query: { collection_ids: id } });
          // Verweis auf anderes Lemma
        } else {
          if (typeof this.getDataTargetElement(e.target as HTMLElement)[0] === "string") {
            const o = this.getDataTargetElement(e.target as HTMLElement)
            const s = o[0] as string
            const t = /(.+)\.xml/g.exec(s)
            console.log('lemmaLink', {s, t})
            if (t !== null && t[1] !== null) {
              this.$router.push({ path: "/articles/" + t[1] })
            } else {
              if (s.charAt(0) === '#') {
                if (this.bibliographieObj && this.bibliographieObj.htmlDom) {
                  let bHtml = this.bibliographieObj.htmlDom.getElementById(s.substring(1))
                  if (bHtml) {
                    bHtml = bHtml.innerHTML
                    this.bibliographieToolTip.html = bHtml
                    this.bibliographieToolTip.x = o[1].getBoundingClientRect().left
                    this.bibliographieToolTip.y = o[1].getBoundingClientRect().top + document.documentElement.scrollTop
                    this.bibliographieToolTip.h = 60
                    this.bibliographieToolTip.show = true
                    this.$nextTick(() => {
                      (this.$refs.bibliographieToolTip as any).focus()
                    })
                    console.log('bHtml', bHtml, this.bibliographieToolTip, o[1].getBoundingClientRect(), o[1])
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  async goToDB(id: any) {
    let colls: Number[] = id; // item.value == id !!!
    if (!Array.isArray(colls)) {
      var tmp = new Array();
      tmp.push(colls);
      colls = tmp;
    }

    if (colls.length === 0) {
      return;
    }

    const res: any = await getDocumentsByCollection([colls[0].toString()], 1, 1000);
    let CollLocation: any[] = [];
    //@ts-ignore
    res.documents.forEach((document) => {
      let sigle: string = document.ortsSigle;
      if (sigle) {
        if (!CollLocation.includes(document.ortsSigle.split(" ")[0])) {
          CollLocation.push(document.ortsSigle.split(" ")[0]);
        }
      }
    });

    const cs  = await getCollectionByIds([id]);
    let relevant_coll = cs[0];
    let coll_name = relevant_coll.name;
    let coll_desc = relevant_coll.description;

    stateProxy.collections.addWBOE_coll({
      changedColl: {
        id: Math.random() * 1000,
        selected: true,
        preColl: id,
        collection_name: coll_name,
        collection_desc: coll_desc,
        editing: false,
        fillColor:
          "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
        borderColor: "#000",
        items: CollLocation,
      },
      add: true,
    });
      this.$router.push({
        path: "/db",
      });
  }



  openMapsWithPlaces(placeIds: string[]) {
    stateProxy.collections.setLocations(placeIds)
    this.$router.push({
      path: "/maps",
    });
  }

  openDBWithPlaces(placeIds: string[]) {
    const routingStr = '/db?q=Sigle1,'.concat(placeIds[0]);
    this.$router.push(routingStr);

  }

  getColStr(val: any) {
    let output;
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
    const link = this.getFileLink(e);

    if (link && link.trim() !== "") {
      this.$router.push(`/articles/${link}`);
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
    this.updateHorizontalArticleList = true;
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

  async activated() {
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
    // console.log({f}, {statuses}, statuses.some(s => f.includes(s)))
    return statuses.length === 0 || statuses.some(s => f.includes(s))
  }

  initXML(xml: string) {
    this.articleAvailable = this.isRetro || this.articleContainsStatuses(xml, userStore.articleStatus)
    if (this.articleAvailable) {
      this.articleAvailable = true
      const idInitials: any = { PhS: "PS" };
      this.pbFacs = null;
      this.pbFacsPdfLink = null;
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
      if (this.isRetro) {
        this.retroXML = this.fragementFromSelector("TEI > text", xml);
        this.articleAvailable = true;
        let aTitle = this.elementsFromDom("teiHeader > fileDesc > titleStmt > title", xml)[0]
        // Hack to remove lemma link! ToDo: Make link working ?!?
        this.lemmaXML = this.lemmaXML.replace('collection-href="/collections-wboe.xml#start"', '')
        this.lemmaXML += this.fragementFromSelector("entry > gramGrp > gram[type=pos]", xml) + this.fragementFromSelector("entry > gramGrp > gram[type=gender]", xml)
        // <pb facs="lieferung6.pdf#page=28" n="WBÖ 1, 344."/>
        let tPbFacs = this.elementsFromDom("entry > pb", xml)
        if (tPbFacs && tPbFacs.item(0) && tPbFacs.item(0).attributes && (<any>tPbFacs.item(0).attributes).n) {
          this.pbFacs = (<any>tPbFacs.item(0).attributes).n.value;
          if ((<any>tPbFacs.item(0).attributes).facs) {
            // ToDo: Use pdf link !
            this.pbFacsPdfLink = (<any>tPbFacs.item(0).attributes).facs.value;
          }
        }
        const facsData = (this.pbFacs as any).match(/WBÖ (\d+), (\d+)\./i) || []
        // console.log(facsData, aTitle, aTitle.innerHTML)
        this.editor = {
          id: 'retro',
          initials: facsData.length > 2 ? ('WBÖ Band ' + facsData[1] + ', S. ' + facsData[2]) : (aTitle && aTitle.innerHTML || 'Retro'),
          fullname: '', // 'OEAW-Verlag (H. Rosenkranz)',
        };
        // <respons locus="name value" resp="E.K., A.E."/>
        let retroAutorTmp = this.elementsFromDom('respons[locus="name value"]', xml)
        if (retroAutorTmp && retroAutorTmp.item(0) && retroAutorTmp.item(0).attributes && (<any>retroAutorTmp.item(0).attributes).resp) {
          let retroAutorStr = (<any>retroAutorTmp.item(0).attributes).resp.value
          let retroAutorNameList: any = {
            'A.E.': 'Etz, Albrecht',
            'E.G.': 'Groschopf, Elisabeth',
            'E.K.': 'Kranzmayer, Eberhard',
            'E.Kü.': 'Kühn, Erika',
            'E.S.': 'Schuster, Elisabeth',
            'G.L.': 'Lipold, Günter',
            'H.T.': 'Tatzreiter, Herbert',
            'I.G.': 'Geyer, Ingeborg',
            'I.M.': 'Marschall, Ingrid',
            'I.S.': 'Schönhuber, Ingeborg',
            'M.H.': 'Hornung, Maria',
            'W.B.': 'Bauer, Werner',
            'W.S.': 'Schabus, Wilfried'
          }
          this.retroAutor = retroAutorStr.split(',').map((v: string) => retroAutorNameList[v.trim()] || v.trim())
        } else {
          this.retroAutor = []
        }
        // console.log('pbFacs', this.pbFacs, this.pbFacsPdfLink)
      } else {
        this.retroXML = null;
        let aInitials = aEditor.getAttribute("ref");
        aInitials = typeof aInitials === "string" ? aInitials.substr(1) : "";
        this.editor = {
          id: aInitials,
          initials: idInitials[aInitials] || aInitials,
          fullname: aEditor.innerHTML,
        };
      }
    }
  }

  async initArticle(fileName: string) {
    this.loading = true;
    let aFileName = fileName;
    if (aFileName.indexOf('#') > -1) {
      let tmp = aFileName.split('#')
      aFileName = tmp[0] + '.xml#' + tmp.splice(1).join('#')
      this.isRetro = true
    } else{
      aFileName += '.xml'
      this.isRetro = false
    }
    this.articleXML = await getArticleByFileName(aFileName);
    this.initXML(this.articleXML);
    this.loading = false;
  }

  async init() {
    try {
      this.bibliographieObj = {
        html: await getWebsiteHtml('https://lioe-cms.dioe.at/materialien/bibliographie')
      }
      this.bibliographieObj.htmlDom = new DOMParser().parseFromString(this.bibliographieObj.html, 'text/html')
      console.log('bibliographieObj', this.bibliographieObj)
    } catch (e) {
      console.log('error', e)
    }
  }

  mounted() {
    this.updateHorizontalArticleList = true;
    this.init()
  }

  updated() {
    if(this.updateHorizontalArticleList){
      this.scrollToArticle();

      if(this.$refs.horizontal_articles){
        // @ts-ignore
        this.$refs.horizontal_articles.refresh();
        this.updateHorizontalArticleList = false;
      }
    }
  }

  get loadingArticles() {
    return articleStore.articles.loadingAll;
  }

  @Watch('loadingArticles')
  OnLoadingChanged() {
    if(!this.loadArticle) {
      this.updateHorizontalArticleList = true;
    }
  }

  @Watch('articleList')
  onArticleListChange() {
    this.updateHorizontalArticleList = true;
  }

  scrollToArticle() {
    const artIndex = this.getArticleIndex(this.truncatedArticleList) - 2;

    if(artIndex > 0 && this.$refs.horizontal_articles){
    // @ts-ignore
      this.$refs.horizontal_articles.scrollToIndex(artIndex);
    }
  }

  getArticleIndex(articles: Array<ApiArticle>): number {
    const encodedFilename = encodeURIComponent( this.filename.replace('.xml', ''));

    let artIndex = articles.map( a => fileLinkFromXMLUrl(a.xmlUrl)).indexOf(encodedFilename);

    return artIndex
  }

  get highlightedXML(): string {
    if (this.articleXML) {
      return this.articleXML.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/(&lt;.*?&gt;)/g, "<b>$1</b>")
    } else {
      return ''
    }
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
  gram[type="pos"],
  gram[type="gender"] {
    display: block;
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
.bib-tool-tip {
  position: absolute;
  z-index: 100;
  background: #fff;
  box-shadow: 3px 3px 8px rgba(0,0,0,0.3);
  padding: 5px 10px;
  width: 380px;
  margin-left: -10px;
}
.xml-viewer {
  white-space: pre;
  padding: 1rem 2rem;
  width: 100%;
  overflow: auto;
  color: rgba(255, 255, 255, 0.8);
  font-family: monospace;
  b {
    color: rgba(255, 255, 255, 0.95);
  }
}
@media only screen and (min-height: 800px) {
  .retro-xml ::v-deep {
    .fx-info-1 {
      top: -28px;
      position: relative;
    }
    .fx-info-2 {
      position: relative;
      top: 0px;
      height: 0;
    }
  }
}
</style>
