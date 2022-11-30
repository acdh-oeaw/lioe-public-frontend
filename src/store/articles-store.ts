import { createModule, action, extractVuexModule, createProxy, } from "vuex-class-component";
import Vuex from 'vuex'
import Vue from 'vue'
import { Article, ArticlesResponse, getArticles, getArticlesVersion } from "@src/api";
Vue.use(Vuex)

const VuexModule = createModule({
    namespaced: "articles",
    strict: false,
    target: "nuxt",
})

export interface searchOptions {
  search?: string,
  filter?: string,
  pageSize: number,
}

class ArticlesModule extends VuexModule {


    articleCount?: Number = void 0;

    articlesResponse: Promise<ArticlesResponse>;

    // General Articles
    loading: boolean = false;

    articles: Array<Article> = [];

    // All Articles
    loadingAll: boolean = false;

    private allArticles: Array<Article> = [];

    get AllArticles() {
      if((!this.allArticles || this.allArticles.length < 1 ) && !this.loadingAll) {
        this.fetchAllArticlesSuccesively();
      }

      return this.allArticles;
    }

    // Search
    loadingArticleSearch: boolean = false;

    searchedArticles: Array<Article> = [];

    searchArticleCount?: Number = void 0;

    lastSearch: string = '';
    lastFilter: string = '';

    // @ts-ignore
    frontendVersion: String = process.env.VUE_APP_VERSION;

    articleApiVersion: String = 'version';

    articleDataVersion: String = 'version';

    @action
    async fetchVersion() {
      const r = await getArticlesVersion();
      this.articleApiVersion = r.version.sw;
      this.articleDataVersion = r.version.data;
    }

    @action
    async fetchArticleSearch(options : searchOptions = { search: void 0, filter: void 0, pageSize: 500 }) {
      if(!options.search) {
        return;
      }

      this.loadingArticleSearch = true;
      let pageNr = 1;
      let totalPages = 1;

      this.lastSearch = options.search ?? '';
      this.lastFilter = options.filter ?? '';

      await getArticles(options.search, options.filter, options.pageSize, pageNr).then( resp => {
        if(this.lastSearch === options.search) {
          this.searchedArticles = sortArticles(filterAndMapArticles(resp.articles));
          totalPages = resp.page.totalPages.valueOf();
          this.searchArticleCount = resp.page.totalElements;
        }
      })

      let requests: Promise<any>[] = [];

      for (pageNr = 2; pageNr <= totalPages; pageNr++) {
        requests.push(
          getArticles(options.search, options.filter, options.pageSize, pageNr).then( resp => {

            if(options.search === this.lastSearch)
              this.searchedArticles.push( ...sortArticles(filterAndMapArticles(resp.articles)));
          })
        );
      }

      Promise.all(requests).then( () => {
        if(this.lastSearch === options.search) {
          this.searchedArticles = sortArticles(this.searchedArticles);
          this.loadingArticleSearch = false;
        }
      });
    }

    @action
    async fetchAllArticlesSuccesively(pageSize: number = 500) {
      if(this.loadingAll){
        return;
      }

      console.log('start fetching all');

      this.loadingAll = true;
      let pageNr = 1;
      let totalPages = 1;

      await getArticles(void 0, void 0, pageSize, pageNr).then( response => {
        this.allArticles = sortArticles(filterAndMapArticles(response.articles));
        totalPages = response.page.totalPages.valueOf();
      });

      let requests: Promise<any>[] = [];

      const articleCache: Article[] = [];

      for (pageNr = 2; pageNr <= totalPages; pageNr++) {
        requests.push(
          getArticles(void 0, void 0, pageSize, pageNr).then( resp => {
            articleCache.push( ...sortArticles(filterAndMapArticles(resp.articles)));
          })
        );
      }

      Promise.all(requests).then( () => {
        this.allArticles = sortArticles( [...this.allArticles, ...articleCache]);
      }).then( () => {
        this.loadingAll = false;
      })
    }

    @action
    async fetchArticles(forceUpdate?:boolean) : Promise<any> {

        if(this.loading){
            return this.articlesResponse;
        }

        this.loading = true;

        if(!this.articles || this.articles.length === 0) {
            this.articlesResponse = getArticles();

            this.articlesResponse.then( response => {
              this.articles = sortArticles(filterAndMapArticles(response.articles));
              this.articleCount = response.page.totalElements;
              this.loading = false;
            })
            return this.articlesResponse;
        }

        if(forceUpdate === true){
          this.articlesResponse = getArticles();

          this.articlesResponse.then( response => {
            this.articles = sortArticles(filterAndMapArticles(response.articles));
            this.articleCount = response.page.totalElements;
          })
        }
        this.loading = false;
        return this.articlesResponse;
    }


}

const characters_to_delete_for_search = /[-*<>;%†\u1AB0–\u1AFF\u1DC0–\u1DFF\u02B0-\u02FF\u20D0–\u20FF\u26a0\u0300-\u036F\uFE20–\uFE2F()\[\]"']/g
const restore_umlaut_for_search_map: Record<string, string> = {
  '\u203Aa':'ä', '\u203AA':'Ä',
  '\u203Ao':'ö', '\u203AO':'Ö',
  '\u203Au':'ü', '\u203AU':'Ü',
  '\u203As':'ß'
}

const  replace_for_search_map = Object.keys(restore_umlaut_for_search_map).reduce((ret: Record<string, string>, key: string) => {
  ret[restore_umlaut_for_search_map[key]] = key;
  return ret;
}, {});

function getEasySearchLemma(lemmaName: string) {
  const ret: string = (
    lemmaName
      .replace(/[äöüÄÖÜß]/g,
        (c) => replace_for_search_map[c]
      )
      .normalize('NFKD')
      .replace(/\(.*\)/g, '')
      .replace(characters_to_delete_for_search, '')
      .replace(/\u203A./g, (s) => restore_umlaut_for_search_map[s])
    )
  return ret
}

function filterAndMapArticles(articles:Article[]) :Article[] {
  return articles
  .filter((a) => a.title !== "" && a.title !== undefined)
  .map((t) => {
    const art: Article = t;
    art.filename.replace(".xml", "");
    return art;
  });
}

function sortArticles(articles:any[]) {
    return articles.sort((a, b) => getEasySearchLemma(a.title).localeCompare(getEasySearchLemma(b.title)));
}

export const store = new Vuex.Store({
    modules: {
        ...extractVuexModule(ArticlesModule)
    }
})

export const articleStore = {
    articles: createProxy(store, ArticlesModule)
}

