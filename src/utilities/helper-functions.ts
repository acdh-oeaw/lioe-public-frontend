
export function fileLinkFromXMLUrl(xmlUrl?: string) :string {
  const articlesHelperString = '/articles/';

  if(!xmlUrl) return '';

  return xmlUrl.substring(xmlUrl.lastIndexOf(articlesHelperString) + articlesHelperString.length, xmlUrl.length).replace('.xml', '');
}

//potential Improvement: Levenshtein
export function sortByTerm(data: string[], term: any) {
  return data.sort(function (a: any, b: any) {
    return a.toLowerCase().indexOf(term) <
      b.toLowerCase().indexOf(term)
      ? -1
      : 1;
  });
}

const localStorageKeyPrefix = 'lioe-public-frontend';

export function safeToLocalStorage<Type>(key: string, value: Type) {
  if(!key) {
    return;
  }
  if(value === undefined || value === null) {
    window.localStorage.removeItem(localStorageKeyPrefix + key);
    return;
  }
  window.localStorage.setItem(localStorageKeyPrefix + key, JSON.stringify(value));
}

export function loadFromLocalStorage<Type>(key: string) : Type | undefined {
  let value: any = window.localStorage.getItem(localStorageKeyPrefix + key);
  if(value) {
    return JSON.parse(value);
  }
  return undefined;
}
