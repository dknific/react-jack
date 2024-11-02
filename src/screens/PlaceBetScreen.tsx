interface PlaceBetScreenProps {
  proposedBet: number,
  placeFinalBet: () => void,
  setProposedBet: (bet: number) => void,
  userCoins: number,
}

export default function PlaceBetScreen(props: PlaceBetScreenProps) {
  const { proposedBet, placeFinalBet, setProposedBet, userCoins } = props;

  return (
    <div className="bet-screen">
      <div className="bet-modal">
        {userCoins > 0 ? (
          <>
            <h3>Place Your Bet!</h3>
            <p className='proposed-bet'>{proposedBet}</p>
            <div className='wallet-explainer'>
              <p>Your Wallet:</p>
              <div>
                <img src="/coin.svg" />
                <p>{userCoins}</p>
              </div>
            </div>
            
            <div className='bet-amount-buttons'>
              <button
                className='bet-amount-button green-button'
                disabled={proposedBet + 10 > userCoins}
                onClick={() => setProposedBet(proposedBet + 10)}
              >
                10
              </button>
              <button
                className='bet-amount-button silver-button'
                disabled={proposedBet + 20 > userCoins}
                onClick={() => setProposedBet(proposedBet + 20)}
              >
                20
              </button>
              <button
                className='bet-amount-button gold-button'
                disabled={proposedBet + 50 > userCoins}
                onClick={() => setProposedBet(proposedBet + 50)}
              >
                50
              </button>
            </div>

            <div className='bet-modal-footer'>
              <button
                className={`start-round-button ${proposedBet == 0 ? 'is-disabled' : ''}`}
                disabled={proposedBet == 0}
                onClick={() => placeFinalBet()}
              >
                START!
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>Game Over!</h3>
            <p>You ran out of money</p>
            <button onClick={() => window.location.reload()}>Reset Game</button>
          </>
        )}
      </div>
    </div>
  );
}