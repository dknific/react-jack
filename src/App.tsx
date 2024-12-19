import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import PlaceBetScreen from './screens/PlaceBetScreen';
import GamePlayScreen from './screens/GamePlayScreen';
import { Card, FinalGameState, ScoreCard } from './util/Types';
import { cardDeck } from './util/CardDeck';
import {
  BLANK_FGS_OBJECT,
  calculateFinalGameState,
  calculateScoreFromHand,
  getEarlyGameEndResults,
  getRandomIndexFromArray,
  SCREENS
} from './util/gameMethods';

function App() {
  const [currentPot, setCurrentPot] = useState(0);
  const [currentScreen, setCurrentScreen] = useState(SCREENS.welcome);
  const [dealersHand, setDealersHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [finalGameState, setFinalGameState] = useState<FinalGameState>({ ...BLANK_FGS_OBJECT });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlayersTurn, setIsPlayersTurn] = useState(true);
  const [playersHand, setPlayersHand] = useState<Card[]>([]);
  const [proposedBet, setProposedBet] = useState(0);
  const [scoreCard, setScoreCard] = useState<ScoreCard>({ user: 0, dealer: 0 });
  const [userCoins, setUserCoins] = useState(100);

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
      setCurrentScreen(SCREENS.gameplay);
    }, 1400);
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

    if (newPlayerHand.length == 5 && newPlayerScore <= 21) {
      setIsPlayersTurn(false);
      const earlyResults: FinalGameState = {
        cssClass: 'win-header',
        gameOverMessage: 'WIN!',
        gameOverDetails: 'Five Card Charlie!. Player wins.',
        coinPayout: currentPot * 2,
        finalDeck: updatedDeck,
        finalDealerHand: dealersHand,
        finalPlayerHand: newPlayerHand,
        finalScoreCard: { ...scoreCard, user: newPlayerScore }
      };

      setTimeout(() => {
        setFinalGameState(earlyResults);
        setIsGameOver(true);
        setUserCoins(userCoins + earlyResults.coinPayout!);
        setDeck(earlyResults.finalDeck!);
        setDealersHand(earlyResults.finalDealerHand!);
        setScoreCard(earlyResults.finalScoreCard!);
      }, 600);
    } else if (newPlayerScore > 21) {
      setIsPlayersTurn(false);
      const finalResults: FinalGameState = {
        finalDeck: updatedDeck,
        finalDealerHand: dealersHand,
        finalPlayerHand: newPlayerHand,
        finalScoreCard: { ...scoreCard, user: newPlayerScore }
      };
      const earlyResults: FinalGameState = getEarlyGameEndResults(finalResults.finalScoreCard!, currentPot);
      finalResults.cssClass = earlyResults.cssClass,
      finalResults.gameOverMessage = earlyResults.gameOverMessage,
      finalResults.gameOverDetails = earlyResults.gameOverDetails,
      finalResults.coinPayout = earlyResults.coinPayout

      setTimeout(() => {
        setFinalGameState(finalResults);
        setIsGameOver(true);
        setUserCoins(userCoins + finalResults.coinPayout!);
        setDeck(finalResults.finalDeck!);
        setDealersHand(finalResults.finalDealerHand!);
        setScoreCard(finalResults.finalScoreCard!);
      }, 600);
    }
  }

  function handlePlayAgainButton() {
    setScoreCard({ user: 0, dealer: 0 });
    setPlayersHand([]);
    setDealersHand([]);
    setIsGameOver(false);
    setFinalGameState({ ...BLANK_FGS_OBJECT });
    setCurrentScreen(SCREENS.placeBet);
    setIsPlayersTurn(true);
    setProposedBet(0);
  }

  function handleStandButton() {
    setIsPlayersTurn(false);
    setTimeout(() => { handleDealersTurn() }, 600);
  }

  function handleDealersTurn() {
    const finalGameState: FinalGameState = calculateFinalGameState(
      currentPot,
      deck,
      dealersHand,
      playersHand
    );

    setTimeout(() => {
      const revealedDealersHand: Card[] = [...dealersHand];
      revealedDealersHand[1].isFaceDown = false;

      setDealersHand(revealedDealersHand);
      setScoreCard({ user: scoreCard.user, dealer: calculateScoreFromHand(revealedDealersHand) });

      if (finalGameState.finalDealerHand!.length === revealedDealersHand.length) {
        setTimeout(() => {
          setIsGameOver(true);
          setFinalGameState(finalGameState);
          setUserCoins(userCoins + finalGameState.coinPayout!);
          setDeck(finalGameState.finalDeck!);
          setDealersHand(finalGameState.finalDealerHand!);
          setScoreCard(finalGameState.finalScoreCard!);
        }, 500);
        return;
      } else {
        setTimeout(() => {
          let numberOfCardsLeftToReveal: number = finalGameState.finalDealerHand!.length - dealersHand.length;
          // if number of cards left is not 1,
          // push the next "card to reveal" into dealers hand
          // and set a time out
          if (numberOfCardsLeftToReveal > 1) {
            const newDealersHand: Card[] = [...dealersHand];
            let cardToPush: Card = finalGameState.finalDealerHand![finalGameState.finalDealerHand!.length - numberOfCardsLeftToReveal];
            newDealersHand.push(cardToPush);
            setDealersHand(newDealersHand);
            setScoreCard({ user: scoreCard.user, dealer: calculateScoreFromHand(newDealersHand) });

            setTimeout(() => {
              const dealHand: Card[] = [...newDealersHand];
              cardToPush = finalGameState.finalDealerHand![finalGameState.finalDealerHand!.length - numberOfCardsLeftToReveal];
              dealHand.push(cardToPush);
              setDealersHand(dealHand);
              setScoreCard({ user: scoreCard.user, dealer: calculateScoreFromHand(dealHand) });

              numberOfCardsLeftToReveal = finalGameState.finalDealerHand!.length - dealHand.length;

              if (numberOfCardsLeftToReveal >= 1) {
                const updatedDealerHand: Card[] = [...dealHand];
                cardToPush = finalGameState.finalDealerHand![finalGameState.finalDealerHand!.length - numberOfCardsLeftToReveal];
                updatedDealerHand.push(cardToPush);
                setDealersHand(updatedDealerHand);
                setScoreCard({ user: calculateScoreFromHand(playersHand), dealer: calculateScoreFromHand(updatedDealerHand) });

                setTimeout(() => {
                  setIsGameOver(true);
                  setFinalGameState(finalGameState);
                  setUserCoins(userCoins + finalGameState.coinPayout!);
                  setDeck(finalGameState.finalDeck!);
                  setDealersHand(finalGameState.finalDealerHand!);
                  setScoreCard(finalGameState.finalScoreCard!);
                }, 400);
              } else {
                setTimeout(() => {
                  setIsGameOver(true);
                  setFinalGameState(finalGameState);
                  setUserCoins(userCoins + finalGameState.coinPayout!);
                  setDeck(finalGameState.finalDeck!);
                  setDealersHand(finalGameState.finalDealerHand!);
                  setScoreCard(finalGameState.finalScoreCard!);
                }, 400);
              }
            }, 300);
          } else { // game done
            setDealersHand(finalGameState.finalDealerHand!);
            setScoreCard(finalGameState.finalScoreCard!);
            setTimeout(() => {
              setIsGameOver(true);
              setFinalGameState(finalGameState);
              setUserCoins(userCoins + finalGameState.coinPayout!);
              setDeck(finalGameState.finalDeck!);
            }, 300);
          }
        }, 300);
      }
    }, 300);
  }

  function placeFinalBet() {
    setUserCoins(userCoins - proposedBet);
    setCurrentPot(proposedBet);
    setCurrentScreen(SCREENS.openingDeal);
    dealOpeningCards();
  }

  return (
    <>
      {currentScreen === SCREENS.welcome && (
        <HomeScreen handleWelcomeButton={() => setCurrentScreen(SCREENS.placeBet)} />
      )}

      {currentScreen === SCREENS.placeBet && (
        <PlaceBetScreen
          proposedBet={proposedBet}
          placeFinalBet={placeFinalBet}
          setProposedBet={setProposedBet}
          userCoins={userCoins}
        />
      )}

      {(currentScreen === SCREENS.gameplay || currentScreen === SCREENS.openingDeal) && (
        <GamePlayScreen
          currentPot={currentPot}
          currentScreen={currentScreen}
          dealersHand={dealersHand}
          finalGameState={finalGameState}
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
