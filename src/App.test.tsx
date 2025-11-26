import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'
import Game from './engine/Game'

// Mock Game和其他依赖
jest.mock('./engine/Game')
const MockGame = Game as jest.MockedClass<typeof Game>
type MockedGameInstance = {
  getState: jest.Mock
  placeStone: jest.Mock
  undoMove: jest.Mock
  resetGame: jest.Mock
  calculateWinner: jest.Mock
}

let latestGameInstance: MockedGameInstance | null = null
const createGameMock = (): MockedGameInstance => ({
  getState: jest.fn().mockReturnValue({
    board: Array(19).fill(null).map(() => Array(19).fill(-1)),
    currentPlayer: 0,
    history: [],
    capturedBlack: 0,
    capturedWhite: 0,
    isGameOver: false
  }),
  placeStone: jest.fn().mockReturnValue({ success: true }),
  undoMove: jest.fn().mockReturnValue(true),
  resetGame: jest.fn(),
  calculateWinner: jest.fn()
})

const getLatestGameInstance = () => {
  if (!latestGameInstance) {
    throw new Error('Mock Game 实例尚未创建')
  }
  return latestGameInstance
}

describe('App 组件测试', () => {
  beforeEach(() => {
    // 重置所有模拟
    MockGame.mockClear()
    latestGameInstance = null
    
    // 设置Game的mock实现
    MockGame.mockImplementation(() => {
      latestGameInstance = createGameMock()
      return latestGameInstance as unknown as Game
    })
  })

  test('渲染App组件时应该显示游戏界面', () => {
    render(<App />)
    
    // 检查游戏模式选择器是否存在
    expect(screen.getByText(/游戏模式/i)).toBeInTheDocument()
    
    // 检查棋盘是否存在
    expect(screen.getByTestId('go-board')).toBeInTheDocument()
    
    // 检查游戏控制按钮是否存在
    expect(screen.getByText(/悔棋/i)).toBeInTheDocument()
    expect(screen.getByText(/重新开始/i)).toBeInTheDocument()
    expect(screen.getByText(/计算胜负/i)).toBeInTheDocument()
  })

  test('点击棋盘时应该调用Game.placeStone', async () => {
    render(<App />)
    
    // 等待Game初始化完成
    await waitFor(() => {
      expect(MockGame).toHaveBeenCalled()
    })
    
    // 点击棋盘
    const boardElement = screen.getByTestId('go-board')
    fireEvent.click(boardElement, { clientX: 200, clientY: 200 })
    
    // 验证placeStone是否被调用
    const mockGameInstance = getLatestGameInstance()
    expect(mockGameInstance.placeStone).toHaveBeenCalled()
  })

  test('点击悔棋按钮时应该调用Game.undoMove', async () => {
    render(<App />)
    
    // 等待Game初始化完成
    await waitFor(() => {
      expect(MockGame).toHaveBeenCalled()
    })
    
    // 点击悔棋按钮
    const undoButton = screen.getByText(/悔棋/i)
    fireEvent.click(undoButton)
    
    // 验证undoMove是否被调用
    const mockGameInstance = getLatestGameInstance()
    expect(mockGameInstance.undoMove).toHaveBeenCalled()
  })

  test('点击重新开始按钮时应该调用Game.resetGame', async () => {
    render(<App />)
    
    // 等待Game初始化完成
    await waitFor(() => {
      expect(MockGame).toHaveBeenCalled()
    })
    
    // 点击重新开始按钮
    const resetButton = screen.getByText(/重新开始/i)
    fireEvent.click(resetButton)
    
    // 验证resetGame是否被调用
    const mockGameInstance = getLatestGameInstance()
    expect(mockGameInstance.resetGame).toHaveBeenCalled()
  })

  test('点击计算胜负按钮时应该调用Game.calculateWinner', async () => {
    render(<App />)
    
    // 等待Game初始化完成
    await waitFor(() => {
      expect(MockGame).toHaveBeenCalled()
    })
    
    // 点击计算胜负按钮
    const calculateButton = screen.getByText(/计算胜负/i)
    fireEvent.click(calculateButton)
    
    // 验证calculateWinner是否被调用
    const mockGameInstance = getLatestGameInstance()
    expect(mockGameInstance.calculateWinner).toHaveBeenCalled()
  })

  test('应该能够切换游戏模式', async () => {
    render(<App />)
    
    // 等待组件初始化完成
    await waitFor(() => {
      expect(MockGame).toHaveBeenCalled()
    })
    
    // 点击人机对战选项
    const aiModeOption = screen.getByText(/人机对战/i)
    fireEvent.click(aiModeOption)
    
    // 验证模式切换（在真实应用中，这会触发Game和AIController的重新初始化）
    // 由于我们使用了mock，可以验证Game被重新创建了
    await waitFor(() => {
      expect(MockGame).toHaveBeenCalledTimes(2)
    })
  })
})
