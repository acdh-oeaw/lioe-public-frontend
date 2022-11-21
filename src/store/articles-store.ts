import { createModule, action, extractVuexModule, createProxy, } from "vuex-class-component";
import Vuex from 'vuex'
import Vue from 'vue'
import { Article, getArticles, getArticlesVersion } from "@src/api";
Vue.use(Vuex)

const VuexModule = createModule({
    namespaced: "articles",
    strict: false,
    target: "nuxt",
})

class ArticlesModule extends VuexModule {

    articles: Array<Article> = [];

    articlesPromise: Promise<Array<Article>>

    loading: boolean = false;
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
    async fetchArticles(forceUpdate?:boolean) : Promise<Array<Article>> {

        if(this.loading){
            return this.articlesPromise;
        }

        this.loading = true;

        if(!this.articles || this.articles.length === 0) {
            this.articlesPromise = getArticles();
            this.articlesPromise.then( articles => {

                console.log('Missing title:', articles.filter((a) => a.title === "" || a.title === undefined));

                this.articles = sortArticles(articles);
                this.loading = false;
                console.log('normal article fetched')
            })
            return this.articlesPromise;
        }

        if(forceUpdate === true){
            this.articlesPromise = getArticles();
            this.articlesPromise.then( articles => {
                this.articles = sortArticles(articles);
                console.log('force update article fetched');
            })
        }
        this.loading = false;
        return this.articlesPromise;
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

function sortArticles(articles:any[]) {
    console.log('articles', articles);
    return articles
        .filter((a) => a.title !== "" && a.title !== undefined)
        .map((t) => {
          const art: Article = t;
          art.filename.replace(".xml", "");
          return art;
        })
        .sort((a, b) => getEasySearchLemma(a.title).localeCompare(getEasySearchLemma(b.title)));
}

export const store = new Vuex.Store({
    modules: {
        ...extractVuexModule(ArticlesModule)
    }
})

export const articleStore = {
    articles: createProxy(store, ArticlesModule)
}
