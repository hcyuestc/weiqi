import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Board from './Board'

describe('Board 组件测试', () => {
  // 创建一个空的19x19棋盘用于测试
  const createEmptyBoard = () => {
    return Array(19).fill(null).map(() => Array(19).fill(-1))
  }

  // 创建一个带有一些棋子的棋盘用于测试
  const createSampleBoard = () => {
    const board = createEmptyBoard()
    board[9][9] = 0 // 黑棋在天元
    board[8][8] = 1 // 白棋在天元附近
    return board
  }

  test('渲染空棋盘时应该显示正确的网格', () => {
    const handleCellClick = jest.fn()
    render(<Board board={createEmptyBoard()} onCellClick={handleCellClick} currentPlayer={0} />)
    
    // 检查棋盘是否被渲染
    const boardElement = screen.getByTestId('go-board')
    expect(boardElement).toBeInTheDocument()
    
    // 检查网格线数量 - 19x19棋盘应该有多条网格线
    const gridLines = boardElement.querySelectorAll('line')
    expect(gridLines.length).toBeGreaterThan(0)
  })

  test('渲染棋盘时应该正确显示黑白棋子', () => {
    const handleCellClick = jest.fn()
    render(<Board board={createSampleBoard()} onCellClick={handleCellClick} currentPlayer={0} />)
    
    // 检查黑棋是否存在
    const blackStones = screen.getAllByTestId('stone-black')
    expect(blackStones.length).toBe(1)
    
    // 检查白棋是否存在
    const whiteStones = screen.getAllByTestId('stone-white')
    expect(whiteStones.length).toBe(1)
  })

  test('点击棋盘单元格应该调用onCellClick回调', () => {
    const handleCellClick = jest.fn()
    render(<Board board={createEmptyBoard()} onCellClick={handleCellClick} currentPlayer={0} />)
    
    // 找到棋盘并点击一个位置
    const boardElement = screen.getByTestId('go-board')
    
    // 模拟点击棋盘上的一个位置（近似位置）
    fireEvent.click(boardElement, { clientX: 200, clientY: 200 })
    
    // 验证回调是否被调用
    expect(handleCellClick).toHaveBeenCalledTimes(1)
    // 验证回调是否接收到坐标参数
    expect(handleCellClick.mock.calls[0][0]).toBeGreaterThanOrEqual(0)
    expect(handleCellClick.mock.calls[0][1]).toBeGreaterThanOrEqual(0)
  })

  test('应该正确显示当前玩家指示器', () => {
    const handleCellClick = jest.fn()
    
    // 测试当前玩家为黑棋的情况
    const { rerender } = render(<Board board={createEmptyBoard()} onCellClick={handleCellClick} currentPlayer={0} />)
    let currentPlayerIndicator = screen.getByTestId('current-player-indicator')
    expect(currentPlayerIndicator).toHaveTextContent('黑棋回合')
    
    // 测试当前玩家为白棋的情况
    rerender(<Board board={createEmptyBoard()} onCellClick={handleCellClick} currentPlayer={1} />)
    currentPlayerIndicator = screen.getByTestId('current-player-indicator')
    expect(currentPlayerIndicator).toHaveTextContent('白棋回合')
  })

  test('棋盘应该响应窗口大小变化', () => {
    // 这里主要是测试组件是否能正常渲染，
    // 响应式设计的实际效果在单元测试中较难完整测试
    // 可以使用Jest的spyOn来监视resize事件处理
    
    const handleCellClick = jest.fn()
    const resizeSpy = jest.spyOn(window, 'addEventListener')
    
    render(<Board board={createEmptyBoard()} onCellClick={handleCellClick} currentPlayer={0} />)
    
    // 验证是否添加了resize事件监听器
    expect(resizeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    
    // 清理
    resizeSpy.mockRestore()
  })
})
