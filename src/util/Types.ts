export type Card = {
  suit: string,
  value: string | number,
  isFaceDown: boolean,
};

export type ScoreCard = {
  user: number,
  dealer: number
};

export type FinalGameState = {
  finalDeck?: Card[],
  finalScoreCard?: ScoreCard,
  finalDealerHand?: Card[],
  finalPlayerHand?: Card[],
  cssClass?: string,
  gameOverMessage?: string,
  gameOverDetails?: string,
  coinPayout?: number,
}
