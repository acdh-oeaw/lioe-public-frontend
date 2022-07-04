import { createModule, mutation, action, extractVuexModule, Module, createProxy, } from "vuex-class-component";
import Vuex from 'vuex'
import Vue from 'vue'
import { getArticles } from "@src/api";
Vue.use(Vuex)

const VuexModule = createModule({
    namespaced: "articles",
    strict: false,
    target: "nuxt",
})

class ArticlesModule extends VuexModule {

    articles: Array<{ title: string; filename: string }> = [];

    articlesPromise: Promise<Array<{ title: string; filename: string }>>

    loading: boolean = false;

    @mutation
    setLoading(loading:boolean){
        this.loading = loading;
    }

    @action
    async fetchArticles(forceUpdate?:boolean) : Promise<Array<{ title: string; filename: string }>> {

        if(this.loading){
            return this.articlesPromise;
        }

        this.setLoading(true);

        if(!this.articles || this.articles.length === 0) {
            this.articlesPromise = getArticles();
            this.articlesPromise.then( articles => {

                console.log('Missing title:', articles.filter((a) => a.title === "" || a.title === undefined));

                this.articles = articles
                    .filter((a) => a.title !== "" && a.title !== undefined)
                    .map((t) => ({ title: t.title, filename: t.filename.replace(".xml", "") }))
                    .sort((a, b) => a.title.localeCompare(b.title));
                this.setLoading(false);
                console.log('normal article fetched')
            })
            return this.articlesPromise;
        }

        if(forceUpdate === true){
            this.articlesPromise = getArticles();
            this.articlesPromise.then( articles => {
                this.articles = articles
                    .filter((a) => a.title !== "" && a.title !== undefined)
                    .map((t) => ({ title: t.title, filename: t.filename.replace(".xml", "") }))
                    .sort((a, b) => a.title.localeCompare(b.title));
                this.setLoading(false);
                console.log('force update article fetched');
            })
        } 
        return this.articlesPromise;
    }

}

export const store = new Vuex.Store({
    modules: {
        ...extractVuexModule(ArticlesModule)
    }
})

export const articleStore = {
    articles: createProxy(store, ArticlesModule)
}