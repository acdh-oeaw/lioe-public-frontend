import { Collection } from '@/store/collections'
import axios from 'axios'
import _ from 'lodash'
import { userStore } from '@/store/user'

interface Documents {
  total: {
    value: number
    relation: string
  }
  documents: {
    colSources: null | Collection[]
    Bedeutung: string
    Fragebogennummer: string
    Hauptlemma: string
    Kontext: string
    Lautung: string
    Nebenlemma: string
    Wortart: string
    entry: any
    id: string
    ortsSigle: string
  }[]
}

export interface SearchRequest {
  query: string | null
  // string contains null == all | name
  fields: null | string
  headerStr: string
  id: number
}

interface individualRequest {
  query: string | (string | null)[]
  field: string
}

const apiEndpoint = 'https://dboeannotation.acdh.oeaw.ac.at/api'
const txtEndpoint = 'https://lioe-cms.dioe.at/' // 'https://lioe-cms.acdh-dev.oeaw.ac.at/lioetxt/'
export const localEndpoint = import.meta.env.VITE_APP_API_BASE_URL || ""
const articleEndpoint = localEndpoint + '/api/articles'

const localUrls: { [remoteUrl: string]: string } = {
  '/home/': '/',
  '/wboe-artikel/': '/articles',
  '/karten/': '/maps',
  '/materialien/': '/resources',
  '/belegdatenbank/': '/db',
}

var finalQuery: Object = {};

export async function getWebsiteHtml(path: string): Promise<string> {
  path =
    txtEndpoint === path.substr(0, txtEndpoint.length)
      ? path.substr(txtEndpoint.length)
      : path
  if (path.substr(path.length - 1) !== '/') {
    path += '/'
  }
  let html = await (await fetch(txtEndpoint + path)).text()
  if (html.indexOf('id="content"') > -1) {
    let htmlDom = new DOMParser().parseFromString(html, 'text/html')
    let contentHtml = htmlDom.getElementById('content')
    if (contentHtml) {
      // console.log('xxx', { html, htmlDom, contentHtml })
      html = contentHtml.innerHTML
    }
  }
  return html
}

export function isExternUrl(url: string): boolean {
  return txtEndpoint !== url.substr(0, txtEndpoint.length)
}

export function isLocalUrl(url: string): string | null {
  let rUrl = null
  Object.keys(localUrls).forEach((aUrl: any) => {
    if (url.substr(url.length - aUrl.length) === aUrl) {
      rUrl = localUrls[aUrl]
    }
  })
  return rUrl
}

/**
 * Get total number of documents accessible in the database.
 */
export async function getDocumentTotalCount(): Promise<number> {
  const r = (await axios(localEndpoint + '/es-count', {
    method: 'POST',
    data: { query: { match_all: {} } },
  })
  ).data

  return r.count ? r.count : 0;
}

/**
 * Get total number of documents while sending a search query.
 */
export async function getDocumentTotalCountPerRequest(): Promise<number> {
  const r = (await axios(localEndpoint + '/es-count', {
    method: 'POST',
    data: { query: finalQuery },
  })
  ).data

  return r.count ? r.count : 0;
}

export async function getDocuments(
  page = 1,
  items = 100,
  sortBy: string[] = [],
  descending: boolean[] = [true]
): Promise<Documents> {
  const sort = []
  if (sortBy.length !== 0) {
    if (descending.length !== 0) {
      sort.push({
        [`${sortBy[0]}.keyword`]: descending[0] ? 'desc' : 'asc',
      })
    } else {
      sort.push(sortBy[0])
    }
  }

  const ds = (
    await axios({
      method: 'POST',
      data: {
        size: items,
        from: (page - 1) * items,
        sort,
      },
      url: localEndpoint + '/es-query',
    })
  ).data
  return {
    documents: ds.hits.hits
      .filter((e: any) => e._source.entry)
      .map((h: any) => {
        return {
          ...h._source,
          id: h._id,
          ortsSigle: sigleFromEsRef(h._source.entry.ref),
        }
      }),
    total: ds.hits.total,
  }
}

function sigleFromEsRef(
  ref: Array<{ $: string; '@type': string }>
): string | null {
  if (Array.isArray(ref)) {
    const q = ref.find((r) => r['@type'] === 'quelleBearbeitet')
    if (q) {
      const m = q.$.match(/\{(.*)\}/)
      return m !== null ? m[0].replace('{', '').replace('}', '') : null
    } else {
      return null
    }
  } else {
    return null
  }
}

export type WBOECollection = {
  name: string,
  value: number,
  description: string,
  text?: string
}

export async function searchCollections(
  val: string,
  page = 1
): Promise<{
  count: number
  next: string | null
  results: WBOECollection[]
}> {
  const res = await (
    await fetch(
      `${apiEndpoint}/collections/?page=${page}&page_size=25&title=` + val
    )
  ).json()
  return {
    count: res.count as number,
    next: res.next as string | null,
    results: res.next === undefined ? [] : res.results.map((r: any) => {
      return {
        name: r.title,
        value: _.last(r.url.match(/(\d+)/)),
        description: r.description,
      }
    }),
  }
}

export async function getCollectionByIds(
  ids: string[]
): Promise<{ name: string; value: string; description: string }[]> {
  const ress = await Promise.all(
    ids.map(async (id) =>
      (await fetch(apiEndpoint + '/collections/' + id)).json()
    )
  )
  return ress.map((r: any) => ({
    name: r.title,
    value: _.last(r.url.match(/(\d+)/)) as string,
    description: r.description,
  }))
}

export async function searchDocuments(
  searchAllMult: SearchRequest[] | null,
  searchInd: SearchRequest[] | null,
  page = 1,
  items = 100,
  descending: boolean[] = [true],
  sortBy: any[] = [null],
  should_fuzzy: boolean = false,
  prefix: Boolean = false
): Promise<Documents> {
  let fuzzlevel = should_fuzzy ? 3 : prefix ? 2 : 1

  const sort = []

  if (sortBy.length !== 0) {
    if (descending.length !== 0) {
      sort.push({
        [`${sortBy[0]}.keyword`]: descending[0] ? 'desc' : 'asc',
      })
    } else {
      sort.push(sortBy[0])
    }
  }

  finalQuery = getFinalQuery(searchAllMult, searchInd, fuzzlevel);

  const ds = (
    await axios(localEndpoint + '/es-query', {
      method: 'POST',
      data: {
        sort,
        from: (page - 1) * items,
        size: items,
        query: finalQuery,
      },
    })
  ).data

  return {
    documents: ds.hits.hits.map((h: any) => {
      return {
        ...h._source,
        id: h._id,
        ortsSigle: sigleFromEsRef(h._source.entry.ref),
      }
    }),
    total: ds.hits.total,
  }
}

export async function searchDocumentsFromES(place: string, sigle: boolean) {
  let ds
  if (sigle) {
    ds = (
      await axios(localEndpoint + '/es-query', {
        method: 'POST',
        data: {
          size: 5,
          query: {
            bool: {
              must: { term: { Sigle1: place } },
            },
          },
        },
      })
    ).data
  } else {
    ds = (
      await axios(localEndpoint + '/es-query', {
        method: 'POST',
        data: {
          size: 5,
          query: {
            bool: {
              should: [
                { match: { Bundesland1: place } },
                { match: { Großregion1: place } },
                { match: { Kleinregion1: place } },
                { match: { Gemeinde1: place } },
              ],
            },
          },
        },
      })
    ).data
  }

  return {
    documents: ds.hits.hits,
    total: ds.hits.total,
  }
}

/**
 * creating the nested search query based on 7 cases:
 * 1) null null
 * 2 + 3) individual null (fuzzy 1 | 3)
 * 4 + 5) null multiple (fuzzy 1 | 3)
 * 6 + 7) individual multiple (fuzzy 1 | 3)
 *
 * === fuzziness level 1 ===
 * search in individual columns is done with a 'wildcard' query
 * search in all the columns is done with a 'query_string' query and inner OR for multiple search values, each value is wrapped with a pre and post star *
 *
 * === fuzziness level 3 ===
 * search in individual columns is done with a 'fuzzy' query
 * search in all the columns is done with a 'multi_match' query
 *
 * Whole of the search queries are wrapped in one 'bool - must' query as an array
 * The inner structure includes:
 * (+) multiple 'bool - should' queries -> each represents a single / multiple search value(s) in the same column
 * AND
 * (+) multiple multi_match queries OR
 * (+) one query_string with an inner ' OR ' for multiple search values
 *
 * Besides the multi_match query:
 * For all of the search queries the round brackets () and '-' sign are filtered out
 * All search queries are lower-case
 *
 */
function getFinalQuery(
  searchAllMult: SearchRequest[] | null,
  searchInd: SearchRequest[] | null,
  fuzzlevel: number
): Object {
  let indvidualArr: individualRequest[] = []

  let mustArr: any[] = []

  // first case, drop down of all the values
  if (searchAllMult === null && searchInd === null) {
    return { match_all: {} }
  }

  let gramString = '';
  for (let i = 1; i < 10; i += 1) {
    gramString += `GRAM/LT${i},`;
  }

  let teuLT = '';
  for (let i = 1; i < 10; i += 1) {
    teuLT += `LT${i}_teuthonista,`;
  }

  let kotextString = '';
  for (let i = 1; i < 9; i += 1) {
    kotextString += `KT${i},`;
  }

  // handle the individual cols search
  if (searchInd !== null) {
    _(searchInd)
      .filter((f) => f.query !== null && f.query.trim() !== '')
      .groupBy('fields')
      .map((group, groupName) => {
        return {
          [groupName]: group.map((item) => item.query),
          groupName,
        }
      })
      .forEach((el) => {
        indvidualArr.push({ query: el[el.groupName], field: el.groupName })
      })

    indvidualArr.forEach((obj) => {
      let shouldArr: any[] = []
      let tmpFields: any[] = []

      if (obj.field === 'GRAM/LT1') {
        tmpFields = gramString.slice(0, gramString.length - 1).split(',');
      } else if (obj.field === 'LT1_teuthonista') {
        tmpFields = teuLT.slice(0, teuLT.length - 1).split(',');
      } else if (obj.field === 'BD/KT1') {
        tmpFields = kotextString.slice(0, kotextString.length - 1).split(',');
      } else {
        tmpFields.push(obj.field)
      }

      tmpFields.forEach((tmpField) => {

        if (tmpField === 'ID') tmpField = 'ID.keyword';

        if (Array.isArray(obj.query)) {
          // create a fuzzy query, add the designed queries under the boolean query 'should'
          if (fuzzlevel === 3) {
            obj.query.forEach((element) => {
              shouldArr.push({
                fuzzy: {
                  [tmpField]: {
                    term: !!element && (tmpField !== 'ID.keyword')
                      ? element.replace(/[\(]|[\)]|[-]/g, '').toLowerCase()
                      : element,
                    fuzziness: fuzzlevel,
                  },
                },
              })
            })
          }
          // create a wildcard query, add the designed queries under the boolean query 'should'
          else if (fuzzlevel === 1) {
            obj.query.forEach((element) => {
              shouldArr.push({
                wildcard: {
                  [tmpField]: {
                    value: !!element && (tmpField !== 'ID.keyword')
                      ? element.replace(/[\(]|[\)]|[-]/g, '').toLowerCase()
                      : element,
                  },
                },
              })
            })
          }
          // fuzzlevel is 2 and there is a prefix query search
          else {
            obj.query.forEach((element) => {
              shouldArr.push({
                prefix: {
                  [tmpField]: {
                    value: !!element && (tmpField !== 'ID.keyword')
                      ? element.replace(/[\(]|[\)]|[-]/g, '').toLowerCase()
                      : element,
                  },
                },
              })
            })
          }
          // handle non - array object, same scheme
        } else {
          if (fuzzlevel === 3) {
            shouldArr.push({
              fuzzy: {
                [tmpField]: {
                  term: tmpField !== 'ID.keyword' ? obj.query.replace(/[\(]|[\)]|[-]/g, '').toLowerCase() : obj.query,
                  fuzziness: fuzzlevel,
                },
              },
            })
          } else if (fuzzlevel === 1) {
            shouldArr.push({
              wildcard: {
                [tmpField]: {
                  value: tmpField !== 'ID.keyword' ? obj.query.replace(/[\(]|[\)]|[-]/g, '').toLowerCase() : obj.query,
                },
              },
            })
          } else {
            // fuzzlevel is 2
            shouldArr.push({
              prefix: {
                [tmpField]: {
                  value: tmpField !== 'ID.keyword' ? obj.query.replace(/[\(]|[\)]|[-]/g, '').toLowerCase() : obj.query,
                },
              },
            })
          }
        }
        // add the designed query under the boolean query 'should'
      })
      mustArr.push({ bool: { should: shouldArr } })
    })

    // if no multiple search field is needed, wrap up the should queries with one 'must' boolean query and return
    if (searchAllMult === null) {
      const finalQueryObj = {
        bool: {
          must: mustArr,
        },
      }

      return finalQueryObj
    }
  }


  // handle the multiple cols search
  if (searchAllMult !== null) {
    // Adding multi_match objects per search term
    if (searchAllMult[0].fields != null) {
      let searchFields = searchAllMult[0].fields.replace('GRAM/LT1,', gramString).replace('LT1_teuthonista,', teuLT).replace('BD/KT1,', kotextString).split(',');
      // create one or multiple multi_match queries, no need for filtering out any signs or to lower case the search term
      if (fuzzlevel === 3) {
        for (var i = 0; i < searchAllMult.length; i++) {
          mustArr.push({
            multi_match: {
              query: searchAllMult[i].query,
              fields: searchFields,
              fuzziness: fuzzlevel,
            },
          })
        }
        // create a query_string query
      } else {
        let searchStr =
          fuzzlevel === 1
            ? searchAllMult[0].query?.replace(/[\(]|[\)]|[-]/g, '')
            : searchAllMult[0].query?.replace(/[\(]|[\)]|[-]/g, '').concat('*')
        // if (fuzzlevel === 1) searchStr = '*' + searchStr;
        for (var i = 1; i < searchAllMult.length; i++) {
          if (searchAllMult[i].query !== null) {
            let localSearch = searchAllMult[i].query?.replace(
              /[\(]|[\)]|[-]/g,
              ''
            )
            searchStr =
              fuzzlevel === 1
                ? searchStr?.concat(
                  ' OR ',
                  localSearch !== undefined ? localSearch : 'NULL'
                )
                : searchStr?.concat(
                  ' OR ',
                  localSearch !== undefined ? localSearch : 'NULL',
                  '*'
                ) // we will never reach the 'NULL' assignment
          } else continue
        }
        mustArr.push({
          query_string: {
            query: searchStr,
            fields: searchFields,
          },
        })
      }
    }

    // wrap all the queries in the mustArr with a 'must' boolean request
    const allFieldsQuery = {
      bool: {
        must: mustArr,
      },
    }

    return allFieldsQuery
  }

  return {} // will never reach this state
}

export async function getDocumentsByCollection(
  ids: number[],
  page = 1,
  items = 100
): Promise<Documents> {
  const r = await (
    await fetch(
      apiEndpoint +
      `/documents/?${ids
        .map((id) => 'in_collections=' + id)
        .join('&')}&page_size=${items}&page=${page}`
    )
  ).json()
  const ds = await (
    await axios({
      url: localEndpoint + '/es-query',
      method: 'POST',
      data: {
        from: 0,
        size: items,
        query: {
          ids: {
            values: r.results.map((result: any) => result.es_id),
          },
        },
      },
    })
  ).data
  return {
    documents: ds.hits.hits.map((h: any) => {
      return {
        ...h._source,
        id: h._id,
        ortsSigle: sigleFromEsRef(h._source.entry.ref),
      }
    }),
    total: r.count,
  }
}

export interface Page {
  totalElements: Number,
  pageSize: Number,
  totalPages: Number,
  pageNr: Number,
  prev: string,
  next: string,
  first: string,
  last: string,
}

export interface Article{
  title: string,
  lemma: string,
  filename: string,
  status?: string,
  xmlUrl?: string,
  word_type?: Array<string>,
  compositum?: Array<string>,
  references?: ArticleReference[],
  retro?: [],
  main?: []
}

export interface ArticleReference {
  id: string,
  text: string}

export interface ExtendedArticle{
  article: Article,
  ort: string
}


export interface ArticlesResponse {
  articles: Array<Article>,
  page: Page,
  version: ArticleVersion
}

export async function getArticles(
  search?: string,
  filter?: string,
  pageSize?: Number,
  pageNr?: Number,
): Promise<ArticlesResponse> {
  const searchStatus = filter !== null && filter !== undefined ? filter : userStore.articleStatus.join(',');
  const req = articleEndpoint +
          '?initial=' + ((search && search != 'undefined') ? search : '') +
          (pageSize ? '&pageSize=' + pageSize : '') +
          (pageNr ? '&pageNr=' + pageNr : '') +
          '&status=' + searchStatus;

  if (search !== undefined) {
    const r = await (
      await fetch(req)
    ).json();

    const response: ArticlesResponse = {
      articles: r.results ?
                  r.results.length ?
                    r.results
                    : [r.results]
                  : [],
      page: r.page,
      version: r.version
    }
    return response;
  } else {
    const r = await (
      await fetch(
        articleEndpoint + '?status=' + searchStatus  +
        (pageSize ? '&pageSize=' + pageSize : '') +
        (pageNr ? '&pageNr=' + pageNr : '')
      )
    ).json()

    const response: ArticlesResponse = {
      articles: r.results ?
                  r.results.length ?
                    r.results
                    : [r.results]
                  : [],
      page: r.page,
      version: r.version
    }
    return response;
  }
}

export interface ArticleVersion {
  version: {
    sw: String,
    data: String,
  }
}

export async function getArticlesVersion() : Promise<ArticleVersion> {
  return await (await fetch(articleEndpoint + '-version')).json();
}

export async function getArticleByFileName(fileName: string): Promise<string> {
  console.log('getArticleByFileName', encodeURIComponent(fileName))
  // const r = await (await fetch(articleEndpoint + '/' + fileName)).text()
  const r = await (await fetch(articleEndpoint + '/' + encodeURIComponent(fileName))).text()
  return r
}
