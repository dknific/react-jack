import { GameResults } from '../util/Types';

interface GameOverProps {
  gameResult: GameResults,
  handlePlayAgainButton: () => void,
}

export default function GameOverScreen(props: GameOverProps) {
  const { gameResult, handlePlayAgainButton } = props;
  return (
    <div className="game-over-screen">
      <div className="game-over-modal">
        <h3 className={gameResult.cssClass}>{gameResult.headerText}</h3>
        <p>{gameResult.resultDetails}</p>
        {(gameResult.payout! > 0) && (
          <div className='payout-text'>
            <p>You win</p>
            <div className='payout-amount'>
              <img src="/coin.svg" />
              <p>{gameResult.payout}.</p>
            </div>
          </div>
        )}
        <button className='new-game-button' onClick={() => handlePlayAgainButton()}>Play Again</button>
      </div>
    </div>
  );
}