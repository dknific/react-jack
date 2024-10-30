import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import PlaceBetScreen from './screens/PlaceBetScreen';
import GamePlayScreen from './screens/GamePlayScreen';
import { Card, GameResults, ScoreCard } from './util/Types';
import { cardDeck } from './util/CardDeck';
import {
  calculateScoreFromHand,
  getTextResults,
  getRandomIndexFromArray,
} from './util/gameFunctions';

function App() {
  const [currentPot, setCurrentPot] = useState(0);
  const [currentScreen, setCurrentScreen] = useState('WELCOME');
  const [dealersHand, setDealersHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameResult, setGameResult] = useState<GameResults>({
    cssClass: undefined, headerText: undefined, resultDetails: undefined, payout: undefined
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlayersTurn, setIsPlayersTurn] = useState(true);
  const [playersHand, setPlayersHand] = useState<Card[]>([]);
  const [proposedBet, setProposedBet] = useState(0);
  const [scoreCard, setScoreCard] = useState<ScoreCard>({ user: 0, dealer: 0 });
  const [userCoins, setUserCoins] = useState(100);

  function beginDealersTurn() {
    // Immediately evaluate the end result, but don't show player:
    const finalGameResults: GameResults = calculateEndResultOfDealersTurn();
    setGameResult(finalGameResults);
    setIsGameOver(true);
    setUserCoins(userCoins + finalGameResults.payout!);
    setDeck(finalGameResults.finalDeck!);
    setDealersHand(finalGameResults.finalDealerHand!);
    setScoreCard(finalGameResults.finalScoreCard!);
  }

  // Calculate and return the game results object for dealers turn:
  function calculateEndResultOfDealersTurn() {
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
    }

    const finalScoreCard: ScoreCard = { user: calculateScoreFromHand(playersHand), dealer: calculateScoreFromHand(finalDealerHand) };
    const missingResultsLol: GameResults = getTextResults(finalScoreCard, currentPot);
    const temp: GameResults = {
      finalDeck: finalDeck,
      finalDealerHand: finalDealerHand,
      finalPlayerHand: playersHand,
      finalScoreCard: finalScoreCard,
      cssClass: missingResultsLol.cssClass,
      headerText: missingResultsLol.headerText,
      resultDetails: missingResultsLol.resultDetails,
      payout: missingResultsLol.payout
    };

    return temp;
  }

  function dealOpeningCards() {
    const playersStartingHand: Card[] = [];
    const dealersStartingHand: Card[] = [];
    let updatedDeck: Card[] = [...cardDeck];

    // Deal 2 cards each to player and dealer, alternating:
    for (let i = 0; i < 4; i++) {
      const randIndex: number = getRandomIndexFromArray(updatedDeck);
      const pulledCard: Card = updatedDeck[randIndex];
      const newDeck: Card[] = updatedDeck.filter(card => card !== pulledCard);
      updatedDeck = newDeck;

      if (i == 0 || i == 2) {
        // On turns 1 and 3 give User a faceup card:
        pulledCard.isFaceDown = false;
        playersStartingHand.push(pulledCard);
      } else if (i == 3) {
        // On turn 4 dealer gets a facedown card:
        pulledCard.isFaceDown = true;
        dealersStartingHand.push(pulledCard);
      } else if (i == 1) {
        pulledCard.isFaceDown = false;
        dealersStartingHand.push(pulledCard);
      }
    }

    setDeck(updatedDeck);
    setPlayersHand(playersStartingHand);
    setDealersHand(dealersStartingHand);
    setScoreCard({
      user: calculateScoreFromHand(playersStartingHand),
      dealer: calculateScoreFromHand(dealersStartingHand)
    });

    setTimeout(() => {
      const scoreDisplays: NodeListOf<HTMLParagraphElement> = document.querySelectorAll('.hidden-score');
      scoreDisplays.item(1).classList.remove('hidden-score');
      scoreDisplays.item(0).classList.remove('hidden-score');
      setCurrentScreen('PLAYING_GAME');
    }, 1400);
  }

  function evaluatePlayerAnimationClass(cardIndex: number) {
    if (playersHand.length === 4) {
      return `player${cardIndex + 1} four-card-position`
    } else if (playersHand.length === 3) {
      return `player${cardIndex + 1} three-card-position`
    } else if (playersHand.length === 2) {
      return `player${cardIndex + 1}`;
    }
  }

  function evaluateDealerAnimationClass(cardIndex: number) {
    if (dealersHand.length === 4) {
      return `dealer${cardIndex + 1} four-card-position`
    } else if (dealersHand.length === 3) {
      return `dealer${cardIndex + 1} three-card-position`
    } else if (dealersHand.length === 2) {
      return `dealer${cardIndex + 1}`;
    }
  }
  
  function handleHitButton() {
    const randIndex: number = getRandomIndexFromArray(deck);
    const pulledCard: Card = deck[randIndex];
    pulledCard.isFaceDown = false;
    const updatedDeck: Card[] = deck.filter(card => card !== pulledCard);
    const newPlayerHand: Card[] = [...playersHand];
    newPlayerHand.push(pulledCard);
    const newPlayerScore: number = calculateScoreFromHand(newPlayerHand);

    setPlayersHand(newPlayerHand);
    setDeck(updatedDeck);
    setScoreCard({ ...scoreCard, user: newPlayerScore });

    if (newPlayerScore > 21) {
      setIsPlayersTurn(false);
      const finalResults: GameResults = {
        finalDeck: updatedDeck,
        finalDealerHand: dealersHand,
        finalPlayerHand: newPlayerHand,
        finalScoreCard: { ...scoreCard, user: newPlayerScore }
      };
      const textResults: GameResults = getTextResults(finalResults.finalScoreCard!, currentPot);
      finalResults.cssClass = textResults.cssClass,
      finalResults.headerText = textResults.headerText,
      finalResults.resultDetails = textResults.resultDetails,
      finalResults.payout = textResults.payout

      setTimeout(() => {
        setGameResult(finalResults);
        setIsGameOver(true);
        setUserCoins(userCoins + finalResults.payout!);
        setDeck(finalResults.finalDeck!);
        setDealersHand(finalResults.finalDealerHand!);
        setScoreCard(finalResults.finalScoreCard!);
      }, 600);
      
    } else if (newPlayerScore == 21) {
      setIsPlayersTurn(false);
      setTimeout(() => beginDealersTurn(), 1000);
    }
  }

  function handlePlayAgainButton() {
    setScoreCard({ user: 0, dealer: 0 });
    setPlayersHand([]);
    setDealersHand([]);
    setIsGameOver(false);
    setGameResult({
      cssClass: undefined, headerText: undefined, resultDetails: undefined, payout: undefined
    });
    setCurrentScreen('PLACE_BET');
    setIsPlayersTurn(true);
    setProposedBet(0);
  }

  function handleStandButton() {
    setIsPlayersTurn(false);
    setTimeout(() => { beginDealersTurn() }, 600);
  }

  function handleWelcomeButton() {
    setCurrentScreen('PLACE_BET');
  }

  function placeFinalBet() {
    setUserCoins(userCoins - proposedBet);
    setCurrentPot(proposedBet);
    setCurrentScreen('PLAY_GAME_BEGIN_DEALING');

    dealOpeningCards();
  }

  return (
    <>
      {currentScreen === 'WELCOME' && (
        <HomeScreen handleWelcomeButton={handleWelcomeButton} />
      )}

      {currentScreen === 'PLACE_BET' && (
        <PlaceBetScreen
          proposedBet={proposedBet}
          placeFinalBet={placeFinalBet}
          setProposedBet={setProposedBet}
          userCoins={userCoins}
        />
      )}

      {((currentScreen === 'PLAY_GAME_BEGIN_DEALING') || (currentScreen === 'PLAYING_GAME')) && (
        <GamePlayScreen
          currentPot={currentPot}
          currentScreen={currentScreen}
          dealersHand={dealersHand}
          evaluateDealerAnimationClass={evaluateDealerAnimationClass}
          evaluatePlayerAnimationClass={evaluatePlayerAnimationClass}
          gameResult={gameResult}
          handleHitButton={handleHitButton}
          handlePlayAgainButton={handlePlayAgainButton}
          handleStandButton={handleStandButton}
          isGameOver={isGameOver}
          isPlayersTurn={isPlayersTurn}
          playersHand={playersHand}
          scoreCard={scoreCard}
          userCoins={userCoins}
        />
      )}
    </>
  )
}

export default App
