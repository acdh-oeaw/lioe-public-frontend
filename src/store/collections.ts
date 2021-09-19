import { createModule, mutation, action, extractVuexModule, Module, createProxy, } from "vuex-class-component";
import { getDocumentsByCollection } from "../api";
import Vuex from 'vuex'
import Vue from 'vue'
import { $addNotification } from "@src/utilities/notifications";
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
    collection_desc?: String
    editing: Boolean
    fillColor: String
    selected: Boolean
    borderColor: String
    items: Array<any>
}

class CollectionModule extends VuexModule {

    private temp_collections: Array<Collection> = []
    private wboe_collections: Array<Collection> = []
    private locations: Array<any> = []
    private showAlleBelege: Boolean = false
    private visibleSidebar: boolean = false;
    private collectionNameNumber: number = 1;

    get collectionNameNr() {
        return this.collectionNameNumber;
    }

    get showSidebar() {
        return this.visibleSidebar;
    }

    @mutation
    toggleSidebar() {
        this.visibleSidebar = !this.visibleSidebar;
    }

    get getLocations() {
        return this. locations
    }

    @mutation
    setLocations(loc: Array<any>) {
        this.locations = loc;
    }

    get getShowAlleBelege() {
        return this.showAlleBelege;
    }
    get temp_coll() {
        return this.temp_collections;
    }

    get wboe_coll() {
        return this.wboe_collections;
    }

    get visibleCollections() {
        const selColls: Array<Collection> = []
        this.temp_collections.forEach(col => {
            if(col.selected)
                selColls.push(col);
        });
        this.wboe_collections.forEach(col => {
            if(col.selected)
                selColls.push(col);
        });
        return selColls;
    }

    @mutation
    setTemp_coll(colls: Collection[]) {
        this.temp_collections = colls
    }

    @mutation
    setWboe_coll(colls: Collection[]) {
        this.wboe_collections = colls;
    }

    @mutation
    changeShowAlleBelege(show: Boolean) {
        this.showAlleBelege = show;
    }

    @mutation
    addTemp_coll(coll: { changedColl: Collection}) {
        this.temp_collections.push(coll.changedColl);
        this.collectionNameNumber += 1;
    }

    @mutation
    removeTemp_coll(coll: { changedColl: Collection}) {
        this.temp_collections.forEach(collLoop => {
            if (coll.changedColl.id == collLoop.id) {
                this.temp_collections.splice(this.temp_collections.indexOf(collLoop), 1)
            }
        });
    }

    @action
    async addWBOE_coll(coll: { changedColl: Collection, add: boolean }) {
        if (coll.add) {
            //@ts-ignore
            let documents = await getDocumentsByCollection([coll.changedColl.preColl.toString()])
            coll.changedColl.items = documents.documents
            this.wboe_collections.push(coll.changedColl);
        } else {
            this.wboe_collections.forEach(collLoop => {
                if (coll.changedColl.id == collLoop.id) {
                    this.wboe_collections.splice(this.wboe_collections.indexOf(collLoop), 1)
                }
            });
        }
    }

    @mutation
    addPlacesToCollection(input: { col: Number, items: any }) {
        let addingSuccesfull = false;
        this.temp_collections.forEach(collectionLoop => {
            if (collectionLoop.id === input.col) {
                collectionLoop.items = [...collectionLoop.items, ...input.items]
                addingSuccesfull = true;
            }
        });
        if(addingSuccesfull) 
            $addNotification(this.$bus, {})
        // TODO: Look at event bus option
    }

    @mutation
    swapShow(item: Collection) {
        if (item.preColl === -1) {
            this.temp_collections.forEach(itemLoop => {
                if (item.id === itemLoop.id) {
                    itemLoop.selected = !itemLoop.selected
                }
            });
        } else {
            this.wboe_collections.forEach(itemLoop => {
                if (item.id === itemLoop.id) {
                    itemLoop.selected = !itemLoop.selected
                }
            });
        }
    }

    get amountActiveCollections() {
        let lengthSelected = 0
        this.temp_collections.forEach(element => {
            if (element.selected) {
                lengthSelected++;
            }
        });
        this.wboe_collections.forEach(element => {
            if (element.selected) {
                lengthSelected++;
            }
        });
        return lengthSelected
    }

}

export const store = new Vuex.Store({
    modules: {
        ...extractVuexModule(CollectionModule)
    }
})

export const stateProxy = {
    collections: createProxy(store, CollectionModule)
}
