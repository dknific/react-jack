import { useState } from 'react';
import { Card, ScoreCard } from './Types';
import { cardDeck } from './CardDeck';

// *** BLACKJACK RULES & PROCESS! ***
// ----------------------------------
// 1) Player receives 1 face up card
// 2) Dealer gives themself 1 face up card
// 3) Player gets 1 face up card
// 4) Dealer gives themself 1 DOWN-facing card
// 5) If player did not BUST, they can choose to hit or stand
// 6) Dealer reveals facedown card
// 7) If dealer score is less than 17, they keep giving themself cards

const EMPTY_SCORECARD: ScoreCard = {
  user: 0,
  dealer: 0
};

function renderCardSuit(suit: string) {
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

function getRandomIndexFromArray(list: Array<Card>) {
  return Math.floor((Math.random()*list.length));
}

function calculateVisibleDealerScore(dealersHand: Card[]) {
  let visibleScore = 0;
  dealersHand.forEach(card => {
    if (!card.isFaceDown && typeof card.value !== 'string') {
      visibleScore += card.value;
    } else if (!card.isFaceDown) {
      visibleScore += 10;
    }
  });
  return visibleScore;
}

function App() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [scoreCard, setScoreCard] = useState<ScoreCard>(EMPTY_SCORECARD);
  const [playersHand, setPlayersHand] = useState<Card[]>([]);
  const [dealersHand, setDealersHand] = useState<Card[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  function handleGameStart() {
    const playerHand: Card[] = [];
    const dealerHand: Card[] = [];
    let updatedDeck: Card[] = [...cardDeck];
    let playerScore: number = 0;
    let dealerScore: number = 0;

    for (let i = 1; i < 5; i++) {
      const randIndex: number = getRandomIndexFromArray(updatedDeck);
      const card: Card = updatedDeck[randIndex];
      const scoreToAdd = typeof card.value === 'string' ? 10 : card.value;
      const newDeck: Card[] = updatedDeck.filter(crd => crd !== card);
      updatedDeck = newDeck;

      if (i == 1 || i == 3) {
        card.isFaceDown = false;

        playerHand.push(card);
        playerScore += scoreToAdd;
      } else if (i == 4) {
        card.isFaceDown = true;
        dealerHand.push(card);
        dealerScore += scoreToAdd;
      } else if (i == 2) {
        card.isFaceDown = false;
        dealerHand.push(card);
        dealerScore += scoreToAdd;
      }
    }
    
    setDeck(updatedDeck);
    setPlayersHand(playerHand);
    setDealersHand(dealerHand);
    setScoreCard({ user: playerScore, dealer: calculateVisibleDealerScore(dealerHand) });
  }

  function handleResetGame() {
    document.getElementsByClassName('button-holder')[0].classList.remove('is-standing');
    setScoreCard(EMPTY_SCORECARD);
    setPlayersHand([]);
    setDealersHand([]);
    setIsGameOver(false);

    setTimeout(() => handleGameStart(), 500);
  }


  function handleDealToPlayer() {
    const randIndex: number = getRandomIndexFromArray(deck);
    const pulledCard: Card = deck[randIndex];
    pulledCard.isFaceDown = false;
    const updatedDeck: Card[] = deck.filter(card => card !== pulledCard);
    const scoreToAdd: number = typeof pulledCard.value === 'string'
      ? 10
      : pulledCard.value;
    
    const newPlayerHand: Card[] = [...playersHand];
    newPlayerHand.push(pulledCard);

    const newPlayerScore: number = scoreCard.user += scoreToAdd;
    setPlayersHand(newPlayerHand);
    setDeck(updatedDeck);
    setScoreCard({ ...scoreCard, user: newPlayerScore });

    if (newPlayerScore > 21) {
      setTimeout(() => setIsGameOver(true), 400);
    } else if (newPlayerScore == 21) {
      handleStandBtn();
    }
  }

  function handleDealToDealer(currentHand: Card[]) {
    const randIndex: number = getRandomIndexFromArray(deck);
    const pulledCard: Card = deck[randIndex];
    pulledCard.isFaceDown = false;
    const updatedDeck: Card[] = deck.filter(card => card !== pulledCard);

    const newDealerHand: Card[] = [...currentHand];
    newDealerHand.push(pulledCard);
    let newDealerScore: number = calculateVisibleDealerScore(newDealerHand);

    setDealersHand(newDealerHand);
    setDeck(updatedDeck);
    setScoreCard({ ...scoreCard, dealer: newDealerScore });

    return newDealerHand;
  }

  function handleStandBtn() {
    document.getElementsByClassName('button-holder')[0].classList.add('is-standing');
    let updatedDealerHand: Card[] = dealersHand.map(card => {
      const newCard: Card = { ...card, isFaceDown: false };
      return newCard;
    });
    let newDealerScore: number = calculateVisibleDealerScore(updatedDealerHand);
    
    // Pause for a sec before revealing dealers card:
    setTimeout(() => {
      setDealersHand(updatedDealerHand);
      setScoreCard({ ...scoreCard, dealer: newDealerScore });

      // Keep dealing until dealer score is 17 or greater:
      if (newDealerScore < 17) {
        const myInterval = setInterval(() => {
          const newHand: Card[] = handleDealToDealer(updatedDealerHand);
          updatedDealerHand = newHand;
          newDealerScore = calculateVisibleDealerScore(updatedDealerHand);

          // When score hits 17 or greater, pause for sec then clear Interval:
          if (newDealerScore >= 17) {
            setTimeout(() => {
              setIsGameOver(true);
              clearInterval(myInterval);
            }, 400);
            
          } 
        }, 600);
      } else {
        setTimeout(() => {
          setIsGameOver(true);
        }, 500);
      }
    }, 500);
  }

  function evaluateScore() {
    switch(true) {
      case scoreCard.user > 21:
        return 'YOU LOSE!';
      case scoreCard.dealer > 21:
        return 'YOU WIN!';
      case scoreCard.user > scoreCard.dealer:
        return 'YOU WIN!';
      case scoreCard.dealer > scoreCard.user:
        return 'YOU LOSE!';
      case scoreCard.dealer === scoreCard.user:
        return "Push!";
    }
  }

  function evaluateResultDetails() {
    switch(true) {
      case scoreCard.user > 21:
        return 'Player busts!';
      case scoreCard.dealer > 21:
        return 'Dealer busts.';
      case scoreCard.user > scoreCard.dealer:
        return "Player's hand wins.";
      case scoreCard.dealer > scoreCard.user:
        return "The dealer's hand wins.";
      case scoreCard.dealer === scoreCard.user:
        return "I got news for ya... that means ya gay!";
    }
  }

  return (
    <>
      <>
        {deck.length == 0 ? (
          <>
            <div className='home-screen-container'>
              <div className='home-text'>
                <h1>ReactJack.ts</h1>
                <h2>Blackjack made in React</h2>
              </div>
              <button onClick={() => handleGameStart()}>New Game</button>
            </div>
          </>
        ) : (
          <>
            {isGameOver && (
              <div className="game-over-screen">
                <div className="game-over-modal">
                  <h3>{evaluateScore()}</h3>
                  <p>{evaluateResultDetails()}</p>
                  <button onClick={() => handleResetGame()}>New Game</button>
                </div>
              </div>
            )}
            <div className='dealer-ui'>
              {scoreCard.dealer > 0 && (
                <p className={`player-score ${scoreCard.dealer > 21 ? 'bust' : ''}`}>{scoreCard.dealer}</p>
              )}
              <div className="dealers-hand">
                {dealersHand.map((crd, index) => {
                  return crd.isFaceDown
                    ? <div className='bicycle-card face-down-card' key={index}>
                        <div className='card-box'>⚛</div>
                      </div>
                    : (
                      <div
                        className={
                          `bicycle-card ${(crd.suit === 'HEARTS' || crd.suit === 'DIAMONDS') ? 'is-red' : ''}`
                        }
                        key={index}
                      >
                        <p className='card-val'>{crd.value}</p>
                        <p className='card-suit'>{renderCardSuit(crd.suit)}</p>
                        <p className='card-val upside-down'>{crd.value}</p>
                      </div>
                    )
                })}
              </div>
            </div>
            <div className="player-ui">
            {scoreCard.dealer > 0 && (
              <p className={`player-score ${scoreCard.user > 21 ? 'bust' : ''}`}>{scoreCard.user}</p>
            )}
              <div className="players-hand">
                {playersHand.map((crd, index) => (
                  <div
                    className={
                      `bicycle-card ${(crd.suit === 'HEARTS' || crd.suit === 'DIAMONDS') ? 'is-red' : ''}`
                    }
                    key={index}
                  >
                    <p className='card-val'>{crd.value}</p>
                    <p className='card-suit'>{renderCardSuit(crd.suit)}</p>
                    <p className='card-val upside-down'>{crd.value}</p>
                  </div>
                ))}
              </div>
              <div className='button-holder'>
                <button className='stand-button' onClick={() => handleStandBtn()}>Stand</button>
                <button
                  className='hit-button'
                  disabled={scoreCard.user >= 21}
                  onClick={() => handleDealToPlayer()}
                >
                  Hit
                </button>
              </div>
            </div>
          </>
        )}
      </>
    </>
  )
}

export default App
