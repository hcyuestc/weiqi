import Game from './Game'
import { Position, Stone } from '../types/weiqi'
import { LeelaZeroService } from './LeelaZeroService'

// MCTS节点类
class MCTSNode {
  state: Stone[][]
  parent: MCTSNode | null
  children: MCTSNode[]
  visits: number
  wins: number
  untriedActions: Position[]
  playerJustMoved: Stone
  aiController: AIController | null

  constructor(
    state: Stone[][],
    parent: MCTSNode | null = null,
    playerJustMoved: Stone = 0, // 默认黑棋先行
    aiController: AIController | null = null
  ) {
    this.state = state
    this.parent = parent
    this.children = []
    this.visits = 0
    this.wins = 0
    this.aiController = aiController
    this.untriedActions = this.getLegalActions(state, aiController)
    this.playerJustMoved = playerJustMoved
  }

  // 获取合法动作
  private getLegalActions(state: Stone[][], aiController: AIController | null = null): Position[] {
    const actions: Position[] = []
    const boardSize = state.length
    
    // 如果有AIController引用，使用模式识别评估位置价值
    if (aiController) {
      // 创建带评分的动作数组
      const scoredActions: { position: Position, score: number }[] = []
      
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (state[i][j] === -1) {
            // 使用模式识别评估位置价值
            const score = aiController.evaluatePosition(state, i, j, this.playerJustMoved === 0 ? 1 : 0)
            scoredActions.push({ position: { x: i, y: j }, score })
          }
        }
      }
      
      // 按评分排序，高分在前
      scoredActions.sort((a, b) => b.score - a.score)
      
      // 提取排序后的动作
      for (const scoredAction of scoredActions) {
        actions.push(scoredAction.position)
      }
    } else {
      // 如果没有AIController引用，使用简单的遍历方式
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (state[i][j] === -1) {
            // 简化的合法性检查（实际围棋规则更复杂）
            // 这里可以添加更复杂的检查，如自杀检查、打劫检查等
            actions.push({ x: i, y: j })
          }
        }
      }
    }
    
    // 如果没有合法动作，返回包含一个pass动作的数组
    if (actions.length === 0) {
      actions.push({ x: -1, y: -1 }) // pass动作
    }
    
    return actions
  }



  // 选择阶段：使用UCT算法选择子节点
  selectChild(): MCTSNode {
    let selectedNode: MCTSNode | null = null
    let bestValue = -Infinity

    for (const child of this.children) {
      // 使用UCT算法计算节点的值
      const uctValue = this.calculateUCT(child)
      
      if (uctValue > bestValue) {
        selectedNode = child
        bestValue = uctValue
      }
    }

    if (!selectedNode) {
      throw new Error('No child nodes available for selection')
    }

    return selectedNode
  }

  // 计算UCT值
  private calculateUCT(node: MCTSNode): number {
    if (node.visits === 0) return Infinity
    
    // 使用动态调整的探索参数，随着访问次数增加而减少
    // 这样可以在搜索初期更注重探索，后期更注重利用
    const explorationParameter = Math.max(0.5, 1.41 - (node.visits / 1000))
    return (
      node.wins / node.visits +
      explorationParameter * Math.sqrt(Math.log(this.visits) / node.visits)
    )
  }

  // 扩展阶段：添加新的子节点
  addChild(state: Stone[][], move: Position, playerJustMoved: Stone, aiController: AIController | null = null): MCTSNode {
    const newNode = new MCTSNode(state, this, playerJustMoved, aiController)
    this.untriedActions = this.untriedActions.filter(
      action => !(action.x === move.x && action.y === move.y)
    )
    this.children.push(newNode)
    return newNode
  }

  // 模拟阶段：随机游玩直到游戏结束
  simulateRandomPlay(initialState: Stone[][], initialPlayer: Stone, simpleCapture: (board: Stone[][], x: number, y: number, player: Stone) => void, copyBoard: (board: Stone[][]) => Stone[][]): number {
    let state = copyBoard(initialState)
    let currentPlayer = initialPlayer
    let moveCount = 0
    const maxMoves = 361 // 19x19棋盘的最大步数
    
    // 改进的模拟过程
    while (moveCount < maxMoves) {
      // 获取合法动作
      const legalMoves = this.getLegalActions(state, this.aiController)
      
      // 如果没有合法移动，游戏结束
      if (legalMoves.length === 0 || (legalMoves.length === 1 && legalMoves[0].x === -1)) {
        break
      }
      
      // 使用启发式策略选择动作，而不是完全随机
      let selectedMove: Position;
      
      // 有一定概率选择更好的动作（而不是完全随机）
      if (Math.random() < 0.7) { // 70%的概率使用启发式选择
        // 优先选择能提子的动作
        let captureMoves: Position[] = [];
        let defensiveMoves: Position[] = [];
        let neutralMoves: Position[] = [];
        
        for (const move of legalMoves) {
          // pass动作特殊处理
          if (move.x === -1 && move.y === -1) {
            neutralMoves.push(move);
            continue;
          }
          
          // 模拟落子
          const testState = copyBoard(state);
          testState[move.x][move.y] = currentPlayer;
          
          // 检查是否能提子
          let capturesOpponent = false;
          let defendsOwn = false;
          
          // 简化的提子检查
          const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [dx, dy] of directions) {
            const nx = move.x + dx;
            const ny = move.y + dy;
            
            if (nx >= 0 && nx < testState.length && ny >= 0 && ny < testState.length) {
              // 检查是否能提走对手棋子
              if (testState[nx][ny] === (currentPlayer === 0 ? 1 : 0)) {
                // 简化检查：如果对手棋子旁边没有气，则可以提走
                let hasLiberty = false;
                for (const [ddx, ddy] of directions) {
                  const nnx = nx + ddx;
                  const nny = ny + ddy;
                  
                  if (nnx >= 0 && nnx < testState.length && nny >= 0 && nny < testState.length) {
                    if (testState[nnx][nny] === -1) {
                      hasLiberty = true;
                      break;
                    }
                  }
                }
                
                if (!hasLiberty) {
                  capturesOpponent = true;
                }
              }
              
              // 检查是否能保护自己的棋子
              if (testState[nx][ny] === currentPlayer) {
                // 检查自己的棋子是否需要保护
                let ownHasLiberty = false;
                for (const [ddx, ddy] of directions) {
                  const nnx = nx + ddx;
                  const nny = ny + ddy;
                  
                  if (nnx >= 0 && nnx < testState.length && nny >= 0 && nny < testState.length) {
                    if (testState[nnx][nny] === -1) {
                      ownHasLiberty = true;
                      break;
                    }
                  }
                }
                
                if (!ownHasLiberty) {
                  defendsOwn = true;
                }
              }
            }
          }
          
          if (capturesOpponent) {
            captureMoves.push(move);
          } else if (defendsOwn) {
            defensiveMoves.push(move);
          } else {
            neutralMoves.push(move);
          }
        }
        
        // 根据优先级选择动作
        if (captureMoves.length > 0) {
          selectedMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
        } else if (defensiveMoves.length > 0) {
          selectedMove = defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)];
        } else {
          selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }
      } else {
        // 30%的概率完全随机选择
        selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      }
      
      // 执行选择的动作
      if (selectedMove.x >= 0 && selectedMove.y >= 0) {
        state[selectedMove.x][selectedMove.y] = currentPlayer;
        
        // 应用提子逻辑
        simpleCapture(state, selectedMove.x, selectedMove.y, currentPlayer);
      }
      
      // 切换玩家
      currentPlayer = currentPlayer === 0 ? 1 : 0;
      moveCount++;
    }
    
    // 使用更完善的评估函数
    const score = this.evaluateBoard(state);
    
    // 返回结果：1表示AI胜利，0表示对手胜利
    // 假设AI是白棋（1）
    return score > 0 ? 1 : 0;
  }

  // 评估棋盘局面
  private evaluateBoard(board: Stone[][]): number {
    let score = 0
    const boardSize = board.length
    
    // 1. 计算棋子数量
    let blackCount = 0
    let whiteCount = 0
    
    // 2. 计算控制的区域（简化的围空计算）
    let blackTerritory = 0
    let whiteTerritory = 0
    
    // 3. 计算棋子的气（灵活性）
    let blackLiberties = 0
    let whiteLiberties = 0
    
    // 4. 计算势力范围（影响区域）
    let blackInfluence = 0
    let whiteInfluence = 0
    
    // 5. 关键位置权重（角落、边缘、中心）
    let blackKeyPositions = 0
    let whiteKeyPositions = 0
    
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === 0) {
          blackCount++
        } else if (board[i][j] === 1) {
          whiteCount++
        }
        
        // 计算势力范围和关键位置
        if (board[i][j] === -1) {
          let blackNearby = 0
          let whiteNearby = 0
          const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
          
          for (const [dx, dy] of directions) {
            const nx = i + dx
            const ny = j + dy
            
            if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
              if (board[nx][ny] === 0) blackNearby++
              else if (board[nx][ny] === 1) whiteNearby++
            }
          }
          
          // 影响力计算
          blackInfluence += blackNearby * 0.5
          whiteInfluence += whiteNearby * 0.5
          
          // 如果只有一方有影响力，则认为该点属于该方的领域
          if (blackNearby > 0 && whiteNearby === 0) blackTerritory++
          else if (whiteNearby > 0 && blackNearby === 0) whiteTerritory++
          
          // 关键位置权重（角落价值更高，边缘其次）
          if ((i === 0 || i === boardSize - 1) && (j === 0 || j === boardSize - 1)) {
            // 角落
            if (blackNearby > whiteNearby) blackKeyPositions += 3
            else if (whiteNearby > blackNearby) whiteKeyPositions += 3
          } else if (i === 0 || i === boardSize - 1 || j === 0 || j === boardSize - 1) {
            // 边缘
            if (blackNearby > whiteNearby) blackKeyPositions += 1
            else if (whiteNearby > blackNearby) whiteKeyPositions += 1
          }
        }
        
        // 计算棋子的气和影响力
        if (board[i][j] === 0 || board[i][j] === 1) {
          const player = board[i][j]
          const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
          let liberties = 0
          let influence = 0
          
          for (const [dx, dy] of directions) {
            const nx = i + dx
            const ny = j + dy
            
            if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
              if (board[nx][ny] === -1) liberties++
              
              // 计算对周围空点的影响力
              if (board[nx][ny] === -1 || board[nx][ny] === (player === 0 ? 1 : 0)) {
                influence++
              }
            }
          }
          
          if (player === 0) {
            blackLiberties += liberties
            blackInfluence += influence * 0.3
          } else {
            whiteLiberties += liberties
            whiteInfluence += influence * 0.3
          }
        }
      }
    }
    
    // 综合评估：棋子数量 + 领域控制 + 气的数量 + 影响力 + 关键位置
    // 假设AI是白棋（1）
    score = (whiteCount * 1.0 + 
             whiteTerritory * 1.5 + 
             whiteLiberties * 0.3 + 
             whiteInfluence * 0.2 + 
             whiteKeyPositions * 2.0) - 
            (blackCount * 1.0 + 
             blackTerritory * 1.5 + 
             blackLiberties * 0.3 + 
             blackInfluence * 0.2 + 
             blackKeyPositions * 2.0)
    
    return score
  }



  // 反向传播阶段：更新从当前节点到根节点的统计信息
  update(result: number): void {
    this.visits++
    this.wins += result
  }

  // 检查是否还有未尝试的动作
  hasUntriedActions(): boolean {
    return this.untriedActions.length > 0
  }

  // 检查是否是终端节点
  isTerminal(): boolean {
    return this.untriedActions.length === 0 && this.children.length === 0
  }
}

export class AIController {
  private game: Game
  private aiLevel: 'easy' | 'medium' | 'hard' | 'leela' = 'easy'
  private leelaZeroService: LeelaZeroService

  constructor(game: Game, level: 'easy' | 'medium' | 'hard' | 'leela' = 'easy', _boardSize: number = 9, _komi: number = 6.5) {
    this.game = game
    this.aiLevel = level
    this.leelaZeroService = LeelaZeroService.getInstance()
  }

  // 设置AI难度
  setLevel(level: 'easy' | 'medium' | 'hard' | 'leela'): void {
    this.aiLevel = level
  }

  // 获取AI的下一步棋
  getNextMove(): Promise<Position | null> {
    const gameState = this.game.getState()
    const { board } = gameState
    const boardSize = board.length
    
    switch (this.aiLevel) {
      case 'easy':
        return Promise.resolve(this.getEasyMove(board, boardSize))
      case 'medium':
        return Promise.resolve(this.getMediumMove(board, boardSize))
      case 'hard':
        return Promise.resolve(this.getHardMove(board, boardSize))
      case 'leela':
        return this.getLeelaZeroMove(board, boardSize)
      default:
        return Promise.resolve(this.getEasyMove(board, boardSize))
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

  // 简化的提子逻辑
  private simpleCapture(board: Stone[][], x: number, y: number, player: Stone): void {
    const opponent = player === 0 ? 1 : 0
    const boardSize = board.length
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    
    // 检查周围的对手棋子是否被提走
    for (const [dx, dy] of directions) {
      const nx = x + dx
      const ny = y + dy
      
      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        if (board[nx][ny] === opponent) {
          // 简化检查：如果对手棋子旁边没有空位，则提走
          let hasLiberty = false
          for (const [ddx, ddy] of directions) {
            const nnx = nx + ddx
            const nny = ny + ddy
            
            if (nnx >= 0 && nnx < boardSize && nny >= 0 && nny < boardSize) {
              if (board[nnx][nny] === -1) {
                hasLiberty = true
                break
              }
            }
          }
          
          if (!hasLiberty) {
            board[nx][ny] = -1
          }
        }
      }
    }
  }

  // 困难AI：使用蒙特卡洛树搜索算法
  private getHardMove(board: Stone[][], boardSize: number): Position | null {
    // 实现MCTS算法
    return this.mctsSearch(board, boardSize)
  }

  // MCTS搜索算法
  private mctsSearch(board: Stone[][], boardSize: number): Position | null {
    const gameState = this.game.getState()
    const currentPlayer = gameState.currentPlayer
    const rootNode = new MCTSNode(board, null, currentPlayer === 0 ? 1 : 0, this)
    
    // 限制搜索时间和迭代次数
    const startTime = Date.now()
    const timeLimit = 800
    let iterations = 0
    const maxIterations = 2000
    
    // 用于跟踪最佳动作（已简化为综合评分挑选）
    
    while (Date.now() - startTime < timeLimit && iterations < maxIterations) {
      let node: MCTSNode | null = rootNode
      let state = this.copyBoard(board)
      let player = currentPlayer
      
      // 选择阶段
      while (!node.hasUntriedActions() && node.children.length > 0) {
        node = node.selectChild()
        // 在实际实现中，这里需要应用所选动作到状态
      }
      
      // 扩展阶段
      let expandedNode: MCTSNode | null = null
      if (node.hasUntriedActions()) {
        const move = node.untriedActions[Math.floor(Math.random() * node.untriedActions.length)]
        
        // 应用动作到状态（这里需要实际的围棋逻辑）
        const newState = this.copyBoard(state)
        // 只有在不是pass动作时才落子
        if (move.x >= 0 && move.y >= 0) {
          newState[move.x][move.y] = player
          // 简化的提子逻辑
          this.simpleCapture(newState, move.x, move.y, player)
        }
        
        expandedNode = node.addChild(newState, move, player, this)
        node = expandedNode
        player = player === 0 ? 1 : 0
      }
      
      // 模拟阶段
      let simulationPlayer = player
      if (expandedNode) {
        // 如果进行了扩展，模拟从扩展节点开始
    const result = node.simulateRandomPlay(node.state, simulationPlayer, this.simpleCapture.bind(this), this.copyBoard.bind(this))
        
        // 反向传播阶段
        while (node !== null) {
          // 对于当前玩家，胜利得分为1，失败为0
          // 对于对手玩家，胜利得分为0，失败为1
          const isCurrentPlayer = node.playerJustMoved !== currentPlayer
          const score = (result === 1 && currentPlayer === 1) || (result === 0 && currentPlayer === 0) ? 1 : 0
          node.update(isCurrentPlayer ? score : 1 - score)
          node = node.parent
        }
      }
      
      iterations++
    }
    
    // 选择综合考虑访问次数和胜率的子节点作为最佳动作
    if (rootNode.children.length === 0) {
      return this.getMediumMove(board, boardSize) // 如果没有子节点，退回到中等AI
    }
    
    // 找到综合评分最高的子节点（结合访问次数和胜率）
    let bestChild: MCTSNode | null = null
    let bestScore = -Infinity
    
    for (const child of rootNode.children) {
      // 计算综合评分：胜率权重0.7，访问次数权重0.3
      // 同时考虑访问次数避免选择访问次数过少但偶然胜率高的节点
      const winRate = child.visits > 0 ? child.wins / child.visits : 0
      const visitFactor = Math.sqrt(child.visits) / Math.sqrt(iterations)
      const score = 0.7 * winRate + 0.3 * visitFactor
      
      if (score > bestScore) {
        bestScore = score
        bestChild = child
      }
    }
    
    // 找到对应的移动位置
    if (bestChild) {
      // 找到与最佳子节点对应的移动
      // 通过比较父节点和子节点的状态差异来确定动作
      const parentState = rootNode.state
      const childState = bestChild.state
      
      // 查找不同的位置
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (parentState[i][j] !== childState[i][j] && childState[i][j] === currentPlayer) {
            return { x: i, y: j }
          }
        }
      }
    }
    
    // 如果无法确定最佳动作，退回到中等AI
    return this.getMediumMove(board, boardSize)
  }

  // 保留占位以便未来扩展更精细的合法移动生成

  // 检查是否形成眼位
  private isEye(board: Stone[][], x: number, y: number, player: Stone): boolean {
    // 眼位必须是空点
    if (board[x][y] !== -1) return false
    
    const boardSize = board.length
    const opponent = player === 0 ? 1 : 0
    let cornerCount = 0
    let ownedCornerCount = 0
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]] // 上下左右
    
    // 检查四个方向的角点
    for (const [dx, dy] of directions) {
      const nx = x + dx
      const ny = y + dy
      
      // 检查边界
      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        cornerCount++
        // 如果是己方棋子，则计数
        if (board[nx][ny] === player) {
          ownedCornerCount++
        }
        // 如果是对方棋子，则不可能是眼位
        else if (board[nx][ny] === opponent) {
          return false
        }
      }
    }
    
    // 如果所有角点都是己方棋子，则是眼位
    return ownedCornerCount === cornerCount
  }

  // 检查是否是真眼（更严格的判断）
  private isTrueEye(board: Stone[][], x: number, y: number, player: Stone): boolean {
    // 首先必须是眼位
    if (!this.isEye(board, x, y, player)) return false
    
    const boardSize = board.length
    let diagonalOwnedCount = 0
    let diagonalCount = 0
    const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]] // 对角线方向
    
    // 检查对角线方向
    for (const [dx, dy] of diagonals) {
      const nx = x + dx
      const ny = y + dy
      
      // 检查边界
      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        diagonalCount++
        // 如果是对角线上的己方棋子，则计数
        if (board[nx][ny] === player) {
          diagonalOwnedCount++
        }
      }
    }
    
    // 真眼的要求：至少要有3个对角线位置被己方占据
    return diagonalOwnedCount >= 3
  }

  // 评估位置的价值（结合模式识别）
  public evaluatePosition(board: Stone[][], x: number, y: number, player: Stone): number {
    let score = 0
    
    // 1. 眼位价值
    if (this.isTrueEye(board, x, y, player)) {
      score += 10 // 真眼价值很高
    } else if (this.isEye(board, x, y, player)) {
      score += 5 // 普通眼位也有一定价值
    }
    
    // 2. 角落和边缘的价值
    const boardSize = board.length
    if ((x === 0 || x === boardSize - 1) && (y === 0 || y === boardSize - 1)) {
      // 角落
      score += 3
    } else if (x === 0 || x === boardSize - 1 || y === 0 || y === boardSize - 1) {
      // 边缘
      score += 1
    }
    
    // 3. 靠近已有棋子的价值
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
    let friendlyCount = 0
    let enemyCount = 0
    
    for (const [dx, dy] of directions) {
      const nx = x + dx
      const ny = y + dy
      
      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        if (board[nx][ny] === player) {
          friendlyCount++
        } else if (board[nx][ny] === (player === 0 ? 1 : 0)) {
          enemyCount++
        }
      }
    }
    
    // 靠近友方棋子有价值，靠近敌方棋子也有攻击价值
    score += friendlyCount * 0.5
    score += enemyCount * 0.3
    
    return score
  }

  // 复制棋盘
  private copyBoard(board: Stone[][]): Stone[][] {
    return board.map(row => [...row])
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
  async makeMove(): Promise<boolean> {
    const move = await this.getNextMove()
    if (!move) {
      return false
    }
    
    const result = this.game.placeStone(move.x, move.y)
    return result.success
  }

  // 使用Leela Zero获取下一步棋
  private getLeelaZeroMove(board: Stone[][], boardSize: number): Promise<Position | null> {
    return new Promise(async (resolve) => {
      try {
        // 需要将当前棋盘状态转换为Leela Zero期望的格式
        // 这里假设Leela Zero服务期望一个二维数组，其中0表示空位，1表示黑棋，2表示白棋
        const leelaBoardState = board.map(row => 
          row.map(cell => {
            if (cell === -1) return 0; // 空位
            if (cell === 0) return 1;  // 黑棋
            if (cell === 1) return 2;  // 白棋
            return 0; // 默认空位
          })
        );
        
        // 获取当前玩家（假设AI是白棋）
        const currentPlayer = 2; // Leela Zero中白棋为2
        
        // 调用Leela Zero服务获取下一步
        const move = await this.leelaZeroService.getNextMove(leelaBoardState, currentPlayer);
        
        // 将Leela Zero的坐标转换为项目中的坐标格式
        // 这里假设Leela Zero返回的坐标是基于0的索引
        resolve({ x: move.row, y: move.col });
      } catch (error) {
        console.error('Error getting move from Leela Zero:', error);
        // 如果Leela Zero不可用，回退到困难级别AI
        resolve(this.getHardMove(board, boardSize));
      }
    });
  }
}

export default AIController
