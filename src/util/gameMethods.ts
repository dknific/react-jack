import { Card, FinalGameState, ScoreCard } from './Types';

 // Calculate and return the game results object for dealers turn:
export function calculateFinalGameState(currentPot: number, deck: Card[], dealersHand: Card[], playersHand: Card[]) {
  // Flip dealers first card and calculate, then proceed:
  let finalDealerHand: Card[] = dealersHand.map(card => {
    const newCard: Card = { ...card, isFaceDown: false };
    return newCard;
  });
  let dealerScore: number = calculateScoreFromHand(finalDealerHand);
  let finalDeck: Card[] = [...deck];

  while (dealerScore < 17) {
    const randIndex: number = getRandomIndexFromArray(finalDeck);
    const pulledCard: Card = finalDeck[randIndex];
    pulledCard.isFaceDown = false;

    finalDeck = finalDeck.filter(card => card !== pulledCard);
    finalDealerHand.push(pulledCard);
    dealerScore = calculateScoreFromHand(finalDealerHand);

    if (finalDealerHand.length === 5 && dealerScore <= 21) {
      break;
    }
  }

  const finalScoreCard: ScoreCard = { user: calculateScoreFromHand(playersHand), dealer: calculateScoreFromHand(finalDealerHand) };
  const finalGameState: FinalGameState = {
    finalDeck: finalDeck,
    finalDealerHand: finalDealerHand,
    finalPlayerHand: playersHand,
    finalScoreCard: finalScoreCard,
  };

  switch(true) {
    case finalDealerHand.length == 5 && finalScoreCard.dealer <= 21:
      finalGameState.cssClass = 'lose-header';
      finalGameState.gameOverMessage = 'LOSE!',
      finalGameState.gameOverDetails = 'Five Card Charlie!. Dealer wins.';
      finalGameState.coinPayout = 0;
      break;
    case finalScoreCard.user > 21:
      finalGameState.cssClass = 'lose-header';
      finalGameState.gameOverMessage = 'LOSE!';
      finalGameState.gameOverDetails = 'Player busts!';
      finalGameState.coinPayout = 0;
      break;
    case finalScoreCard.dealer > 21:
      finalGameState.cssClass = 'win-header';
      finalGameState.gameOverMessage = 'WIN!';
      finalGameState.gameOverDetails = 'Dealer busts. Player wins!';
      finalGameState.coinPayout = currentPot * 2;
      break;
    case finalScoreCard.user > finalScoreCard.dealer:
      finalGameState.cssClass = 'win-header';
      finalGameState.gameOverMessage = 'WIN!';
      finalGameState.gameOverDetails = "Player's hand wins!";
      finalGameState.coinPayout = currentPot * 2;
      break;
    case finalScoreCard.dealer > finalScoreCard.user:
      finalGameState.cssClass = 'lose-header';
      finalGameState.gameOverMessage = 'LOSE!';
      finalGameState.gameOverDetails = "Dealer's hand wins.";
      finalGameState.coinPayout = 0;
      break;
    default:
      finalGameState.cssClass = 'push-header';
      finalGameState.gameOverMessage = 'PUSH!';
      finalGameState.gameOverDetails = "Take yer money back!";
      finalGameState.coinPayout = currentPot;
      break;
  }

  return finalGameState;
}

export function getRandomIndexFromArray(list: Array<Card>) {
  return Math.floor((Math.random()*list.length));
}

export function getEarlyGameEndResults(finalScorecard: ScoreCard, currentPot: number) {
  switch(true) {
    case finalScorecard.user > 21:
      return {
        cssClass: 'lose-header',
        gameOverMessage: 'LOSE!',
        gameOverDetails: 'Player busts!',
        coinPayout: 0,
      };
    case finalScorecard.dealer > 21:
      return {
        cssClass: 'win-header',
        gameOverMessage: 'WIN!',
        gameOverDetails: 'Dealer busts. Player wins!',
        coinPayout: currentPot * 2,
      };
    case finalScorecard.user > finalScorecard.dealer:
      return {
        cssClass: 'win-header',
        gameOverMessage: 'WIN!',
        gameOverDetails: "Player's hand wins!",
        coinPayout: currentPot * 2,
      };
    case finalScorecard.dealer > finalScorecard.user:
      return {
        cssClass: 'lose-header',
        gameOverMessage: 'LOSE!',
        gameOverDetails: "Dealer's hand wins.",
        coinPayout: 0,
      };
    default:
      return {
        cssClass: 'push-header',
        gameOverMessage: 'PUSH!',
        gameOverDetails: "Take yer money back!",
        coinPayout: currentPot,
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

export function evaluateCssClassForPlayerCard(cardIndex: number, numOfCardsInHand: number) {
  if (numOfCardsInHand === 5) {
    return `player${cardIndex + 1} five-card-position`
  } else if (numOfCardsInHand === 4) {
    return `player${cardIndex + 1} four-card-position`
  } else if (numOfCardsInHand === 3) {
    return `player${cardIndex + 1} three-card-position`
  } else if (numOfCardsInHand === 2) {
    return `player${cardIndex + 1}`;
  }
}

export function evaluateCssClassForDealerCard(cardIndex: number, numOfCardsInHand: number) {
  if (numOfCardsInHand === 5) {
    return `dealer${cardIndex + 1} five-card-position`
  } else if (numOfCardsInHand === 4) {
    return `dealer${cardIndex + 1} four-card-position`
  } else if (numOfCardsInHand === 3) {
    return `dealer${cardIndex + 1} three-card-position`
  } else if (numOfCardsInHand === 2) {
    return `dealer${cardIndex + 1}`;
  }
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

export const BLANK_FGS_OBJECT: FinalGameState = {
  finalDeck: undefined,
  finalScoreCard: undefined,
  finalDealerHand: undefined,
  finalPlayerHand: undefined,
  cssClass: undefined,
  gameOverMessage: undefined,
  gameOverDetails: undefined,
  coinPayout: undefined,
};

export const SCREENS = {
  gameplay: 'IS_PLAYING_GAME',
  openingDeal: 'IS_DEALING_INITIAL_CARDS',
  placeBet: 'PLACE_BET',
  welcome: 'WELCOME'
};