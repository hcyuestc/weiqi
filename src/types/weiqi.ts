// 棋子类型定义
export type Stone = -1 | 0 | 1
// -1: 空, 0: 黑棋, 1: 白棋

export interface Position {
  x: number
  y: number
}

export interface GameState {
  board: Stone[][]
  currentPlayer: Stone
  lastMove?: Position
  history: Stone[][][]
  capturedBlack: number
  capturedWhite: number
  isGameOver: boolean
  winner?: Stone
}

export interface MoveResult {
  success: boolean
  error?: string
  capturedStones?: Position[]
}