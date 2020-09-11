<template>
  <div>
    <v-navigation-drawer
      :value="sideBar"
      right
      app
      permanent
      v-if="sideBar"
    >
      <v-card>
        <v-card-title>
          Karten
          <v-menu open-on-hover :offset-y="true" left nudge nudge-left>
            <template v-slot:activator="{ on }">
              <v-btn  style="left:63%" color="accent" small icon text v-on="on">
                <v-icon>info</v-icon>
              </v-btn>
            </template>
            <info-text class="elevation-24 pa-4 white" path="quelle-karten/allgemein/" />
          </v-menu>
        </v-card-title>
        <v-card-text>
          <v-checkbox v-model="fixTooltip" hide-details label="Show Names" />
        </v-card-text>
        <v-divider />
        <v-card-text>
          <v-card-subtitle class="subtitles">
            Grundkarten
          </v-card-subtitle>
          <v-radio-group v-model="selectedTileSet">
            <v-radio v-for="(tileSet, i) in tileSets" :value="i" :key="i" :label="tileSet.name" />
          </v-radio-group>
          <v-card-subtitle class="subtitles">
            Zusatzkarten
          </v-card-subtitle>
          <v-card-subtitle class="subtitles">
            <small>WBÖ</small>
          </v-card-subtitle>
          <v-checkbox v-model="showBundeslaender" hide-details label="Untersuchungsgebiet (Bundeslandgrenzen + Südtirol)" />
          <v-checkbox v-model="showGrossregionen" hide-details label="Großregionen" />
          <v-checkbox v-model="showKleinregionen" hide-details label="Kleinregionen" />
          <v-checkbox v-model="showGemeinden" hide-details label="untersuchte Gemeinden" />
          <v-card-subtitle style="margin-top:5px;" class="subtitles">
            <small>Weitere</small>
          </v-card-subtitle>
          <v-checkbox v-model="showDialektregionenFill" hide-details label="Dialektregionen Ö - Flächen (SFB-DiÖ)" />
          <v-checkbox v-model="showDialektregionenBorder" hide-details label="Dialektregionen Ö - Grenzen (SFB-DiÖ)" />
          <v-checkbox v-model="showRivers" hide-details label="Flüsse" />
          <v-checkbox v-model="showHillshades" hide-details label="Gebirge" />
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
      <v-card class="sticky-card" width="100%">
        <v-layout>
          <v-flex xs12>
            <v-autocomplete
              :loading="isLoading"
              :items="locationsSearchItems"
              v-model="selectedLocations"
              @input="changeLocinCollection"
              label="Suche…"
              autofocus
              item-text="text"
              item-value="value"
              hide-details
              text
              chips
              prepend-inner-icon="search"
              solo
              clearable
              multiple>
              <template v-slot:item="{ item }">
                <v-list-item-content>
                  <v-list-item-title v-text="item.text"></v-list-item-title>
                </v-list-item-content>
              </template>
            </v-autocomplete>
          </v-flex>
          <v-flex>
            <v-menu open-on-hover :offset-y="true">
              <template v-slot:activator="{ on }">
                <v-btn color="accent" large icon text v-on="on">
                  <v-icon>info</v-icon>
                </v-btn>
              </template>
              <info-text class="elevation-24 pa-4 white" path="karten/infokasten-zur-den-karten/" />
            </v-menu>
          </v-flex>
        </v-layout>
      </v-card>
    <v-layout fill-height class="map-overlay pa-4">
      <v-flex xs1>
        <v-btn fab small class="zoom" @click="zoom = zoom + 1"><v-icon>add</v-icon></v-btn>
        <v-tooltip color="ci" dark right>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" class="zoom" fab small @click="resetView">
              <v-icon>home</v-icon>
            </v-btn>
          </template>
          <span>Ursprungsposition</span>
        </v-tooltip>
        <v-btn fab small class="zoom" @click="zoom = zoom - 1"><v-icon>remove</v-icon></v-btn>
      </v-flex>
      <v-flex class="text-xs-right" offset-xs11>
        <v-btn style="margin-top:5px;" fab @click="sideBar = !sideBar">
          <v-icon>layers</v-icon>
        </v-btn>
      </v-flex>

      

      <v-menu open-on-hover min-width="200" fixed left>
          <template v-slot:activator="{ on }">
            <v-btn dark color="ci" fab fixed bottom right v-on="on">
              <v-icon>save_alt</v-icon>
            </v-btn>
          </template>
          
        <v-list class="context-menu-list" dense>
          <v-subheader>
            <v-icon class="mr-1" small>save_alt</v-icon> Export/Download
          </v-subheader>
          <v-list-item @click="printMap('png')">
            PNG
          </v-list-item>
          <v-list-item disabled @click="printMap('svg')">
            SVG
          </v-list-item>
          <v-list-item @click="printMap('json')">
            GeoJSON
          </v-list-item>
        </v-list>
      </v-menu>
    </v-layout>
    <l-map
      style="z-index: 0; position: absolute; left: 0; top:0; right: 0;"
      ref="map"
      :options="mapOptions"
      :zoom.sync="zoom"
      :center.sync="center">

      <l-tile-layer
        v-if="tileSetUrl != ''"
        :url="tileSetUrl"
        :attribution="tileSets[selectedTileSet].attribution" />
      <l-tile-layer
        v-if="!updateLayers && showHillshades"
        url="https://{s}.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png"
      />

      <l-geo-json
        v-if="!updateLayers && showDialektregionenBorder"
        :options="optionsFunction"
        :optionsStyle="(feature) => ({
          color: '#000',
          weight: 1,
          fillOpacity: 0
        })"
        :geojson="dialektregionen"
      />

      <l-geo-json
        v-if="!updateLayers && showDialektregionenFill"
        :options="{ onEachFeature: bindTooltip(['name']) }"
        :optionsStyle="(feature) => ({
          fillColor : dialektColors[feature.properties.id],
          color: dialektColors[feature.properties.id],
          weight: 2,
          fillOpacity: 0.8
        })"
        :geojson="dialektregionen"
      />

      <l-geo-json
        v-if="!updateLayers && showBundeslaender"
        :options="optionsFunction"
        :geojson="bundeslaender"
        :optionsStyle="{
          fillOpacity: 0,
          color: colorBundesland,
          weight: 2
        }"
      />
      <l-geo-json
        v-if="!updateLayers && showGrossregionen"
        :options="optionsFunctionGross"
        :geojson="grossregionen"
        :optionsStyle="{
          fillOpacity: 0,
          color: colorGrossregionen,
          weight: 1.5
        }"
      />
      <l-geo-json
        v-if="!updateLayers && showGemeinden"
        :options="optionsEveryGemeinde"
        :geojson="gemeinden"
      />

      <l-geo-json
        v-if="!updateLayers && showKleinregionen"
        :options="{ onEachFeature: bindTooltip(['name']) }"
        :geojson="kleinregionen"
        :optionsStyle="{
          fillOpacity: 0,
          color: colorKleinregionen,
          weight: 1
        }"
      />
      
      <l-geo-json
        v-if="!updateLayers && showRivers && rivers !== null"
        :geojson="rivers"
      />

      <div v-for="item in geoCollections" :key="item.collection_name + '-span'">
        <l-geo-json
          v-if="!updateLayers && item.items.length > 0"
          :geojson="collDisplayLocations(item.geo)"
          :options="options"
          :optionsStyle="item.style"
        />
      </div>
      
    </l-map>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LMap, LTileLayer, LMarker, LGeoJson, LIconDefault, LWMSTileLayer as LWmsTileLayer } from 'vue2-leaflet'
import InfoText from '@components/InfoText.vue'
import InfoBox from '@components/InfoBox.vue'
import * as geojson from 'geojson'
import MapLegende from '@components/MapLegende.vue'
import { geoStore } from '../store/geo'
import * as FileSaver from 'file-saver'
import domtoimage from 'dom-to-image'
import * as L from 'leaflet'
import * as _ from 'lodash'
import { searchCollections, getDocumentsByCollection, getCollectionByIds } from '../api'

function base64ToBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1])
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const dw = new DataView(ab)
  for (let i = 0; i < byteString.length; i++) {
    dw.setUint8(i, byteString.charCodeAt(i))
  }
  return new Blob([ab], {type: mimeString})
}

const defaultCenter = [47.64318610543658, 13.53515625]
const defaultZoom = 7

interface Places {
  Ort: string
  Bundesland: string
  Großregion: string
}

@Component({
  components: {
    InfoText,
    InfoBox,
    MapLegende,
    LMap,
    LTileLayer,
    LGeoJson,
    LMarker,
    LWmsTileLayer
  }
})
export default class Maps extends Vue {

  @Prop() loc: string|null
  @Prop() collection_ids: string|null


  tileSets = [
    {
      name: 'Humanitarian Open Tiles',
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png '
    },
    {
      name: 'Wikimedia',
      url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
    },
    {
      name: 'Minimal Ländergrenzen (hell)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', 
	    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    },
    {
      name: 'Minimal Ländergrenzen (dunkel)',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	    subdomains: 'abcd',
    },
    {
      name: 'Leer',
      url: '',
    }
  ]
  selectedTileSet = 0

  sideBar = false;
  showHillshades = false
  showRivers = false
  showDialektregionenBorder = false
  showDialektregionenFill = false
  showBundeslaender = false
  showGrossregionen = false
  showKleinregionen = false
  showGemeinden = false
  updateLayers = false
  colorGemeinde = '#6f9f58'
  colorBundesland = '#000'
  colorGrossregionen = '#555'
  colorKleinregionen = '#888'
  pinned = false;
  fixTooltip = false;
  //searchCollections
  geoCollections: any[] = 
    [
      {
        collection_name: "untitled coll",
        fillColor: '#' + Math.floor(Math.random() * 16777215).toString(16) + '99',
        borderColor: '#FFF',
        items: [
        ]
      }
    ]
  selectedCollection = 0;
  selectedLocations: any[] = []
  title: boolean = true;

  rivers: any = null
  autoFit = false
  zoom: number = defaultZoom
  center: number[] = defaultCenter
  geoStore = geoStore
  dialektColors = [
    'rgba(182, 216, 203, .8)',
    'rgba(153, 153, 241, .5)',
    'rgba(153, 153, 241, .8)',
    'rgba(153, 153, 241, .95)',
    'rgba(0, 153, 0, .7)'
  ]

  mapOptions = {
    scrollWheelZoom: true, zoomControl: false,
    renderer: L.canvas()
  }
  optionsEveryGemeinde = {
    onEachFeature: this.bindTooltip(['name']),
    pointToLayer: (feature: any, latlng: any) => {
			return L.circleMarker(latlng, {
				radius: 5,
				fillColor: this.colorGemeinde,
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			})
		}
  }

  options = {
    onEachFeature: this.onEachFeatureFunction,
    pointToLayer: (feature: any, latlng: any) => {
			return L.circleMarker(latlng, {
				radius: 5,
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			})
		}
  }
  printPlugin: any = null
  layerGeoJson: any = null
  map: any = null

  get tileSetUrl(): string {
    return this.tileSets[this.selectedTileSet].url
  }


  async fitMap() {
    await this.$nextTick()
    if (this.map && this.layerGeoJson) {
      this.map.mapObject.fitBounds(this.layerGeoJson.mapObject.getBounds())
    }
  }

  resetView() {
    this.zoom = defaultZoom
    this.center = defaultCenter
  }

  async printMap(type?: string) {
    const el = (this.$refs.map as Vue).$el
    if (type === 'svg') {
      const blob = await domtoimage.toSvg(el)
      FileSaver.saveAs(new Blob([blob]), 'map.svg')
    } else if (type === 'png') {
      const uriString = await domtoimage.toPng(el)
      FileSaver.saveAs(base64ToBlob(uriString), 'map.png')
    } else if (type === 'json') {
      const blob = JSON.stringify(this.displayLocations, undefined, 2)
      FileSaver.saveAs(new Blob([blob]), 'map.json')
    }
  }


  async asyncForEach(array: any[], callback:any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

  get allFeatures(): geojson.Feature[] {
    if (this.isLoading) {
      return []
    } else {
      return _([
        ...this.geoStore.bundeslaender!.features,
        ...this.geoStore.grossregionen!.features,
        ...this.geoStore.gemeinden!.features,
        ...this.geoStore.kleinregionen!.features
      ]).map((f) => {
        return {
          ...f,
          properties: {
            ...f.properties,
            name:
              (f.properties as any).NAME_D ||
              (f.properties!.name) ||
              (f.properties as any).Bundesland ||
              (f.properties as any).Grossreg,
            sigle:
              (f.properties as any).sigle ||
              (f.properties as any).Sigle
          }
        }
      }).value()
    }
  }

  get bundeslaender(): geojson.Feature[] {
    if (!this.isLoading && this.geoStore.bundeslaender !== null) {
      return this.geoStore.bundeslaender.features
    } else {
      return []
    }
  }

  get grossregionen(): geojson.Feature[] {
    if (!this.isLoading && this.geoStore.grossregionen !== null) {
      return this.geoStore.grossregionen.features
    } else {
      return []
    }
  }

  get gemeinden(): geojson.Feature[] {
    if (!this.isLoading && this.geoStore.gemeinden !== null) {
      return this.geoStore.gemeinden.features
    } else {
      return []
    }
  }

  get kleinregionen(): geojson.Feature[] {
    if (!this.isLoading && this.geoStore.kleinregionen !== null) {
      return this.geoStore.kleinregionen.features
    } else {
      return []
    }
  }

  get dialektregionen(): geojson.Feature[] {
    if (!this.isLoading && this.geoStore.dialektregionen !== null) {
      return this.geoStore.dialektregionen.features
    } else {
      return []
    }
  }

  get displayLocations() {
    if (this.loc && !this.isLoading) {
      const locations = this.loc.split(',')
      return {
        ...this.geoStore!.gemeinden,
        features: this.allFeatures.filter((f: any) => {
          return locations.indexOf(f.properties.sigle) > -1
        })
      }
    } else {
      return this.allFeatures
    }
  }

  get locationsSearchItems() {
    if (!this.isLoading) {
      var lokaleOrtsliste = this.geoStore.ortslisteGeo.map((f: any) => {
        return {
          text: f.name,
          value: f.sigle,
          parents: (f.parentsObj ? f.parentsObj.slice().reverse().map((o: any) => o.name).join(', ') : '')
        }
      })
      return lokaleOrtsliste = lokaleOrtsliste.filter((el:any) => {
        return el != null;
      });
    } else {
      return []
    }
  }

  changeLocinCollection() {
    let coll = this.geoCollections[this.selectedCollection]
    let new_places = this.selectedLocations
    coll.items.forEach((element: any) => {
      if(!this.selectedLocations.includes(element.sigle)) {
      }
    });
  }

  collDisplayLocations(locations:string[]) {
    return {
      ...this.geoStore!.gemeinden,
      features: this.allFeatures.filter((f: any) => {
        return locations.indexOf(f.properties.sigle) > -1
      })
    }
  }

  changeURL(colls: String[]) {
    if(this.$route.query.loc){
      this.$router.replace({ query: { loc: this.$route.query.loc } })
    } else {
      this.$router.replace({ query: {} })
    }
  }


  getPlacesFromSigle(sigle: string): Places {
    const place = _(geoStore.ortsliste).find(o => o.sigle === sigle)
    if (place === undefined) {
      return {
        Ort: '',
        Großregion: '',
        Bundesland: ''
      }
    } else {
      const bl = _(place.parentsObj).find(o => o.field === 'Bundesland')
      const gr = _(place.parentsObj).find(o => o.field === 'Großregion')
      return {
        Ort: place.name,
        Großregion: gr ? gr.name : '',
        Bundesland: bl ? bl.name : '',
        [ place.field ]: place.name,
      }
    }
  }

  get optionsFunction() {
    const aThis: any = this
    var tooltip = this.fixTooltip;
    return {
      onEachFeature: this.bindTooltip(['name'], false, tooltip)
    }
  }

  get optionsFunctionGross() {
    const aThis: any = this
    var tooltip = this.fixTooltip;
    return {
      onEachFeature: this.bindTooltip(['Grossreg'], false, tooltip)
    }
  }

  bindTooltip(properties = ['name'], showLabel = false, perm = false) {
    return (feature: geojson.Feature, layer: L.Layer) => {
      layer.bindTooltip(
        properties
          .map(p => `<div>${showLabel ? p + ': ' : ''}${ (feature.properties as any)[p] }</div>`)
          .join(''),
        { permanent: perm, sticky: true }
      )
    }
  }

  get onEachFeatureFunction() {
    const aThis: any = this
    return (feature: geojson.Feature, layer: L.Layer) => {
      //@ts-ignore
      if(feature.properties.fid){
        this.bindTooltip(['Name', 'sigle'], true)(feature, layer)
      } else {
        this.bindTooltip(['name', 'sigle'], true)(feature, layer)
      }
      layer.on('mouseover', function(this: any) {
        this.setStyle({
          fillOpacity: 1
        })
      })
      layer.on('mouseout', function(this: any) {
        const aSigleS = (feature.properties as any).sigle
        this.setStyle({
          fillOpacity: 0.5
        })
      })
    }
  }
  get isLoading() {
    if (
      this.geoStore.gemeinden !== null &&
      this.geoStore.grossregionen !== null &&
      this.geoStore.bundeslaender !== null &&
      this.geoStore.ortsliste !== null &&
      this.geoStore.kleinregionen !== null
    ) {
      return false
    } else {
      return true
    }
  }
  async loadRivers() {
    // tslint:disable-next-line:max-line-length
    this.rivers = await (await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_europe.geojson')).json()
  }
  @Watch('showHillshades')
  @Watch('showDialektregionen')
  @Watch('showBundeslaender')
  @Watch('showRivers')
  @Watch('selectedTileSet')
  layerChanged() {
    this.updateLayers = true
  }
  @Watch('selectedLocations')
  layerChangedSL(nVal: any, oVal: any) {
    if ((oVal && oVal.length > 0) && (!nVal || nVal.length === 0)
    || (nVal && nVal.length > 0) && (!oVal || oVal.length === 0)) {
      this.updateLayers = true
    }
  }
  @Watch('updateLayers')
  layerUpdate(nVal: any) {
    if (nVal) {
      this.$nextTick(() => {
        this.updateLayers = false
      })
    }
  }

  @Watch('selectedTileSet')
  darkModeBorderColor() {
    if(this.selectedTileSet === 3) {
      this.colorBundesland = '#FFF'
      this.colorGrossregionen = '#BBB'
      this.colorKleinregionen = '#888'
    }
  }
  @Watch('$route.query')
  comingFromArticle(){
    if(this.$route.query.source === 'article'){
      this.showGrossregionen = true;
      this.selectedTileSet = 4;
      this.fixTooltip = true;
      this.$router.replace({ query: { loc: this.$route.query.loc } })
    }
  }

  async mounted() {
    this.loadRivers()
    this.$nextTick(() => {
      this.layerGeoJson = this.$refs.layerGeoJson
      this.map = this.$refs.map
    })
  }
}
</script>
<style lang="scss" scoped>
@import "../../node_modules/leaflet/dist/leaflet.css";
.map-overlay{
  position: absolute;
  z-index: 1;
  width: 100%;
  left: 0;
  right: 0;
  pointer-events: none;
  * {
    pointer-events: all
  }
}

#legende{
  position: fixed;
  bottom: 50px;
  left: 50px;
}

.zoom{
  margin: 5px;
}

.legendeButtons{
  margin-left: 7px;
  margin-right: 7px;
}

.navButton{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 2px;
  background-color: white;
}

.subtitles{
  margin: -15px;
}

.pinBtn{
  float:right;
  margin:10px;
  margin-top: -45px;
}

.toolbar {
  margin-top:7px;
}

.sticky-card {
  z-index: 1;
  position: -webkit-sticky;
  position: sticky;
  top: 5px;
}
</style>
