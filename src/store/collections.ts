import { createModule, mutation, action, extractVuexModule, Module, createProxy, } from "vuex-class-component";
import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)

const VuexModule = createModule({
    namespaced: "user",
    strict: false,
    target: "nuxt",
}) 

export interface Collection {
    id: Number;
    preColl: Number
    collection_name: String
    editing: Boolean
    fillColor: String
    selected: Boolean
    borderColor: String
    items: Array<any>
}

class CollectionModule extends VuexModule{

    private temp_collections:Array<Collection> = []
    private wboe_collections:Array<Collection> = []

    get temp_coll() {
        return this.temp_collections;
    }

    get wboe_coll() {
        return this.wboe_collections;
    }

    @mutation
    addTemp_coll(coll:{changedColl: Collection, add: boolean}) {
        if(coll.add) {
            this.temp_collections.push(coll.changedColl);
        } else {
            this.temp_collections.forEach(collLoop => {
                if(coll.changedColl == collLoop) {
                    this.temp_collections.splice(this.temp_collections.indexOf(collLoop),1)
                }
            });
        }
    }

    @mutation
    addWBOE_coll(coll:{changedColl:Collection, add: boolean}) {
        if(coll.add) {
            this.temp_collections.push(coll.changedColl);
        } else {
            this.temp_collections.forEach(collLoop => {
                if(coll.changedColl == collLoop) {
                    this.temp_collections.splice(this.temp_collections.indexOf(collLoop),1)
                }
            });
        }
    }
    
}

// export let collections = new Collections()
// {temp_collections: [], wboe_collections: []};

export const store = new Vuex.Store({
  modules: {
    ...extractVuexModule(CollectionModule)
  }
})

export const stateProxy = {
  collections: createProxy(store, CollectionModule)
}
