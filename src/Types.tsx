export type Card = {
  suit: string,
  value: string | number,
  isFaceDown: boolean,
};

export type ScoreCard = {
  user: number,
  dealer: number
};