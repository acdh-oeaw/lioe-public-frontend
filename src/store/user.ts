
type ArticleStatus = 'unfinished'|
  'draft'|
  'proofed'|
  'cleared'|
  'in progress'|
  'peer correction'|
  'internal correction'|
  'external correction'|
  'finished'|
  ''

interface UserStore {
  showPdfPrintButton: boolean
  isLoggedIn: boolean
  showComment: boolean
  articleStatus: ArticleStatus[]
}

export const userStore: UserStore = {
  showPdfPrintButton: false,
  isLoggedIn: false,
  showComment: false,
  articleStatus: [ 'proofed', 'finished' ]
}
