import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Stone } from '../types/weiqi'
import './Board.css'

interface BoardProps {
  board: Stone[][]
  onCellClick: (x: number, y: number) => void
  currentPlayer: Stone
  boardSize?: number
}

const Board: React.FC<BoardProps> = ({ 
  board, 
  onCellClick, 
  currentPlayer,
  boardSize = 19 
}) => {
  // 使用useState和useEffect管理棋盘大小计算，避免每次渲染都重新计算
  const [boardDimensions, setBoardDimensions] = useState({ cellSize: 0, boardSize: 0 })

  // 计算棋盘尺寸（响应式）
  const calculateBoardSize = useCallback(() => {
    const containerWidth = window.innerWidth
    const containerHeight = window.innerHeight - 200 // 减去头部和底部
    const cellSize = Math.min(
      Math.floor(containerWidth * 0.8 / boardSize),
      Math.floor(containerHeight * 0.8 / boardSize)
    )
    return {
      cellSize: Math.min(cellSize, 24), // 最大单元格大小
      boardSize: cellSize * (boardSize - 1)
    }
  }, [boardSize])

  // 初始化和窗口大小变化时重新计算
  useEffect(() => {
    // 初始化计算
    setBoardDimensions(calculateBoardSize())

    // 添加防抖处理窗口大小变化
    let resizeTimeoutId: number
    const handleResize = () => {
      clearTimeout(resizeTimeoutId)
      resizeTimeoutId = window.setTimeout(() => {
        setBoardDimensions(calculateBoardSize())
      }, 200) // 200ms防抖延迟
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [calculateBoardSize])

  const { cellSize, boardSize: size } = boardDimensions

  // 使用useMemo缓存棋盘线渲染结果
  const gridLines = useMemo(() => {
    if (!cellSize || !size) return []
    
    const lines = []
    
    // 横线
    for (let i = 0; i < boardSize; i++) {
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * cellSize}
          x2={size}
          y2={i * cellSize}
          stroke="#000"
          strokeWidth="1"
        />
      )
    }
    
    // 竖线
    for (let i = 0; i < boardSize; i++) {
      lines.push(
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1={0}
          x2={i * cellSize}
          y2={size}
          stroke="#000"
          strokeWidth="1"
        />
      )
    }
    
    return lines
  }, [boardSize, cellSize, size])

  // 使用useMemo缓存星位渲染结果
  const starPoints = useMemo(() => {
    if (!cellSize) return []
    
    const stars = []
    const starPositions = [3, 9, 15] // 标准围棋天元和星位位置
    
    for (const x of starPositions) {
      for (const y of starPositions) {
        stars.push(
          <circle
            key={`star-${x}-${y}`}
            cx={x * cellSize}
            cy={y * cellSize}
            r="4"
            fill="#000"
          />
        )
      }
    }
    
    return stars
  }, [cellSize])

  // 使用useMemo缓存棋子渲染结果
  const stones = useMemo(() => {
    if (!cellSize) return []
    
    const stonesList = []
    
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] !== -1) {
          const isBlack = board[i][j] === 0
          stonesList.push(
            <circle
              key={`stone-${i}-${j}`}
              cx={j * cellSize}
              cy={i * cellSize}
              r={cellSize * 0.4}
              fill={isBlack ? '#000' : '#fff'}
              stroke="#000"
              strokeWidth="1"
              style={{ cursor: 'default', transition: 'all 0.2s ease' }}
              className="stone-animated"
            />
          )
        }
      }
    }
    
    return stonesList
  }, [board, boardSize, cellSize])

  // 使用useCallback优化点击处理函数
  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!cellSize) return
    
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // 计算点击的棋盘坐标
    // 修复：确保坐标转换正确对应到棋盘系统
    // 注意：boardX对应棋盘的行索引(垂直方向)，boardY对应棋盘的列索引(水平方向)
    const boardX = Math.round(y / cellSize)
    const boardY = Math.round(x / cellSize)
    
    console.log(`点击坐标: (${x}, ${y}) -> 棋盘坐标: (${boardX}, ${boardY})`)
    
    // 检查坐标是否有效
    if (boardX >= 0 && boardX < boardSize && boardY >= 0 && boardY < boardSize) {
      onCellClick(boardX, boardY)
    }
    }, [cellSize, boardSize, onCellClick])

  return (
    <div className="board-container">
      <div className="board-wrapper" style={{ 
        backgroundColor: '#e6b87d',
        borderRadius: '4px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <svg
          width={size + 2}
          height={size + 2}
          onClick={handleClick}
          style={{ 
            cursor: 'pointer',
            opacity: size > 0 ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          {gridLines}
          {starPoints}
          {stones}
        </svg>
      </div>
      <div className="current-player-indicator">
        <div className={`stone-indicator ${currentPlayer === 0 ? 'active' : ''}`}>
          黑棋回合
        </div>
        <div className={`stone-indicator ${currentPlayer === 1 ? 'active' : ''}`}>
          白棋回合
        </div>
      </div>
    </div>
  )
}

// 使用React.memo优化组件，避免不必要的重渲染
export default React.memo(Board, (prevProps, nextProps) => {
  // 深度比较棋盘状态，只有在棋盘发生变化时才重新渲染
  if (prevProps.currentPlayer !== nextProps.currentPlayer) {
    return false
  }
  
  if (prevProps.onCellClick !== nextProps.onCellClick) {
    return false
  }
  
  if (prevProps.boardSize !== nextProps.boardSize) {
    return false
  }
  
  // 检查棋盘是否发生变化
  for (let i = 0; i < prevProps.board.length; i++) {
    for (let j = 0; j < prevProps.board[i].length; j++) {
      if (prevProps.board[i][j] !== nextProps.board[i][j]) {
        return false
      }
    }
  }
  
  // 棋盘没有变化，可以跳过重渲染
  return true
})