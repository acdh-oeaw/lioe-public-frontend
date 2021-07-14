<template>
  <v-layout column fill-height>
    <!-- <v-flex class="text-center">
      <v-text-field
        :loading="loading"
        autofocus
        text
        v-model="searchTerm"
        label="Suche…" 
        prepend-inner-icon="search"
        solo
        clearable
      />
    </v-flex> -->

    <v-layout column>
      <v-flex>
        <v-col class="pa-0">
          <v-autocomplete
            :loading="loading"
            :items="searchItems"
            @input="selectItems"
            label="Alle Ressourcen durchsuchen..."
            autofocus
            @update:search-input="debouncedPerformSearch"
            v-model="searchedItem"
            text
            class="mb-4"
            hide-details
            prepend-inner-icon="search"
            solo
            clearable
          >
            <template v-slot:item="{ item }">
              <v-list-item
                :to="
                  item.type === 'article'
                    ? `/articles/${findArticleByTitle(item.text).filename.replace(
              '.xml',
              ''
            )}`
                    : item.type !== 'collection'
                    ? `/db?q=Sigle1,${item.value}`
                    : ``
                "
                @click="item.type === 'collection' ? getLocationsOfCollections(item, 'page') : null"
              >
                <v-list-item-avatar>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                  <v-icon v-if="item.type === 'article'" v-on="on">mdi-newspaper</v-icon>
                    </template>
                    <span>Artikel anzeigen</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                  <v-icon v-if="item.type === 'place'" v-on="on">map</v-icon>
                    </template>
                    <span>Ort in Datenbank anzeigen</span>
                  </v-tooltip>
                  <v-icon v-if="item.type === 'collection'"
                    >mdi-folder-outline</v-icon
                  >
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title> {{ item.text }}</v-list-item-title>
                  <!-- <v-list-item-subtitle v-if="item.type === 'article'">  Beleg zum Artikel anzeigen </v-list-item-subtitle> -->
                  <v-list-item-subtitle v-if="item.type === 'collection'">
                    {{ item.description }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="item.type === 'place'">
                    {{ item.value }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                 <v-btn
                    v-if="item.type === 'place'"
                    color="ci"
                    class="text-no-transform"
                    text
                    @click.stop.prevent="routeToMaps(item)"
                    > Ort auf Karte anzeigen</v-btn
                  >
                  <v-btn
                    v-if="item.type === `article`"
                    text
                    color="ci"
                    class="text-no-transform"
                    @click.stop.prevent="
                      $router.replace(`/db?q=HL,${item.text}`)
                    "
                    >&rarr; Belege in Datenbank anzeigen</v-btn
                  >
                  <v-btn
                    text
                    v-if="item.type === `collection`"
                    class="text-no-transform"
                    color="ci"
                    @click.stop.prevent="getLocationsOfCollections(item, 'btn')"
                    >&rarr; Sammlung auf Karte anzeigen</v-btn
                  >
                </v-list-item-action>
              </v-list-item>
            </template>
            <template v-slot:no-data>
              <v-list-item v-if="isSearching">
                <v-list-item-title class="text-center caption">
                  Lade…
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-else-if="searchTerm !== null && searchTerm.trim() !== ''"
                :to="`db?q=HL,${searchTerm}`"
              >
                <v-list-item-title class="caption">
                  Der gesuchte Begriff konnte nicht gefunden werden. Zum
                  Weitersuchen in der Belegdatenbank:
                </v-list-item-title>
                <v-list-item-action>
                  <v-btn text color="ci">
                    &rarr; {{ searchTerm }}
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-list-item v-else>
                <v-list-item-title class="caption">
                  Suchen Sie nach Artikeln, Belegen oder Orten.
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
      </v-flex>
    </v-layout>


    <v-flex style="height: 40vh" xs12>
      <!-- <v-progress-linear
        height="1"
        class="pa-0 ma-0 absolute"
        v-if="wordProgress !== null && wordProgress !== 100"
        indeterminate
      /> -->
      <vue-word-cloud
        style="
        height: 360px;
        "
        :enter-animation="{ opacity: 0, transform: 'scale3d(0.3, 1, 0.3)' }"
        :rotation="0.875"
        :words="filteredWords"
        :animation-overlap="10"
        :animation-duration="visited ? 0 : 5000"
        :spacing="0.2"
        @update:progress="updateWordProgress"
        font-weight="800"
        font-family="fiduz"
      > 
        <template slot-scope="{ text, weight, word }">
          <router-link
            class="word-cloud-link"
            :to="`/articles/${findArticleByTitle(text).filename.replace(
              '.xml',
              ''
            )}`"
          >
            {{ text }}
          </router-link>
        </template>
      </vue-word-cloud>
    </v-flex>
    <div v-if="loading" class="text-center grey--text mt-5">Laden…</div>
    <div v-else class="text-center grey--text mt-5">
      {{ articles ? articles.length.toLocaleString() : "?" }} WBÖ-Artikel
    </div>

    <v-flex class="pt-4">
      <info-text subDialog="true" path="home/einleitungstext/" />
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";
import InfoText from "@components/InfoText.vue";
import {
  getArticles,
  searchCollections,
  getDocumentsByCollection,
} from "../api";
import { stateProxy, Collection } from "../store/collections";
import InfoBox from "@components/InfoBox.vue";
import { geoStore } from "../store/geo";

@Component({
  components: {
    InfoText,
    InfoBox,
  },
})
export default class Main extends Vue {
  wordProgress: number | null = null;
  searchTerm: string = "";
  searchOrt: string = "";
  searchedItem: string = "";
  searchLemma: string = "";
  articles: Array<{ title: string; filename: string }> = [];
  articlesPlus: Array<{ title: string; filename: string; ort: string }> = []; //extended articles list
  loading = false;
  visited: boolean = false;
  debouncedSearchArticle = _.debounce(this.findArticleByTitle, 250); //TODO RECHECK what to debounce
  autoFit = false;
  loc: string | null;
  geoStore = geoStore;
  isSearching = false;
  searchItems: Array<{
    type: string;
    text: string;
    value: string;
    description: string;
  }> = [];
  // items=[{text: 'Lemma', value: 'Lemma', disabled: false},{text: 'Ort', value: 'Ort', disabled: false}]

  debouncedPerformSearch = _.debounce(this.performSearch, 300);

  async performSearch(s: string | null) {
    if (s !== null && s.trim() !== "") {
      this.searchTerm = s;
      this.isSearching = true;
      const collections = (await searchCollections(s)).map((c) => ({
        type: "collection",
        text: c.name,
        value: c.value,
        description: c.description,
      }));
      const articles = this.articles.map((a) => ({
        type: "article",
        text: a.title,
        value: a.filename,
        description: "",
      }));
      const places = this.geoStore.ortslisteGeo.map((f: any) => ({
        type: "place",
        text: f.name,
        value: f.sigle,
        description: "",
      }));
      const results = [...articles, ...places, ...collections].filter(
        (i) => i !== null
      );
      this.searchItems = results;
      this.isSearching = false;
    }
  }

  selectItems(input: string) {
    console.log(input);
  }

  findArticleByTitle(title: string) {
    //check also based on ort
    return this.articles.find((a) => a.title === title);
  }

  get words(): string[] {
    return this.articles.map((w) => w.title);
  }

  get wordsWithWeights(): Array<[string, number]> {
    return this.words.map((w: string) => {
      return [w, _.random(1, 5, true)] as [string, number];
    });
  }

  get filteredWords() {
    return _(this.wordsWithWeights).sampleSize(25).value();
  }

  updateWordProgress(e: any) {
    if (e !== null) {
      this.wordProgress = (e.completedWords / e.totalWords) * 100;
    }
  }

  selectLocations(locs: string[]) {
    if (locs.length === 0) {
      this.loc = "";
    } else {
      this.$router.push({
        path: "/maps",
        query: {
          loc: locs,
        },
      });
    }
  }

  log(e: any) {
    console.log(e);
  }

  getColStr(val: any) {
    let output = JSON.stringify([
      {
        id: 0,
        tempColl: -1,
        collection_name: "Sammlung Neu",
        editing: false,
        fillColor:
          "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
        borderColor: "#000",
        items: [val],
      },
    ]);
    return output;
  }

  strRouting(item: any) {
    this.getLocationsOfCollections(item, 'page');
    return ''
  }

  async getLocationsOfCollections(item: any, val: string) {
    let colls: Number[] = item.value;
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

    stateProxy.collections.addWBOE_coll({
      changedColl: {
        id: Math.random() * 1000,
        selected: true,
        preColl: item.value,
        collection_name: item.text,
        collection_desc: item.description,
        editing: false,
        fillColor:
          "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
        borderColor: "#000",
        items: CollLocation,
      },
      add: true,
    });
    if (val === 'btn') {
      this.$router.push({
        path: "/maps",
      });
    } 
    else if (val === 'page') {
      this.$router.push({
        path: "/db",
      });

    }
  }

  routeToMaps(item: any) {
    let newColl: Collection = {
      id: Math.random() * 1000,
      preColl: -1,
      collection_name: "Neue Sammlung",
      editing: true,
      fillColor: "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
      borderColor: "#000",
      selected: true,
      items: [item.value],
    };
    stateProxy.collections.addTemp_coll({ changedColl: newColl, add: true });
    this.$router.push({
      path: "/maps",
    });
  }

  @Watch("$route")
  siteChanged(to: any, from: any) {
    if (from.path === "/") {
      this.visited = true;
    }
  }

  async mounted() {
    this.loading = true;
    this.articles = await getArticles();
    this.loading = false;
  }
}
</script>
<style lang="scss" scoped>
.word-cloud-link {
  opacity: 0.6;
  color: #3b89a0;
  text-decoration: none;
  &:hover {
    opacity: 1;
  }
}
</style>
