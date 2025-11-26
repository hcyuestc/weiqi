import storageService from './StorageService'
import { GameState, Stone } from '../types/weiqi'

const STORAGE_KEY = 'weiqi_game_records'

const createGameState = (): GameState => {
  const board: Stone[][] = Array.from({ length: 19 }, () =>
    Array(19).fill(-1) as Stone[]
  )

  return {
    board,
    currentPlayer: 0,
    history: [board.map(row => [...row])],
    capturedBlack: 0,
    capturedWhite: 0,
    isGameOver: false
  }
}

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  test('getGameRecords 应在没有记录时返回空数组', () => {
    expect(storageService.getGameRecords()).toEqual([])
  })

  test('saveGameRecord 应保存记录并返回ID', () => {
    const recordId = storageService.saveGameRecord('初始对局', createGameState(), 'human')

    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).not.toBeNull()

    const parsed = JSON.parse(stored as string)
    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({
      id: recordId,
      name: '初始对局',
      gameMode: 'human',
      gameState: expect.any(Object),
      timestamp: expect.any(Number)
    })
  })

  test('getGameRecordById 应返回指定记录', () => {
    const firstId = storageService.saveGameRecord('对局A', createGameState(), 'ai', 'hard')
    storageService.saveGameRecord('对局B', createGameState(), 'human')

    const record = storageService.getGameRecordById(firstId)

    expect(record).toBeDefined()
    expect(record?.id).toBe(firstId)
    expect(record?.difficulty).toBe('hard')
  })

  test('deleteGameRecord 应删除记录并返回布尔值', () => {
    const recordId = storageService.saveGameRecord('待删除对局', createGameState(), 'ai')

    const deleted = storageService.deleteGameRecord(recordId)
    expect(deleted).toBe(true)
    expect(storageService.getGameRecords()).toHaveLength(0)

    const deletedAgain = storageService.deleteGameRecord(recordId)
    expect(deletedAgain).toBe(false)
  })

  test('clearAllGameRecords 应清空本地存储', () => {
    storageService.saveGameRecord('对局', createGameState(), 'human')

    storageService.clearAllGameRecords()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(storageService.getGameRecords()).toEqual([])
  })

  test('getGameRecords 应在JSON损坏时安全返回空数组', () => {
    localStorage.setItem(STORAGE_KEY, '{bad json')
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(storageService.getGameRecords()).toEqual([])
    consoleSpy.mockRestore()
  })
})

