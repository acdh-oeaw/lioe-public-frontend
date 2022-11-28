
export function fileLinkFromXMLUrl(xmlUrl?: string) :string {
    const articlesHelperString = '/articles/';

    if(!xmlUrl) return '';

    return xmlUrl.substring(xmlUrl.lastIndexOf(articlesHelperString) + articlesHelperString.length, xmlUrl.length).replace('.xml', '');
  }