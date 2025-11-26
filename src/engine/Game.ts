import { Stone, Position, GameState, MoveResult } from '../types/weiqi'

class Game {
  private state: GameState
  private boardSize: number = 19
  private koPosition?: Position // 记录打劫位置

  constructor() {
    this.state = this.initializeGame()
  }

  // 初始化游戏状态
  private initializeGame(): GameState {
    const board: Stone[][] = []
    for (let i = 0; i < this.boardSize; i++) {
      const row: Stone[] = []
      for (let j = 0; j < this.boardSize; j++) {
        row.push(-1) // -1表示空格
      }
      board.push(row)
    }

    return {
      board,
      currentPlayer: 0, // 黑棋先行
      history: [this.copyBoard(board)],
      capturedBlack: 0,
      capturedWhite: 0,
      isGameOver: false
    }
  }

  // 复制棋盘
  private copyBoard(board: Stone[][]): Stone[][] {
    return board.map(row => [...row])
  }

  // 检查位置是否在棋盘范围内
  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize
  }

  // 获取周围四个方向的位置
  private getNeighbors(x: number, y: number): Position[] {
    const neighbors: Position[] = []
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]] // 上下左右
    
    for (const [dx, dy] of directions) {
      const nx = x + dx
      const ny = y + dy
      if (this.isValidPosition(nx, ny)) {
        neighbors.push({ x: nx, y: ny })
      }
    }
    
    return neighbors
  }

  // 检查一组棋子是否有气
  private hasLiberty(x: number, y: number, board: Stone[][]): boolean {
    const visited: boolean[][] = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(false))
    const stoneType = board[x][y]
    
    if (stoneType === -1) return true

    const checkLiberty = (x: number, y: number): boolean => {
      if (!this.isValidPosition(x, y) || visited[x][y]) return false
      visited[x][y] = true
      
      if (board[x][y] === -1) return true
      if (board[x][y] !== stoneType) return false
      
      // 检查四个方向
      return this.getNeighbors(x, y).some(({ x: nx, y: ny }) => checkLiberty(nx, ny))
    }
    
    return checkLiberty(x, y)
  }

  // 获取一组相连的棋子
  private getGroup(x: number, y: number, board: Stone[][]): Position[] {
    const group: Position[] = []
    const visited: boolean[][] = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(false))
    const stoneType = board[x][y]
    
    if (stoneType === -1) return group

    const findGroup = (x: number, y: number) => {
      if (!this.isValidPosition(x, y) || visited[x][y] || board[x][y] !== stoneType) return
      visited[x][y] = true
      group.push({ x, y })
      
      this.getNeighbors(x, y).forEach(({ x: nx, y: ny }) => findGroup(nx, ny))
    }
    
    findGroup(x, y)
    return group
  }

  // 提走无气的棋子
  private captureStones(board: Stone[][]): Position[] {
    const captured: Position[] = []
    
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (board[i][j] !== -1 && !this.hasLiberty(i, j, board)) {
          const group = this.getGroup(i, j, board)
          group.forEach(({ x, y }) => {
            board[x][y] = -1
            captured.push({ x, y })
          })
        }
      }
    }
    
    return captured
  }

  // 检查是否为打劫
  private isKoCapture(x: number, y: number, captured: Position[]): boolean {
    // 打劫规则：如果只提走一个棋子，且新放置的棋子周围只有一个空点
    if (captured.length !== 1) return false
    
    // 检查新放置的棋子是否只有一个气
    let libertyCount = 0
    const tempBoard = this.copyBoard(this.state.board)
    tempBoard[x][y] = this.state.currentPlayer
    
    for (const { x: nx, y: ny } of this.getNeighbors(x, y)) {
      if (tempBoard[nx][ny] === -1) {
        libertyCount++
      }
    }
    
    // 如果只有一个气，且被提走的棋子只有一个气，那么这可能是打劫
    if (libertyCount === 1 && captured.length === 1) {
      const [capturedPos] = captured
      // 检查被提走的棋子是否只有一个气
      let capturedLibertyCount = 0
      const preBoard = this.copyBoard(this.state.board)
      for (const { x: nx, y: ny } of this.getNeighbors(capturedPos.x, capturedPos.y)) {
        if (preBoard[nx][ny] === -1) {
          capturedLibertyCount++
        }
      }
      
      if (capturedLibertyCount === 1) {
        // 设置打劫位置
        this.koPosition = { x, y }
        return true
      }
    }
    
    return false
  }

  // 落子
  placeStone(x: number, y: number): MoveResult {
    // 检查游戏是否已结束
    if (this.state.isGameOver) {
      return { success: false, error: '游戏已结束' }
    }

    // 检查位置是否有效
    if (!this.isValidPosition(x, y)) {
      return { success: false, error: '位置超出棋盘范围' }
    }

    // 检查位置是否为空
    if (this.state.board[x][y] !== -1) {
      return { success: false, error: '该位置已有棋子' }
    }

    // 检查是否为打劫位置
    if (this.koPosition && this.koPosition.x === x && this.koPosition.y === y) {
      return { success: false, error: '打劫：不能立即提回' }
    }

    // 创建临时棋盘进行测试
    const tempBoard = this.copyBoard(this.state.board)
    tempBoard[x][y] = this.state.currentPlayer

    // 检查是否会自杀
    let hasLibertyAfterMove = false
    const neighbors = this.getNeighbors(x, y)
    
    // 检查新放置的棋子是否有气，或者是否能提走对方棋子
    for (const { x: nx, y: ny } of neighbors) {
      if (tempBoard[nx][ny] === -1) {
        hasLibertyAfterMove = true
        break
      }
    }

    // 如果没有直接气，检查是否能提走对方棋子
    if (!hasLibertyAfterMove) {
      // 先尝试提走对方棋子
      const testBoard = this.copyBoard(tempBoard)
      const wouldCapture = this.captureStones(testBoard)
      
      // 检查提走对方棋子后是否有气
      if (wouldCapture.length === 0 || !this.hasLiberty(x, y, testBoard)) {
        return { success: false, error: '禁止自杀' }
      }
    }

    // 执行落子
    this.state.board[x][y] = this.state.currentPlayer
    
    // 提走对方无气的棋子
    const capturedStones = this.captureStones(this.state.board)
    
    // 更新被提子数
    if (this.state.currentPlayer === 0) {
      this.state.capturedWhite += capturedStones.length
    } else {
      this.state.capturedBlack += capturedStones.length
    }

    // 检查打劫
    this.isKoCapture(x, y, capturedStones)

    // 更新最后一步
    this.state.lastMove = { x, y }

    // 保存历史记录
    this.state.history.push(this.copyBoard(this.state.board))

    // 切换玩家
    this.state.currentPlayer = this.state.currentPlayer === 0 ? 1 : 0

    // 清除打劫位置（如果不是打劫）
    if (capturedStones.length !== 1) {
      this.koPosition = undefined
    }

    return { success: true, capturedStones }
  }

  // 悔棋
  undoMove(): boolean {
    if (this.state.history.length <= 1) {
      return false // 不能悔到初始状态之前
    }

    this.state.history.pop()
    this.state.board = this.copyBoard(this.state.history[this.state.history.length - 1])
    this.state.currentPlayer = this.state.currentPlayer === 0 ? 1 : 0
    this.state.lastMove = undefined
    this.koPosition = undefined
    this.state.isGameOver = false
    this.state.winner = undefined

    return true
  }

  // 计算胜负（简化版本，实际围棋规则更复杂）
  calculateWinner(): void {
    // 这里简化为计算棋盘上的棋子数量
    let blackCount = 0
    let whiteCount = 0

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.state.board[i][j] === 0) {
          blackCount++
        } else if (this.state.board[i][j] === 1) {
          whiteCount++
        }
      }
    }

    // 考虑被提子数（简化处理）
    blackCount -= this.state.capturedBlack
    whiteCount -= this.state.capturedWhite

    if (blackCount > whiteCount) {
      this.state.winner = 0
    } else if (whiteCount > blackCount) {
      this.state.winner = 1
    }
    // 如果相等，这里可以根据围棋规则进行处理

    this.state.isGameOver = true
  }

  // 获取当前游戏状态
  getState(): GameState {
    return {
      ...this.state,
      board: this.copyBoard(this.state.board),
      history: this.state.history.map(board => this.copyBoard(board))
    }
  }

  // 重置游戏
  resetGame(): void {
    this.state = this.initializeGame()
    this.koPosition = undefined
  }
}

export default Game