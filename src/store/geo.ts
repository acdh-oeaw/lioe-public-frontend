// tslint:disable:max-line-length
import * as geojson from 'geojson'
import * as _ from 'lodash'

let i = 1;

export const geoStore = {
  gemeinden: null as geojson.FeatureCollection|null,
  grossregionen: null as geojson.FeatureCollection|null,
  bundeslaender: null as geojson.FeatureCollection|null,
  kleinregionen: null as geojson.FeatureCollection|null,
  dialektregionen: null as geojson.FeatureCollection|null,
  ortslistenDaten: null as any|null,
  ortsliste: null as any|null,
  ortslisteGeo: null as any|null
}

async function init() {
  geoStore.kleinregionen = await (await fetch('/static/Kleinregionen.geojson.json')).json() as geojson.FeatureCollection
  geoStore.gemeinden = getPointsNotPoly(await (await fetch('/static/Gemeinden.geojson.json')).json() as geojson.FeatureCollection, await( await fetch('/static/sigle-polygone.json')).json() as geojson.FeatureCollection)
  geoStore.grossregionen = await (await fetch('/static/grossregionen-geojson-optimized.json')).json() as geojson.FeatureCollection
  geoStore.bundeslaender = await (await fetch('/static/bundeslaender.geojson.json')).json() as geojson.FeatureCollection
  geoStore.dialektregionen = await (await fetch('/static/SFB_Dialektregionen.geojson')).json() as geojson.FeatureCollection
  geoStore.ortslistenDaten = getOrtslistenDaten(await (await fetch('/static/Ortsdatenbank_Orte-Gemeinden-Kleinregionen-Grossregionen-Bundeslaender_nur+OE+STir.json')).json() as geojson.FeatureCollection)
  geoStore.ortsliste = geoStore.ortslistenDaten !== null ? geoStore.ortslistenDaten.all || null : null
  geoStore.ortslisteGeo = filterOrtslisteByGeoJSON(geoStore.ortsliste, [...geoStore.gemeinden!.features, ...geoStore.grossregionen!.features, ...geoStore.bundeslaender!.features, ...geoStore.kleinregionen!.features])
}

function filterOrtslisteByGeoJSON (oList: any, gList: any) {
  if (oList !== null && gList !== null) {
    const nOList: any[] = []
    const mSigle: any[] = []
    const gListSigles = gList.map((gObj: any) => {
      return gObj.properties.sigle || gObj.properties.Sigle
    })
    oList.forEach((oObj: any) => {
      if (gListSigles.indexOf(oObj.sigle) > -1) {
        nOList.push(oObj)
      } else {
        mSigle.push(oObj.sigle)
      }
    })
    if (mSigle.length > 0) {
      console.log('Fehlende Sigle in geoJSONs:', mSigle)
    }
    return nOList.length > 0 ? nOList : null
  } else {
    return null
  }
}

function getPointsNotPoly(DataG: any , DataPoint:any ) {
  DataG.features.forEach((gemeinde: any) => {
    if(DataPoint[gemeinde.properties.sigle]) {
      gemeinde.geometry = {"type":"Point","coordinates": DataPoint[gemeinde.properties.sigle].locationCenter.split(",").reverse()}
    }
  });
  return DataG;
}

function getOrtslistenDaten (aOlDaten: any): any|null {
  if (aOlDaten !== null) {
    aOlDaten.all = []
    aOlDaten.obj = {}
    aOlDaten.allObj = {}
    aOlDaten.uFieldsRev = aOlDaten.uFields.slice().reverse()
    aOlDaten.uFieldsRev.forEach((aField: any, aFIndex: number) => {
      aOlDaten[aField].forEach((aObj: any) => {
        aObj.field = aField
        if (!aOlDaten[aField + 'Obj']) { aOlDaten[aField + 'Obj'] = {} }
        aOlDaten[aField + 'Obj'][aObj.sigle] = aObj
        aOlDaten.allObj[aObj.sigle] = aObj
        if (aFIndex > 0 && aObj.parents) {
          aOlDaten.uFields.forEach((u2Field: any) => {
            if (aObj.parents[u2Field]) {
              if (!aObj.parentsObj) { aObj.parentsObj = [] }
              aObj.parentsObj.push(aOlDaten.allObj[aObj.parents[u2Field]])
            }
          });
          if (aObj.parents[aOlDaten.uFieldsRev[aFIndex - 1]]) {
            let aPField = aOlDaten.uFieldsRev[aFIndex - 1]
            if (aObj.parents[aPField] && aOlDaten[aPField + 'Obj'] && aOlDaten[aPField + 'Obj'][aObj.parents[aPField]]) {
              if (!aOlDaten[aPField + 'Obj'][aObj.parents[aPField]].childs) { aOlDaten[aPField + 'Obj'][aObj.parents[aPField]].childs = [] }
              aOlDaten[aPField + 'Obj'][aObj.parents[aPField]].childs.push(aObj)
            }
          }
        }
      })
    });
    if (aOlDaten[aOlDaten.uFieldsRev[0]]) {
      aOlDaten.obj = aOlDaten[aOlDaten.uFieldsRev[0]]
      aOlDaten.all = getOrtsliste(aOlDaten.obj)
    }
  }
  return aOlDaten
}

function getOrtsliste(aOlDatenObj: any): any|null {
  let aList: any[] = []
  aOlDatenObj.forEach((aObj: any) => {
    if ( aObj.childs && Array.isArray(aObj.childs)) {
      aList = [...aList, aObj, ...getOrtsliste(aObj.childs)]
    }
    else {
      aList = [...aList, aObj ]
    }
  });
  return aList
}

export const initialize = _.once(init)
