<template>
  <div>
      <v-card class="sticky-card" width="100%">
        <v-layout>
          <v-flex xs12>
            <v-autocomplete
              v-if="searchItemType != 'collection'"
              :loading="isLoading"
              :items="locationsSearchItems"
              :value="selectedLocations"
              @input="selectLocations"
              label="Suche…"
              autofocus
              item-text="text"
              item-value="value"
              hide-details
              dense
              text
              prepend-inner-icon="search"
              solo
              clearable
              multiple>
            </v-autocomplete>
            <v-autocomplete
              v-else
              :loading="isLoading"
              :search-input.sync="searchCollection"
              :items="collectionSearchItems"
              :value="selectedCollections"
              @input="selectCollections"
              label="Suche Sammlungen…"
              autofocus
              item-text="text"
              hide-details
              dense
              text
              prepend-inner-icon="search"
              solo
              clearable
              multiple>
            </v-autocomplete>
          </v-flex>
          <v-flex align-content-center fill-height>
            <v-select
              dense
              text
              solo
              flat
              hide-details
              class="divider-left"
              v-model="searchItemType"
              :items="[{text: 'Ort', value: 'Ort', disabled: false}, {text: 'Bundesland', value: 'Bundesland', disabled: false}, {text: 'Großregion', value: 'Großregion', disabled: false}, {text: 'Kleinregion', value: 'Kleinregion', disabled: false}, {text: 'Gemeinde', value: 'Gemeinde', disabled: false}, {text: 'Collection', value: 'collection', disabled: false}, ]" />
          </v-flex>
          <v-flex >
            <v-menu :close-on-click="false" :close-on-content-click="false" open-on-hover left>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon text>
                  <v-icon>mdi-format-color-fill</v-icon>
                </v-btn>
              </template>
               <v-color-picker hide-inputs v-model="colorSelect"></v-color-picker>
            </v-menu>
          </v-flex>
           <v-flex >
            <v-menu :close-on-click="false" :close-on-content-click="false" open-on-hover left>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon text>
                  <v-icon>mdi-border-color</v-icon>
                </v-btn>
              </template>
               <v-color-picker hide-inputs v-model="borderColorSelect"></v-color-picker>
            </v-menu>
          </v-flex>
          <v-flex>
            <v-tooltip color="secondary" dark top>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" @click="autoFit = !autoFit" :color="autoFit ? 'primary' : 'grey'" icon text>
                  <v-icon>my_location</v-icon>
                </v-btn>
              </template>
              <span>Ausschnitt automatisch wählen</span>
            </v-tooltip>
          </v-flex>
          <v-flex>
            <v-menu open-on-hover max-width="400" max-height="95vh">
              <template v-slot:activator="{ on }">
                <v-btn color="accent" class="mr-3" small v-on="on" icon text bottom>
                  <v-icon>info_outline</v-icon>
                </v-btn>
              </template>
              <info-text class="elevation-24 pa-4 white" path="karten/infokasten-zur-den-karten/" />
            </v-menu>
          </v-flex>
        </v-layout>
      </v-card>
      <InfoBox fstyle="position:relative;z-index:1;margin-bottom:-129px!important;margin-top:15px!important;">
        <h4 class="headline mb-0">Hinweis</h4>
        <div>Derzeit handelt es sich noch um eine vorläufige Version, in der noch nicht alle in der Datenbank vorhandenen Gemeinden und Regionen angezeigt werden können!</div>
      </InfoBox>
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
      <v-flex class="text-xs-right" offset-xs10 xs1>
        <v-menu ref="kartenMenu" :close-on-click="false" :close-on-content-click="false" v-model="pinned" min-width="200" left>
          <template v-slot:activator="{ on }">
            <v-btn style="margin-top:5px;" fab v-on="on">
              <v-icon>layers</v-icon>
            </v-btn>
          </template>
          <v-card scrollable>
              <v-card-title>
                Karten
              </v-card-title>
              <v-btn class="pinBtn" icon small @click="pinned=false">
                <v-icon>mdi-window-close</v-icon>
              </v-btn>
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
              <v-checkbox v-model="showGemeinden" hide-details label="untersuchte Gemeinden" />
              <v-checkbox v-model="showGrossregionen" hide-details label="Großregionen" />
              <v-checkbox v-model="showKleinregionen" hide-details label="Kleinregionen" />
              <v-card-subtitle style="margin-top:5px;" class="subtitles">
                <small>Weitere</small>
              </v-card-subtitle>
              <v-checkbox v-model="showRivers" hide-details label="Flüsse" />
              <v-checkbox v-model="showHillshades" hide-details label="Gebirge" />
              <v-checkbox v-model="showDialektregionenFill" hide-details label="DiÖ Dialektregionen (Flächen)" />
              <v-checkbox v-model="showDialektregionenBorder" hide-details label="DiÖ Dialektregionen (Grenzen)" />
            </v-card-text>
          </v-card>
        </v-menu>
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
      style="z-index: 0; position: absolute; left: 0; right: 0; margin-top: -25px;"
      ref="map"
      :options="mapOptions"
      :zoom.sync="zoom"
      :center.sync="center">

      <l-tile-layer
        :url="tileSetUrl"
        :attribution="tileSets[selectedTileSet].attribution" />
      <l-tile-layer
        v-if="!updateLayers && showHillshades"
        url="http://{s}.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png"
      />

      <l-geo-json
        v-if="!updateLayers && showDialektregionenBorder"
        :options="{ onEachFeature: bindTooltip(['name']) }"
        :optionsStyle="(feature) => ({
          color: '#000',
          weight: 2,
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
        :options="{ onEachFeature: bindTooltip(['name']) }"
        :geojson="bundeslaender"
        :optionsStyle="{
          fillOpacity: 0,
          color: colorBundesland,
          weight: 2
        }"
      />
      <l-geo-json
        v-if="!updateLayers && showGrossregionen"
        :options="{ onEachFeature: bindTooltip(['Grossreg']) }"
        :geojson="grossregionen"
        :optionsStyle="{
          fillOpacity: 0,
          color: colorGrossregionen,
          weight: 2
        }"
      />
      <l-geo-json
        v-if="!updateLayers && showGemeinden"
        :options="optionsEveryGemeinde"
        :geojson="gemeinden"
      />

      <l-geo-json
        v-if="!updateLayers && showKleinregionen"
        :options="{ onEachFeature: bindTooltip(['Name']) }"
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
      <l-geo-json
        v-if="!updateLayers && selectedLocations.length > 0"
        ref="layerGeoJson"
        :geojson="displayLocations"
        :options="options"
        :optionsStyle="styleFunction"
      />
      <div v-for="item in geoCollections" :key="item.collection + '-span'">
        <l-geo-json
          v-if="!updateLayers"
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
      url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png '
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
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', 
	    attribution: 'Tiles &copy; Esri &mdash; Source: Esri'
    }
  ]
  selectedTileSet = 0

  showHillshades = false
  showRivers = false
  showDialektregionenBorder = false
  showDialektregionenFill = false
  showBundeslaender = false
  showGrossregionen = false
  showKleinregionen = false
  showGemeinden = false
  updateLayers = false
  colorGemeinde = '#800'
  colorBundesland = '#000'
  colorGrossregionen = '#080'
  colorKleinregionen = '#020'
  colorSelect = '#044'
  borderColorSelect = '#000'
  pinned = false;
  //searchCollections
  searchCollection: string|null = null
  collectionSearchItems: any[] = []
  selectedCollections: any[] = []
  geoCollections: any[] = []

  rivers: any = null
  autoFit = false
  zoom: number = defaultZoom
  center: number[] = defaultCenter
  geoStore = geoStore
  fillColor: string = '#2467a7'
  dialektColors = [
    'rgba(182, 216, 203, .8)',
    'rgba(153, 153, 241, .5)',
    'rgba(153, 153, 241, .8)',
    'rgba(153, 153, 241, .95)',
    'rgba(0, 153, 0, .7)'
  ]

  attribution: string = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  randomColors: object = {}
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
				color: '#000',
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
				fillColor: '#ff7800',
				color: '#000',
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			})
		}
  }
  printPlugin: any = null
  searchItemType = 'Ort'
  layerGeoJson: any = null
  map: any = null

  get tileSetUrl(): string {
    return this.tileSets[this.selectedTileSet].url
  }

  get selectedLocations(): string[] {
    if (this.loc) {
      return this.loc.split(',')
    } else {
      return []
    }
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

  selectLocations(locs: string[]) {
    if(this.$route.query.collection_ids){
      this.$router.replace({ query: { collection_ids: this.$route.query.collection_ids, loc: locs.join(',') } })
      if (this.autoFit) {
        this.fitMap()
      }
    }else if (locs.length === 0) {
      if(this.$route.query.collection_ids) {
        this.$router.replace({ query: { collection_ids: this.$route.query.collection_ids } })
      } else {
        this.$router.replace({ query: {} })
        if (this.autoFit) {
          this.resetView()
        }
      }
    }else {
      this.$router.replace({ query: { loc: locs.join(',') } })
      if (this.autoFit) {
        this.fitMap()
      }
    }
  }

  async selectCollections(colls: any[]) {
    if(colls.length === 0){
      if(this.$route.query.loc){
        this.$router.replace({ query: { collection_ids: colls.map((x) => x).join(), loc: this.$route.query.loc } })
      } else {
        this.$router.replace({ query: {} })
      }
    } else {
      if(this.$route.query.loc){
        this.$router.replace({ query: { collection_ids: colls.map((x) => x).join(), loc: this.$route.query.loc } })   
      } else {
        this.$router.replace({ query: { collection_ids: colls.map((x) => x).join() } })
      }
      await this.getLocationsOfCollections(colls);
    }
  }

  async getLocationsOfCollections(colls: any[]) {
    //Collection got added
    if(colls.length >= this.geoCollections.length) {
      colls.forEach(async coll => {
        //Is this the new collection or an old one
        let shownInGeo = false;
        this.geoCollections.forEach(CollInGeo => {
          if(CollInGeo.collection === coll) {
            shownInGeo = true;
          }
        });
        //It is the new one
        if(!shownInGeo) {
          const res:any = await getDocumentsByCollection([coll],1,1000)
          let CollLocation:any[] = []
          //@ts-ignore
          res.documents.forEach(document => {
            let sigle:string = document.ortsSigle;
            if(sigle){
              if(!CollLocation.includes(document.ortsSigle.split(' ')[0])) {
                CollLocation.push(document.ortsSigle.split(' ')[0])
              }
            }
          });
          const styleElement = {
            weight: 1,
            color: '#000',
            opacity: 1,
            fillColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
            fillOpacity: 0.5
          }
          this.geoCollections.push({collection: coll, geo: CollLocation, style: styleElement});
        }
      });
    } else {
      let deletedColl = -1;
      this.geoCollections.forEach(CollInGeo => {
          if(!colls.includes(CollInGeo.collection)) {
            deletedColl = this.geoCollections.indexOf(CollInGeo);
          }
      });
      if(deletedColl > -1){
      this.geoCollections.splice(deletedColl, 1);
      }
    }
    console.log(this.geoCollections)
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

  collDisplayLocations(locations:string[]) {
    return {
      ...this.geoStore!.gemeinden,
      features: this.allFeatures.filter((f: any) => {
        return locations.indexOf(f.properties.sigle) > -1
      })
    }
  }

  get locationsSearchItems() {
    if (!this.isLoading) {
      var lokaleOrtsliste = this.geoStore.ortslisteGeo.map((f: any) => {
        if(f.field === this.searchItemType || this.searchItemType === 'Ort'){
          return {
            text: f.name,
            value: f.sigle,
            parents: (f.parentsObj ? f.parentsObj.slice().reverse().map((o: any) => o.name).join(', ') : '')
          }
        }else {
          return null
        }
      })
      return lokaleOrtsliste = lokaleOrtsliste.filter((el:any) => {
        return el != null;
      });
    } else {
      return []
    }
  }

  @Watch('searchCollection')
  async onSearchCollection(val: string|null) {
    if (val !== null && val.trim() !== '') {
      this.collectionSearchItems = (await searchCollections(val)).map(x => ({ ...x, text: x.name }))
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

  get styleFunction() {
    const aThis: any = this
    var colour: string = this.colorSelect;
    var border: string = this.borderColorSelect;
    return (feature: any) => {
      const aSigleS: string = feature.properties.sigle
      if (!aThis.randomColors[aSigleS]) {
        aThis.randomColors[aSigleS] = '#' + Math.floor(Math.random() * 16777215).toString(16)
      }
      return {
        weight: 1,
        color: border,
        opacity: 1,
        fillColor: colour,
        fillOpacity: 0.5
      }
    }
  }

  bindTooltip(properties = ['name'], showLabel = false) {
    return (feature: geojson.Feature, layer: L.Layer) => {
      layer.bindTooltip(
        properties
          .map(p => `<div>${showLabel ? p + ': ' : ''}${ (feature.properties as any)[p] }</div>`)
          .join(''),
        { permanent: false, sticky: true }
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

.zoom{
  margin: 5px;
}

.subtitles{
  margin: -15px;
}

.pinBtn{
  float:right;
  margin:10px;
  margin-top: -45px;
}

.sticky-card {
  z-index: 1;
  position: -webkit-sticky;
  position: sticky;
  top: 5px;
}
</style>
