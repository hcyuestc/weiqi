import React from 'react'
import './GameModeSelector.css'

type GameMode = 'human' | 'ai'
type Difficulty = 'easy' | 'medium' | 'hard' | 'leela'

interface GameModeSelectorProps {
  gameMode: GameMode
  difficulty: Difficulty
  onModeChange: (mode: GameMode) => void
  onDifficultyChange: (difficulty: Difficulty) => void
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  gameMode,
  difficulty,
  onModeChange,
  onDifficultyChange
}) => {
  return (
    <div className="game-mode-selector">
      <div className="mode-section">
        <h3>游戏模式</h3>
        <div className="mode-options">
          <label className={`mode-option ${gameMode === 'human' ? 'active' : ''}`}>
            <input
              type="radio"
              name="gameMode"
              value="human"
              checked={gameMode === 'human'}
              onChange={() => onModeChange('human')}
            />
            <span>人人对战</span>
          </label>
          
          <label className={`mode-option ${gameMode === 'ai' ? 'active' : ''}`}>
            <input
              type="radio"
              name="gameMode"
              value="ai"
              checked={gameMode === 'ai'}
              onChange={() => onModeChange('ai')}
            />
            <span>人机对战</span>
          </label>
        </div>
      </div>
      
      {gameMode === 'ai' && (
        <div className="difficulty-section">
          <h3>AI难度</h3>
          <div className="difficulty-options">
            <label className={`difficulty-option ${difficulty === 'easy' ? 'active' : ''}`}>
              <input
                type="radio"
                name="difficulty"
                value="easy"
                checked={difficulty === 'easy'}
                onChange={() => onDifficultyChange('easy')}
              />
              <span>简单</span>
            </label>
            
            <label className={`difficulty-option ${difficulty === 'medium' ? 'active' : ''}`}>
              <input
                type="radio"
                name="difficulty"
                value="medium"
                checked={difficulty === 'medium'}
                onChange={() => onDifficultyChange('medium')}
              />
              <span>中等</span>
            </label>
            
            <label className={`difficulty-option ${difficulty === 'hard' ? 'active' : ''}`}>
              <input
                type="radio"
                name="difficulty"
                value="hard"
                checked={difficulty === 'hard'}
                onChange={() => onDifficultyChange('hard')}
              />
              <span>困难</span>
            </label>

            <label className={`difficulty-option ${difficulty === 'leela' ? 'active' : ''}`}>
              <input
                type="radio"
                name="difficulty"
                value="leela"
                checked={difficulty === 'leela'}
                onChange={() => onDifficultyChange('leela')}
              />
              <span>Leela Zero</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameModeSelector
