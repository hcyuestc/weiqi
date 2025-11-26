import Game from './Game'

describe('Game 类测试', () => {
  let game: Game

  beforeEach(() => {
    game = new Game()
  })

  test('初始化游戏应该创建一个空的19x19棋盘', () => {
    const state = game.getState()
    
    expect(state.board).toHaveLength(19)
    expect(state.board[0]).toHaveLength(19)
    expect(state.board[9][9]).toBe(-1) // 天元位置应为空
    expect(state.currentPlayer).toBe(0) // 初始玩家应为黑棋
    expect(state.capturedBlack).toBe(0)
    expect(state.capturedWhite).toBe(0)
  })

  test('应该能够在空位置落子', () => {
    const result = game.placeStone(9, 9)
    
    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    
    const state = game.getState()
    expect(state.board[9][9]).toBe(0) // 黑棋应在天元位置
    expect(state.currentPlayer).toBe(1) // 玩家应切换为白棋
  })

  test('不应该能够在已有棋子的位置落子', () => {
    game.placeStone(9, 9)
    const result = game.placeStone(9, 9)
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('该位置已有棋子')
  })

  test('应该能够提子', () => {
    // 黑棋落在左上角
    game.placeStone(0, 0) // 黑棋
    // 白棋逐步封住黑棋两口气
    game.placeStone(1, 0) // 白棋
    game.placeStone(5, 5) // 黑棋随意落子
    game.placeStone(0, 1) // 白棋完成提子
    
    const state = game.getState()
    
    expect(state.capturedBlack).toBe(1)
    expect(state.board[0][0]).toBe(-1) // 角上的黑棋应被提走
  })

  test('应该检测打劫并防止', () => {
    // 直接设置打劫位置，模拟刚发生的打劫局面
    ;(game as unknown as { koPosition?: { x: number, y: number } }).koPosition = { x: 5, y: 5 }
    
    const result = game.placeStone(5, 5)
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('打劫：不能立即提回')
  })

  test('应该能够悔棋', () => {
    game.placeStone(9, 9)
    // 不再使用未使用的变量
    
    const result = game.undoMove()
    expect(result).toBe(true)
    
    const afterUndo = game.getState()
    expect(afterUndo.board[9][9]).toBe(-1) // 天元位置应该变回空
    expect(afterUndo.currentPlayer).toBe(0) // 玩家应该变回黑棋
  })

  test('悔棋应该恢复被提的棋子', () => {
    game.placeStone(0, 0) // 黑棋
    game.placeStone(1, 0) // 白棋
    game.placeStone(5, 5) // 黑棋
    game.placeStone(0, 1) // 白棋提走(0,0)
    
    const beforeUndo = game.getState()
    expect(beforeUndo.board[0][0]).toBe(-1)
    
    game.undoMove()
    
    const afterUndo = game.getState()
    expect(afterUndo.board[0][0]).toBe(0) // 黑棋应被恢复
  })

  test('重置游戏应该清空棋盘和历史', () => {
    game.placeStone(9, 9)
    game.placeStone(9, 8)
    
    game.resetGame()
    const state = game.getState()
    
    expect(state.board[9][9]).toBe(-1)
    expect(state.board[9][8]).toBe(-1)
    expect(state.currentPlayer).toBe(0)
    expect(state.capturedBlack).toBe(0)
    expect(state.capturedWhite).toBe(0)
  })

  test('计算胜负应该返回正确结果', () => {
    // 手动设置一些局面来测试胜负计算
    // 这里简化处理，真实情况需要更复杂的测试
    const winner = game.calculateWinner()
    
    // 初始空棋盘应该返回undefined
    expect(winner).toBeUndefined()
  })
})
