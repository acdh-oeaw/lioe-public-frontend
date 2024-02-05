type BaseResult = {
  text: string,
  value: string,
  description: string
}
export type CollectionResult = BaseResult & {
  type: 'collection',
}
export type ArticleResult = BaseResult & {
  type: 'article'
}
export type PlaceResult = BaseResult & {
  type: 'place'
}

export type IndexResultItem = CollectionResult | ArticleResult | PlaceResult;

export type IndexResultItemType = IndexResultItem['type'];

type IndexSearchTypesDictionary = {
  [K in IndexResultItemType]: string;
};

export const indexSearchTypesDictionary: IndexSearchTypesDictionary = {
  article: "→ Belege in Datenbank anzeigen",
  collection: "→ Sammlung auf Karte anzeigen",
  place: "Ort auf Karte anzeigen",
} as const;
