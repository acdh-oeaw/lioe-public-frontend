
export type ArticleStatus = 'unfinished'|
  'draft'|
  'proofed'|
  'cleared'|
  'in progress'|
  'peer correction'|
  'internal correction'|
  'external correction'|
  'finished'|
  'retro'|
  ''

export interface UserStore {
  showPdfPrintButton: boolean
  isLoggedIn: boolean
  showComment: boolean
  articleStatus: ArticleStatus[]
}

export const userStore: UserStore = {
  showPdfPrintButton: false,
  isLoggedIn: false,
  showComment: false,
  // articleStatus: []
<<<<<<< HEAD
  articleStatus: [ 'proofed', 'finished', 'retro' ]
=======
  articleStatus: [ 'proofed', 'finished' ]
>>>>>>> 17eb4cbe9ac3e52d349558f30a1ea6d8ade6da25
}
