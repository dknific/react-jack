export type Card = {
  suit: string,
  value: string | number,
  isFaceDown: boolean,
};

export type ScoreCard = {
  user: number,
  dealer: number
};

export type GameResult = {
  status?: string,
  class?: string,
  details?: string
}

export type GameResults = {
  cssClass?: string,
  headerText?: string,
  resultDetails?: string,
  payout?: number,
}

export type FinalCards = {
  finalDeck: Card[],
  finalScoreCard: ScoreCard,
  finalDealerHand: Card[],
  finalPlayerHand: Card[]
}