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

    <!-- TRY -->

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
            hide-details
            prepend-inner-icon="search"
            solo
            clearable
          >
            <template v-slot:item="{ item }">
              <v-list-item
                :to="
                  item.type === 'article'
                    ? `/articles/${item.text}`
                    : item.type !== 'collection' ? `/db?query=${item.value}&fields=Sigle1&type=fulltext` : `/db?collection_ids=${item.value}&type=collection`
                "
              >
                <v-list-item-avatar>
                  <v-icon v-if="item.type === 'article'">mdi-newspaper</v-icon>
                  <v-icon v-if="item.type === 'place'">map</v-icon>
                  <v-icon v-if="item.type === 'collection'">mdi-folder-outline</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title> {{ item.text }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.type === 'article'">  Beleg zum Artikel anzeigen </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="item.type === 'collection'">  Sammlung in Belegdatenbank anzeigen </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="item.type === 'place'">  Ort in Belegdatenbank anzeigen </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn
                    @click.stop.prevent="
                      $router.push({
                        path: '/maps',
                        query: {
                          col: getColStr(item.value),
                        },
                      })
                    "
                    v-if="item.type === 'place'"
                    >auf Karte anzeigen</v-btn
                  >
                  <v-btn 
                    @click.stop.prevent="
                      $router.replace(
                        `/db?query=${item.text}&fields=HL&type=fulltext`)" 
                        v-if="item.type === `article`"
                        >in Datenbank anzeigen</v-btn
                      >
                  <v-btn 
                    @click.stop.prevent="getLocationsOfCollections(item.value, item.text)" 
                        v-if="item.type === `collection`"
                        >auf Karte anzeigen</v-btn
                      >
                 </v-list-item-action>
              </v-list-item>
            </template>
            <template v-slot:no-data>
              Der gesuchte Begriff ist weder Artikel noch Ort. Zum Weitersuchen
              in der Belegdatenbank:
              <v-btn
                @click="$router.replace(`db?query=${searchTerm}&fields=HL&type=fulltext`)"
              >
                {{ searchTerm }}</v-btn
              >
            </template>
          </v-autocomplete>
        </v-col>

        <!-- <v-row no-gutters>
    <v-col><v-text-field
      :loading="loading"
        autofocus
        text
        v-model="searchTerm"
        label="Suche nach Wort" 
        @input="debouncedSearchArticle"
        prepend-inner-icon="search"
        solo
        clearable
    ></v-text-field></v-col>
    <v-col><v-autocomplete
      :loading="loading" 
      :items='locationsSearchItems'
      :value="locationsSearchItems"
      @input="selectLocations"
        label="Suche nach Ort"
        autofocus
        v-model="searchOrt" 
        item-text="text"
        item-value="value"
        text
        hide-details
        chips 
        prepend-inner-icon="search"
        solo
        clearable
        >
        <template v-slot:item="{ item }">
          <v-list-item-content>
            <v-list-item-title v-text="item.text"></v-list-item-title>
        <router-link :to="`/maps`"></router-link>
          </v-list-item-content>
        </template>
        </v-autocomplete>
    </v-col>

  </v-row> -->
      </v-flex>
    </v-layout>

    <!-- END TRY -->

    <v-flex style="height: 40vh" xs12>
      <!-- <v-progress-linear
        height="1"
        class="pa-0 ma-0 absolute"
        v-if="wordProgress !== null && wordProgress !== 100"
        indeterminate
      /> -->

      <vue-word-cloud
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
    <div class="text-center mt-5">
      {{ articles ? articles.length.toLocaleString() : "?" }} WBÖ Artikel
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
import { getArticles, searchCollections, getDocumentsByCollection } from "../api";
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
  isSearching = false
  searchItems: Array<{ type: string, text: string, value: string }> = []
  // items=[{text: 'Lemma', value: 'Lemma', disabled: false},{text: 'Ort', value: 'Ort', disabled: false}]

  debouncedPerformSearch = _.debounce(this.performSearch, 300)

  async performSearch(s: string) {
    this.searchTerm = s
    this.isSearching = true
    const collections = (await searchCollections(s)).map((c) => ({ type: 'collection', text: c.name, value: c.value }))
    const articles = this.articles.map((a) => ({ type: "article", text: a.title, value: a.filename }))
    const places = this.geoStore.ortslisteGeo.map((f: any) => ({type: "place", text: f.name, value: f.sigle}))
    const results = [...articles, ...places, ...collections].filter(i => i !== null)
    this.searchItems = results
    this.isSearching = false
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

  async getLocationsOfCollections(colls: string[], collName: string) {
    console.log(Array.isArray(colls))
    console.log(colls)
      if(!Array.isArray(colls)) {
       var tmp = new Array()
       tmp.push(colls)
       colls = tmp
     }

    if(colls.length === 0) {
      return
    }
    let output;

    const res: any = await getDocumentsByCollection([colls[0]], 1, 1000);
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
        
        output = JSON.stringify([
          {
          id: Math.random() * 1000,
          tempColl: colls[0],
          collection_name: collName,
          editing: false,
          fillColor:
            "#" + Math.floor(Math.random() * 16777215).toString(16) + "99",
          borderColor: "#000",
          items: CollLocation,
        }]);
        console.log('output: ' + output)

         this.$router.push({
                        path: '/maps',
                        query: {
                          col: output
                        },
                      })
      }




  @Watch('$route')
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
