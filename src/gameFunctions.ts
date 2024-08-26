import { Card, ScoreCard } from './Types';

export function getRandomIndexFromArray(list: Array<Card>) {
  return Math.floor((Math.random()*list.length));
}

export function getGameResults(finalScorecard: ScoreCard, currentPot: number) {
  switch(true) {
    case finalScorecard.user > 21:
      return {
        cssClass: 'lose-header',
        headerText: 'LOSE!',
        resultDetails: 'Player busts!',
        payout: 0,
      };
    case finalScorecard.dealer > 21:
      return {
        cssClass: 'win-header',
        headerText: 'WIN!',
        resultDetails: 'Dealer busts. Player wins!',
        payout: currentPot * 2,
      };
    case finalScorecard.user > finalScorecard.dealer:
      return {
        cssClass: 'win-header',
        headerText: 'WIN!',
        resultDetails: "Player's hand wins!",
        payout: currentPot * 2,
      };
    case finalScorecard.dealer > finalScorecard.user:
      return {
        cssClass: 'lose-header',
        headerText: 'LOSE!',
        resultDetails: "Dealer's hand wins.",
        payout: 0,
      };
    case finalScorecard.dealer === finalScorecard.user:
      return {
        cssClass: 'push-header',
        headerText: 'PUSH!',
        resultDetails: "Take yer money back!",
        payout: currentPot,
      };
  }
}

export function calculateScoreFromHand(hand: Card[]) {
  const aceCards: Card[] = hand.filter(card => card.value === 'A' && !card.isFaceDown);
  let score = 0;

  // Remove ace cards from hand so we can use logic later:
  if (aceCards.length) {
    hand = hand.filter(card => card.value !== 'A');
  }

  // Count non-ace cards first,
  // and do NOT count score for any facedown cards:
  hand.forEach(card => {
    if (!card.isFaceDown) {
      if (typeof card.value !== 'string') {
        score += card.value;
      } else {
        score += 10;
      }
    }
  });

  // If the hand has any Ace cards,
  // logic needs to be performed:
  if (aceCards.length) {
    const numOfAces: number = aceCards.length;

    if (score + (numOfAces * 11) <= 21) {
      // If all Aces can be 11 without busting, just do that:
      return score + (numOfAces * 11);
    } else if (numOfAces > 1 && (score + ((numOfAces - 1) * 11) + 1 <= 21)) {
      // If there are 2 or 3 Aces in the hand, and having them all at value = 11
      // makes the player bust, check if the player can handle not busting when
      // all but ONE Ace card has value = 11:
      return score + ((numOfAces - 1) * 11) + 1;
    } else {
      // Otherwise, just make em all 1 lol:
      return score + (numOfAces * 1);
    }
  }

  return score;
}

export function renderSuitSymbolUTF(suit: string) {
  switch (true) {
    case suit === 'HEARTS':
      return '♥';
    case suit === 'CLUBS':
      return '♠';
    case suit === 'SPADES':
      return '♣';
    case suit === 'DIAMONDS':
      return '♦';
  }
}