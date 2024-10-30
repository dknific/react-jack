import { Card, ScoreCard } from '../util/Types';

export function getRandomIndexFromArray(list: Array<Card>) {
  return Math.floor((Math.random()*list.length));
}

export function getTextResults(finalScorecard: ScoreCard, currentPot: number) {
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
    default:
      return {
        cssClass: 'push-header',
        headerText: 'PUSH!',
        resultDetails: "Take yer money back!",
        payout: currentPot,
      };
  }
}

/*
  How to Calculate a Hand in Blackjack:
  1. Set aside Ace cards, since they require special logic.
  2. Add up the score of all non-ace cards that are faceup.
  3. For each Ace card in the hand, determine if its a 1 or an 11.

  Aces - How to Determine Their Value:
  1. Condition A: Runs first every time:
      Set all Aces in hand to 11 and add it to the score.
      If the result is less than or equal to 21, that's the score.
  2. Condition B: Runs only if there are 2 or more Aces in the hand:
      What happens if all but one of the Aces are set to 11?
      If the result is less than or equal to 21, that's the score.
  3. Condition C: Runs only if there are 3 Aces in hand:
      What happens if you add 13? (An eleven and two ones)
  4. Condition D: If none of the above conditions are met:
      All Aces are set to a value of 1 and added to the score.
*/

export function calculateScoreFromHand(hand: Card[]) {
  let score = 0;

  const aceCards: Card[] = hand.filter(
    card => card.value === "A" && !card.isFaceDown,
  );
  if (aceCards.length) {
    hand = hand.filter(card => card.value !== "A");
  }

  hand.forEach(card => {
    if (!card.isFaceDown) {
      if (typeof card.value !== 'string') {
        score += card.value;
      } else {
        score += 10;
      }
    }
  });

  // Logic for Ace cards:
  if (aceCards.length) {
    const numOfAces: number = aceCards.length;

    if ((numOfAces * 11) + score <= 21) {
      return score + (numOfAces * 11);
    } else if (numOfAces >= 2) {
      if (((numOfAces - 1) * 11) + 1 <= 21) {
        return score + ((numOfAces - 1) * 11) + 1;
      }

      if (numOfAces === 3) {
        if (score + 13 < 21) {
          return score + 13;
        }
      }
    } else {
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