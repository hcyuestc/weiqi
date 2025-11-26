import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
// GameState已经在后面导入
import Game from './engine/Game'
import AIController from './engine/AIController'
import StorageService from './engine/StorageService'
import Board from './components/Board'
import GameControls from './components/GameControls'
import GameModeSelector from './components/GameModeSelector'
import GameRecordManager from './components/GameRecordManager'
import { GameState } from './types/weiqi'
import './App.css'

function App() {
  const [game, setGame] = useState<Game | null>(null)
  const [aiController, setAiController] = useState<AIController | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    currentPlayer: 0,
    history: [],
    capturedBlack: 0,
    capturedWhite: 0,
    isGameOver: false
  })
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [gameMode, setGameMode] = useState<'human' | 'ai'>('human')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [notification, setNotification] = useState<{message: string; timestamp: number; type: 'success' | 'error' | 'warning' | 'info'} | null>(null)
  const isAIMoving = useRef(false)

  // 初始化游戏
  useEffect(() => {
    const newGame = new Game()
    setGame(newGame)
    
    if (gameMode === 'ai') {
      const newAiController = new AIController(newGame, difficulty)
      setAiController(newAiController)
    } else {
      setAiController(null)
    }
    
    setGameState(newGame.getState())
    isAIMoving.current = false
  }, [gameMode, difficulty])

  // 当游戏状态更新且是AI回合时，AI自动落子
  useEffect(() => {
    const makeAIMove = async () => {
      // 检查是否需要AI落子
      if (gameMode === 'ai' && 
          aiController && 
          gameState.currentPlayer === 1 && 
          !gameState.isGameOver && 
          !isAIMoving.current) {
        
        isAIMoving.current = true
        
        // 添加小延迟，让用户能看到当前玩家变化
        await new Promise(resolve => setTimeout(resolve, 500))
        
        try {
          // 执行AI落子
          const success = aiController.makeMove()
          if (game) {
            setGameState(game.getState())
            
            if (!success && !gameState.isGameOver) {
              setErrorMessage('AI落子失败')
              setTimeout(() => setErrorMessage(''), 3000)
            }
          }
        } catch (err) {
          console.error('AI落子出错:', err)
          setErrorMessage('AI落子出错')
          setTimeout(() => setErrorMessage(''), 3000)
        } finally {
          isAIMoving.current = false
        }
      }
    }
    
    makeAIMove()
  }, [gameState.currentPlayer, gameState.isGameOver, gameMode, aiController, game])
  
  // gameControlsProps将移到所有函数声明之后

  // 处理落子
  const handleCellClick = useCallback((x: number, y: number) => {
    console.log(`处理落子: (${x}, ${y}), 当前玩家: ${gameState.currentPlayer}, 游戏结束: ${gameState.isGameOver}`)
    
    // 在AI模式下，只有当轮到玩家落子时（黑棋，值为0）才允许玩家落子
    if (gameMode === 'ai' && gameState.currentPlayer !== 0) {
      console.log('当前是AI回合，不能落子')
      return
    }
    
    if (!game || gameState.isGameOver) {
      console.log('落子被拒绝: 游戏未初始化或已结束')
      return
    }

    const result = game.placeStone(x, y)
    console.log(`落子结果: ${result.success}, 错误: ${result.error}`)
    
    if (result.success) {
      // 更新游戏状态
      const newState = game.getState()
      console.log('更新游戏状态，新玩家:', newState.currentPlayer)
      setGameState(newState)
      setErrorMessage('')
    } else {
      setErrorMessage(result.error || '落子失败')
      // 3秒后清除错误信息
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }, [game, gameState.isGameOver])

  // 处理悔棋
  const handleUndo = useCallback(() => {
    if (!game) return

    const success = game.undoMove()
    if (success) {
      // 更新游戏状态
      setGameState(game.getState())
      setErrorMessage('')
    } else {
      setErrorMessage('不能继续悔棋')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }, [game])

  // 处理重新开始
  const handleReset = useCallback(() => {
    if (!game) return

    game.resetGame()
    // 更新游戏状态
    setGameState(game.getState())
    setErrorMessage('')
    isAIMoving.current = false
  }, [game])
  
  // 计算胜负
  const handleCalculateWinner = useCallback(() => {
    if (!game || gameState.isGameOver) return
    game.calculateWinner()
    setGameState(game.getState())
  }, [game, gameState.isGameOver])

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({
      message,
      timestamp: Date.now(),
      type
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  // 处理保存游戏
  const handleSaveGame = useCallback((name: string) => {
    if (!game) return

    try {
      const currentState = game.getState()
      StorageService.saveGameRecord(name, currentState, gameMode, difficulty)
      showNotification('游戏保存成功', 'success')
    } catch (error) {
      showNotification('保存游戏失败', 'error')
    }
  }, [game, gameMode, difficulty, showNotification])

  // 处理加载游戏
  const handleLoadGame = useCallback((savedGameState: GameState, savedGameMode: 'human' | 'ai', savedDifficulty?: 'easy' | 'medium' | 'hard') => {
    if (!game) return

    try {
      // 重置游戏
      game.resetGame()
      
      // 由于Game类没有提供直接设置状态的方法，我们创建一个新的Game实例
      const newGame = new Game()
      setGame(newGame)
      
      // 然后使用setGameState更新UI状态
      setGameState({
        board: savedGameState.board.map(row => [...row]),
        currentPlayer: savedGameState.currentPlayer,
        history: savedGameState.history || [],
        capturedBlack: savedGameState.capturedBlack,
        capturedWhite: savedGameState.capturedWhite,
        isGameOver: savedGameState.isGameOver,
        winner: savedGameState.winner
      })
      
      // 更新状态
      setGameState(game.getState())
      setGameMode(savedGameMode)
      if (savedDifficulty) {
        setDifficulty(savedDifficulty)
      }
      
      isAIMoving.current = false
      
      showNotification('游戏加载成功', 'success')
    } catch (error) {
      showNotification('加载游戏失败', 'error')
    }
  }, [game, showNotification])

  // 计算胜负函数已移到前面定义
  
  // 使用useMemo缓存GameControls组件的props，避免不必要的重渲染
  const gameControlsProps = useMemo(() => ({
    onUndo: handleUndo,
    onReset: handleReset,
    onCalculateWinner: handleCalculateWinner,
    isGameOver: gameState.isGameOver,
    winner: gameState.winner,
    capturedBlack: gameState.capturedBlack,
    capturedWhite: gameState.capturedWhite
  }), [handleUndo, handleReset, handleCalculateWinner, gameState.isGameOver, gameState.winner, gameState.capturedBlack, gameState.capturedWhite])
  
  // 如果游戏未初始化，显示加载状态
  if (!game || gameState.board.length === 0) {
    return (
      <div className="app-container">
        <div className="loading">正在加载围棋程序...</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>围棋程序</h1>
      </header>
      
      <main className="app-main">
        <div className="game-container">
          <GameModeSelector 
            gameMode={gameMode}
            difficulty={difficulty}
            onModeChange={setGameMode}
            onDifficultyChange={setDifficulty}
          />
          
          <GameRecordManager 
          onSaveGame={handleSaveGame} 
          onLoadGame={handleLoadGame} 
          showNotification={showNotification}
        />
          
          <Board 
            board={gameState.board} 
            onCellClick={handleCellClick} 
            currentPlayer={gameState.currentPlayer}
          />
          
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
          
          {notification && (
            <div className={`notification ${notification.type}`} onClick={() => setNotification(null)}>
              {notification.message}
            </div>
          )}
          
          <GameControls 
            {...gameControlsProps}
          />
        </div>
      </main>
      
      <footer className="app-footer">
        <p>围棋程序 - 版本 0.0.1</p>
      </footer>
    </div>
  )
}

export default App