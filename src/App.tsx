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
  const [hasRevealed, setHasRevealed] = useState(false);

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

    setTimeout(() => {
      document.getElementsByClassName('bicycle-card')[2].classList.remove('is-hidden');
    }, 150);
    setTimeout(() => {
      document.getElementsByClassName('bicycle-card')[0].classList.remove('is-hidden');
    }, 400);
    setTimeout(() => {
      document.getElementsByClassName('bicycle-card')[3].classList.remove('is-hidden');
    }, 650);
    setTimeout(() => {
      document.getElementsByClassName('bicycle-card')[1].classList.remove('is-hidden');
    }, 900);
    setTimeout(() => {
      document.getElementsByClassName('player-score')[0].classList.remove('is-hidden');
      document.getElementsByClassName('player-score')[1].classList.remove('is-hidden');
      document.getElementsByClassName('dealer-chip')[0].classList.remove('is-dealers-turn');
      document.getElementsByClassName('player-chip')[0].classList.add('is-players-turn');
      document.getElementsByClassName('button-holder')[0].classList.remove('is-standing');
    }, 1250);
  }

  function handleResetGame() {
    setScoreCard(EMPTY_SCORECARD);
    setPlayersHand([]);
    setDealersHand([]);
    setIsGameOver(false);
    setHasRevealed(false);
    document.getElementsByClassName('button-holder')[0].classList.add('is-standing');
    document.getElementsByClassName('dealer-chip')[0].classList.add('is-dealers-turn');
    document.getElementsByClassName('player-chip')[0].classList.remove('is-players-turn');

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
    
    const newPlayerScore: number = scoreCard.user += scoreToAdd;
    const newPlayerHand: Card[] = [...playersHand];
    newPlayerHand.push(pulledCard);
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
    document.getElementsByClassName('dealer-chip')[0].classList.add('is-dealers-turn');
    document.getElementsByClassName('player-chip')[0].classList.remove('is-players-turn');
    let updatedDealerHand: Card[] = dealersHand.map(card => {
      const newCard: Card = { ...card, isFaceDown: false };
      return newCard;
    });
    let newDealerScore: number = calculateVisibleDealerScore(updatedDealerHand);

    // Pause for a sec before revealing dealers card:
    setTimeout(() => {
      setDealersHand(updatedDealerHand);
      setScoreCard({ ...scoreCard, dealer: newDealerScore });
      setHasRevealed(true);

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
        return 'LOSE!';
      case scoreCard.dealer > 21:
        return 'WIN!';
      case scoreCard.user > scoreCard.dealer:
        return 'WIN!';
      case scoreCard.dealer > scoreCard.user:
        return 'LOSE!';
      case scoreCard.dealer === scoreCard.user:
        return "PUSH!";
    }
  }

  function evaluateClassHeader() {
    switch(true) {
      case scoreCard.user > 21:
        return 'lose-header';
      case scoreCard.dealer > 21:
        return 'win-header';
      case scoreCard.user > scoreCard.dealer:
        return 'win-header';
      case scoreCard.dealer > scoreCard.user:
        return 'lose-header';
      case scoreCard.dealer === scoreCard.user:
        return "win-header";
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
        return "Well, wouldja look at THAT!";
    }
  }

  return (
    <>
      <>
        {deck.length == 0 ? (
          <>
            <div className='home-text'>
              <h1>ReactJack.ts</h1>
              <h2>Blackjack made in React</h2>
            </div>
            <button className='start-button' onClick={() => handleGameStart()}>New Game</button>
          </>
        ) : (
          <>
            {isGameOver && (
              <div className="game-over-screen">
                <div className="game-over-modal">
                  <h3 className={evaluateClassHeader()}>{evaluateScore()}</h3>
                  <p>{evaluateResultDetails()}</p>
                  <button className='new-game-button' onClick={() => handleResetGame()}>Play Again</button>
                </div>
              </div>
            )}
            <div className='dealer-ui'>
              <div className='dealer-chip is-dealers-turn'>DEALER</div>
              {scoreCard.dealer > 0 && (
                <p className={`player-score ${scoreCard.dealer > 21 ? 'bust' : ''} ${dealersHand.length > 2 ? '' : 'is-hidden'}`}>{scoreCard.dealer}</p>
              )}
              <div className="dealers-hand">
                {dealersHand.map((crd, index) => {
                  return crd.isFaceDown
                    ? <div className={`bicycle-card face-down-card ${dealersHand.length > 2 ? '' : 'is-hidden'}`} key={index}>
                        <div className='card-box'>
                          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                          <g id="SVGRepo_iconCarrier">
                            <path d="M18.6789 15.9759C18.6789 14.5415 17.4796 13.3785 16 13.3785C14.5206 13.3785 13.3211 14.5415 13.3211 15.9759C13.3211 17.4105 14.5206 18.5734 16 18.5734C17.4796 18.5734 18.6789 17.4105 18.6789 15.9759Z" fill="#53C1DE">
                            </path>
                            <path fillRule="evenodd" clipRule="evenodd" d="M24.7004 11.1537C25.2661 8.92478 25.9772 4.79148 23.4704 3.39016C20.9753 1.99495 17.7284 4.66843 16.0139 6.27318C14.3044 4.68442 10.9663 2.02237 8.46163 3.42814C5.96751 4.82803 6.73664 8.8928 7.3149 11.1357C4.98831 11.7764 1 13.1564 1 15.9759C1 18.7874 4.98416 20.2888 7.29698 20.9289C6.71658 23.1842 5.98596 27.1909 8.48327 28.5877C10.9973 29.9932 14.325 27.3945 16.0554 25.7722C17.7809 27.3864 20.9966 30.0021 23.4922 28.6014C25.9956 27.1963 25.3436 23.1184 24.7653 20.8625C27.0073 20.221 31 18.7523 31 15.9759C31 13.1835 26.9903 11.7923 24.7004 11.1537ZM24.4162 19.667C24.0365 18.5016 23.524 17.2623 22.8971 15.9821C23.4955 14.7321 23.9881 13.5088 24.3572 12.3509C26.0359 12.8228 29.7185 13.9013 29.7185 15.9759C29.7185 18.07 26.1846 19.1587 24.4162 19.667ZM22.85 27.526C20.988 28.571 18.2221 26.0696 16.9478 24.8809C17.7932 23.9844 18.638 22.9422 19.4625 21.7849C20.9129 21.6602 22.283 21.4562 23.5256 21.1777C23.9326 22.7734 24.7202 26.4763 22.85 27.526ZM9.12362 27.5111C7.26143 26.47 8.11258 22.8946 8.53957 21.2333C9.76834 21.4969 11.1286 21.6865 12.5824 21.8008C13.4123 22.9332 14.2816 23.9741 15.1576 24.8857C14.0753 25.9008 10.9945 28.557 9.12362 27.5111ZM2.28149 15.9759C2.28149 13.874 5.94207 12.8033 7.65904 12.3326C8.03451 13.5165 8.52695 14.7544 9.12123 16.0062C8.51925 17.2766 8.01977 18.5341 7.64085 19.732C6.00369 19.2776 2.28149 18.0791 2.28149 15.9759ZM9.1037 4.50354C10.9735 3.45416 13.8747 6.00983 15.1159 7.16013C14.2444 8.06754 13.3831 9.1006 12.5603 10.2265C11.1494 10.3533 9.79875 10.5569 8.55709 10.8297C8.09125 9.02071 7.23592 5.55179 9.1037 4.50354ZM20.3793 11.5771C21.3365 11.6942 22.2536 11.85 23.1147 12.0406C22.8562 12.844 22.534 13.6841 22.1545 14.5453C21.6044 13.5333 21.0139 12.5416 20.3793 11.5771ZM16.0143 8.0481C16.6054 8.66897 17.1974 9.3623 17.7798 10.1145C16.5985 10.0603 15.4153 10.0601 14.234 10.1137C14.8169 9.36848 15.414 8.67618 16.0143 8.0481ZM9.8565 14.5444C9.48329 13.6862 9.16398 12.8424 8.90322 12.0275C9.75918 11.8418 10.672 11.69 11.623 11.5748C10.9866 12.5372 10.3971 13.5285 9.8565 14.5444ZM11.6503 20.4657C10.6679 20.3594 9.74126 20.2153 8.88556 20.0347C9.15044 19.2055 9.47678 18.3435 9.85796 17.4668C10.406 18.4933 11.0045 19.4942 11.6503 20.4657ZM16.0498 23.9915C15.4424 23.356 14.8365 22.6531 14.2448 21.8971C15.4328 21.9423 16.6231 21.9424 17.811 21.891C17.2268 22.6608 16.6369 23.3647 16.0498 23.9915ZM22.1667 17.4222C22.5677 18.3084 22.9057 19.1657 23.1742 19.9809C22.3043 20.1734 21.3652 20.3284 20.3757 20.4435C21.015 19.4607 21.6149 18.4536 22.1667 17.4222ZM18.7473 20.5941C16.9301 20.72 15.1016 20.7186 13.2838 20.6044C12.2509 19.1415 11.3314 17.603 10.5377 16.0058C11.3276 14.4119 12.2404 12.8764 13.2684 11.4158C15.0875 11.2825 16.9178 11.2821 18.7369 11.4166C19.7561 12.8771 20.6675 14.4086 21.4757 15.9881C20.6771 17.5812 19.7595 19.1198 18.7473 20.5941ZM22.8303 4.4666C24.7006 5.51254 23.8681 9.22726 23.4595 10.8426C22.2149 10.5641 20.8633 10.3569 19.4483 10.2281C18.6239 9.09004 17.7698 8.05518 16.9124 7.15949C18.1695 5.98441 20.9781 3.43089 22.8303 4.4666Z" fill="#53C1DE">
                            </path>
                          </g>
                          </svg>
                        </div>
                      </div>
                    : (
                      <div
                        className={
                          `bicycle-card ${(hasRevealed || dealersHand.length > 2) ? '' : 'is-hidden'} ${(crd.suit === 'HEARTS' || crd.suit === 'DIAMONDS') ? 'is-red' : ''}`
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
            <div className='player-chip'>YOU</div>
            {scoreCard.dealer > 0 && (
              <p
                className={`player-score ${scoreCard.user > 21 ? 'bust' : ''}
                ${playersHand.length > 2 ? '' : 'is-hidden'}`}
              >
                {scoreCard.user}
              </p>
            )}
              <div className="players-hand">
                {playersHand.map((crd, index) => (
                  <div
                    className={
                      `bicycle-card  ${playersHand.length > 2 ? '' : 'is-hidden'} ${(crd.suit === 'HEARTS' || crd.suit === 'DIAMONDS') ? 'is-red' : ''}`
                    }
                    key={index}
                  >
                    <p className='card-val'>{crd.value}</p>
                    <p className='card-suit'>{renderCardSuit(crd.suit)}</p>
                    <p className='card-val upside-down'>{crd.value}</p>
                  </div>
                ))}
              </div>
              <div className='button-holder is-standing'>
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
