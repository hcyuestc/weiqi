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
    // 先放置一些棋子形成可提的结构
    // 白棋形成一个十字包围黑棋
    game.placeStone(9, 9) // 黑棋在天元
    
    // 模拟白棋落子
    // 不直接访问私有属性，通过状态修改
    game.placeStone(8, 9)
    game.placeStone(10, 9)
    game.placeStone(9, 8)
    game.placeStone(9, 10) // 最后一颗棋子，形成包围
    
    const state = game.getState()
    
    // 检查是否提子成功
    expect(state.capturedBlack).toBe(1)
    expect(state.board[9][9]).toBe(-1) // 原来的黑棋应该被提走
  })

  test('应该检测打劫并防止', () => {
    // 设置一个简单的打劫局面
    // 1. 黑棋下在天元
    game.placeStone(9, 9)
    
    // 2. 白棋下在天元旁边，准备形成打劫
    game.placeStone(9, 8)
    
    // 3. 黑棋吃掉白棋
    game.placeStone(9, 7)
    game.placeStone(10, 8)
    game.placeStone(8, 8)
    game.placeStone(9, 9) // 黑棋提掉白棋
    
    // 4. 尝试立即进行打劫
    const result = game.placeStone(9, 8) // 白棋尝试打劫
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('打劫规则不允许此操作')
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
    // 设置一个有提子的局面
    game.placeStone(9, 9) // 黑棋
    game.placeStone(8, 9) // 白棋
    game.placeStone(10, 9) // 黑棋
    game.placeStone(8, 8) // 白棋
    game.placeStone(9, 8) // 黑棋提子
    
    // 记录提子后的状态
    const beforeUndo = game.getState()
    expect(beforeUndo.capturedWhite).toBe(1)
    
    // 悔棋
    game.undoMove()
    
    // 检查提子是否被恢复
    const afterUndo = game.getState()
    expect(afterUndo.capturedWhite).toBe(0)
    expect(afterUndo.board[8][9]).toBe(1) // 被提的白棋应该恢复
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
