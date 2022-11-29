
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
