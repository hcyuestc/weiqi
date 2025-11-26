import Game from './Game'
import AIController from './AIController'
import { Stone } from '../types/weiqi'

type MockableGame = Pick<Game, 'getState' | 'placeStone'>

const createBoard = (size = 5, fill: Stone = -1): Stone[][] =>
  Array.from({ length: size }, () => Array(size).fill(fill) as Stone[])

const createMockGame = (board: Stone[][], placeStoneReturn = { success: true }) => {
  const getState = jest.fn().mockReturnValue({
    board,
    currentPlayer: 1,
    history: [],
    capturedBlack: 0,
    capturedWhite: 0,
    isGameOver: false
  })

  const placeStone = jest.fn().mockReturnValue(placeStoneReturn)

  return {
    instance: { getState, placeStone } as unknown as MockableGame,
    getState,
    placeStone
  }
}

describe('AIController 类测试', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('简单难度应该根据 Math.random 选择空位', () => {
    const board = createBoard()
    board[0][0] = 0 // 占用第一个位置，迫使AI选择下一个空格

    const { instance } = createMockGame(board)
    const aiController = new AIController(instance as Game, 'easy')

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0)
    const move = aiController.getNextMove()

    expect(move).toEqual({ x: 0, y: 1 })
    randomSpy.mockRestore()
  })

  test('中等难度应优先保护己方棋子', () => {
    const board = createBoard()
    board[1][1] = 1 // AI棋子

    const { instance } = createMockGame(board)
    const aiController = new AIController(instance as Game, 'medium')

    const move = aiController.getNextMove()
    expect(move).toEqual({ x: 0, y: 1 }) // 邻近己方棋子的防守点
  })

  test('中等难度在无防守机会时尝试进攻', () => {
    const board = createBoard()
    board[0][0] = 0 // 玩家棋子

    const { instance } = createMockGame(board)
    const aiController = new AIController(instance as Game, 'medium')

    const move = aiController.getNextMove()
    expect(move).toEqual({ x: 1, y: 0 }) // 邻近对手棋子的进攻点
  })

  test('makeMove 应调用 Game.placeStone 并返回执行结果', () => {
    const board = createBoard()
    const { instance, placeStone } = createMockGame(board, { success: true })
    const aiController = new AIController(instance as Game, 'easy')

    jest.spyOn(Math, 'random').mockReturnValue(0)

    const success = aiController.makeMove()

    expect(success).toBe(true)
    expect(placeStone).toHaveBeenCalledWith(0, 0)
  })

  test('当没有可落子位置时 makeMove 应返回 false', () => {
    const board = createBoard(3, 1) // 棋盘已满
    const { instance, placeStone } = createMockGame(board)
    const aiController = new AIController(instance as Game, 'easy')

    const success = aiController.makeMove()

    expect(success).toBe(false)
    expect(placeStone).not.toHaveBeenCalled()
  })
})
