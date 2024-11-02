import { FinalGameState } from '../util/Types';

interface GameOverProps {
  finalGameState: FinalGameState,
  handlePlayAgainButton: () => void,
}

export default function GameOverScreen(props: GameOverProps) {
  const { finalGameState, handlePlayAgainButton } = props;
  return (
    <div className="game-over-screen">
      <div className="game-over-modal">
        <h3 className={finalGameState.cssClass}>{finalGameState.gameOverMessage}</h3>
        <p>{finalGameState.gameOverDetails}</p>
        {(finalGameState.coinPayout! > 0) && (
          <div className='coinPayout-text'>
            <p>You win</p>
            <div className='coinPayout-amount'>
              <img src="/coin.svg" />
              <p>{finalGameState.coinPayout}.</p>
            </div>
          </div>
        )}
        <button className='new-game-button' onClick={() => handlePlayAgainButton()}>Play Again</button>
      </div>
    </div>
  );
}