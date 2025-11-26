import React, { memo } from 'react'
import './GameControls.css'

interface GameControlsProps {
  onUndo: () => void
  onReset: () => void
  onCalculateWinner: () => void
  isGameOver: boolean
  winner?: number
  capturedBlack: number
  capturedWhite: number
}

const GameControls: React.FC<GameControlsProps> = ({
  onUndo,
  onReset,
  onCalculateWinner,
  isGameOver,
  winner,
  capturedBlack,
  capturedWhite
}) => {
  // 获取胜利信息文本
  const getWinnerText = () => {
    if (!isGameOver) return ''
    if (winner === 0) return '黑棋获胜！'
    if (winner === 1) return '白棋获胜！'
    return '平局！'
  }

  // 处理按钮点击事件，添加触摸反馈
  const handleButtonClick = (callback: () => void) => {
    // 这里可以添加按钮点击的视觉反馈逻辑
    callback()
  }

  return (
    <div className="game-controls-container">
      <div className="game-info">
        <div className="captured-stones-info">
          <div className="stone-count">
            <span className="stone-icon black"></span>
            <span>被提子: {capturedBlack}</span>
          </div>
          <div className="stone-count">
            <span className="stone-icon white"></span>
            <span>被提子: {capturedWhite}</span>
          </div>
        </div>
        
        {isGameOver && (
          <div className="game-result">
            <h3>{getWinnerText()}</h3>
          </div>
        )}
      </div>
      
      <div className="control-buttons">
        <button 
          className="control-btn undo-btn"
          onClick={() => handleButtonClick(onUndo)}
          title="悔棋"
          aria-label="悔棋"
        >
          悔棋
        </button>
        
        <button 
          className="control-btn calculate-btn"
          onClick={() => handleButtonClick(onCalculateWinner)}
          disabled={isGameOver}
          title="计算胜负"
          aria-label="计算胜负"
        >
          {isGameOver ? '游戏已结束' : '计算胜负'}
        </button>
        
        <button 
          className="control-btn reset-btn"
          onClick={() => handleButtonClick(onReset)}
          title="重新开始"
          aria-label="重新开始"
        >
          重新开始
        </button>
      </div>
    </div>
  )
}

// 使用React.memo优化组件，避免不必要的重渲染
export default memo(GameControls, (prevProps, nextProps) => {
  // 只有当props发生变化时才重新渲染
  if (prevProps.isGameOver !== nextProps.isGameOver) {
    return false
  }
  
  if (prevProps.winner !== nextProps.winner) {
    return false
  }
  
  if (prevProps.capturedBlack !== nextProps.capturedBlack ||
      prevProps.capturedWhite !== nextProps.capturedWhite) {
    return false
  }
  
  if (prevProps.onUndo !== nextProps.onUndo ||
      prevProps.onReset !== nextProps.onReset ||
      prevProps.onCalculateWinner !== nextProps.onCalculateWinner) {
    return false
  }
  
  // 所有props都相同，跳过重渲染
  return true
})