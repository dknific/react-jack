export type Card = {
  suit: string,
  value: string | number,
  isFaceDown: boolean,
};

export type ScoreCard = {
  user: number,
  dealer: number
};

export type GameResults = {
  finalDeck?: Card[],
  finalScoreCard?: ScoreCard,
  finalDealerHand?: Card[],
  finalPlayerHand?: Card[],
  cssClass?: string,
  headerText?: string,
  resultDetails?: string,
  payout?: number,
}