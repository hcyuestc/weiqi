import Game from './Game'
import { Position, Stone } from '../types/weiqi'

class AIController {
  private game: Game
  private aiLevel: 'easy' | 'medium' | 'hard' = 'easy'

  constructor(game: Game, level: 'easy' | 'medium' | 'hard' = 'easy') {
    this.game = game
    this.aiLevel = level
  }

  // 设置AI难度
  setLevel(level: 'easy' | 'medium' | 'hard'): void {
    this.aiLevel = level
  }

  // 获取AI的下一步棋
  getNextMove(): Position | null {
    const gameState = this.game.getState()
    const { board } = gameState
    const boardSize = board.length
    
    switch (this.aiLevel) {
      case 'easy':
        return this.getEasyMove(board, boardSize)
      case 'medium':
        return this.getMediumMove(board, boardSize)
      case 'hard':
        return this.getHardMove(board, boardSize)
      default:
        return this.getEasyMove(board, boardSize)
    }
  }

  // 简单AI：随机选择空格
  private getEasyMove(board: Stone[][], boardSize: number): Position | null {
    const availableMoves: Position[] = []
    
    // 收集所有空格
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === -1) {
          availableMoves.push({ x: i, y: j })
        }
      }
    }
    
    if (availableMoves.length === 0) {
      return null
    }
    
    // 随机选择一个空格
    const randomIndex = Math.floor(Math.random() * availableMoves.length)
    return availableMoves[randomIndex]
  }

  // 中等AI：考虑一些简单的策略
  private getMediumMove(board: Stone[][], boardSize: number): Position | null {
    const availableMoves: Position[] = []
    const aiStones: Position[] = []
    const playerStones: Position[] = []
    
    // 收集所有空格和棋子位置
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === -1) {
          availableMoves.push({ x: i, y: j })
        } else if (board[i][j] === 1) { // 假设AI是白棋
          aiStones.push({ x: i, y: j })
        } else {
          playerStones.push({ x: i, y: j })
        }
      }
    }
    
    // 优先防守：尝试保护自己的棋子组
    for (const { x, y } of aiStones) {
      const neighbors = this.getNeighbors(x, y, boardSize)
      for (const neighbor of neighbors) {
        if (board[neighbor.x][neighbor.y] === -1) {
          // 简单检查：如果这个位置可以保护AI棋子
          if (this.isDefensiveMove(neighbor, board, boardSize)) {
            return neighbor
          }
        }
      }
    }
    
    // 其次进攻：尝试提走对方的棋子
    for (const { x, y } of playerStones) {
      const neighbors = this.getNeighbors(x, y, boardSize)
      for (const neighbor of neighbors) {
        if (board[neighbor.x][neighbor.y] === -1) {
          // 简单检查：如果这个位置可以进攻
          if (this.isOffensiveMove(neighbor, board, boardSize)) {
            return neighbor
          }
        }
      }
    }
    
    // 如果没有明显的攻防机会，随机选择
    if (availableMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length)
      return availableMoves[randomIndex]
    }
    
    return null
  }

  // 困难AI：可以实现更复杂的策略，如极小极大算法
  private getHardMove(board: Stone[][], boardSize: number): Position | null {
    // 这里可以实现更复杂的AI算法
    // 例如极小极大算法、蒙特卡洛树搜索等
    // 简化版本：使用中等AI的策略，但增加一些简单的评分
    return this.getMediumMove(board, boardSize)
  }

  // 获取周围四个方向的位置
  private getNeighbors(x: number, y: number, boardSize: number): Position[] {
    const neighbors: Position[] = []
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]] // 上下左右
    
    for (const [dx, dy] of directions) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        neighbors.push({ x: nx, y: ny })
      }
    }
    
    return neighbors
  }

  // 判断是否为防守性位置
  private isDefensiveMove(pos: Position, board: Stone[][], boardSize: number): boolean {
    // 简化判断：检查是否靠近AI的棋子组
    const neighbors = this.getNeighbors(pos.x, pos.y, boardSize)
    return neighbors.some(neighbor => board[neighbor.x][neighbor.y] === 1) // 假设AI是白棋
  }

  // 判断是否为进攻性位置
  private isOffensiveMove(pos: Position, board: Stone[][], boardSize: number): boolean {
    // 简化判断：检查是否靠近玩家的棋子组
    const neighbors = this.getNeighbors(pos.x, pos.y, boardSize)
    return neighbors.some(neighbor => board[neighbor.x][neighbor.y] === 0) // 假设玩家是黑棋
  }

  // 执行AI的下一步棋
  makeMove(): boolean {
    const move = this.getNextMove()
    if (!move) {
      return false
    }
    
    const result = this.game.placeStone(move.x, move.y)
    return result.success
  }
}

export default AIController