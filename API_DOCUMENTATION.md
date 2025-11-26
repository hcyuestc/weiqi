# API 文档

本文档详细介绍了围棋游戏项目中的核心API、组件接口和使用方法。

## 目录

- [核心引擎 API](#核心引擎-api)
  - [Game 类](#game-类)
  - [Board 类](#board-类)
  - [AIController 类](#aicontroller-类)
- [存储服务 API](#存储服务-api)
  - [StorageService 类](#storageservice-类)
- [React 组件](#react-组件)
  - [Board 组件](#board-组件)
  - [GameControls 组件](#gamecontrols-组件)
  - [GameRecordManager 组件](#gamerecordmanager-组件)
- [类型定义](#类型定义)

## 核心引擎 API

### Game 类

#### 构造函数

```typescript
constructor(size: number = 19)
```

- **参数**：
  - `size`: 棋盘大小，默认为19

#### 方法

##### placeStone

```typescript
placeStone(row: number, col: number): boolean
```

在指定位置放置当前玩家的棋子。

- **参数**：
  - `row`: 行索引
  - `col`: 列索引
- **返回值**：如果落子成功返回`true`，否则返回`false`

##### getCurrentPlayer

```typescript
getCurrentPlayer(): Player
```

获取当前玩家（'black'或'white'）。

- **返回值**：当前玩家

##### undoMove

```typescript
undoMove(): boolean
```

撤销上一步操作。

- **返回值**：如果撤销成功返回`true`，否则返回`false`

##### resetGame

```typescript
resetGame(): void
```

重置游戏到初始状态。

##### calculateScore

```typescript
calculateScore(): { black: number; white: number }
```

计算当前得分。

- **返回值**：包含黑方和白方得分的对象

##### getState

```typescript
getState(): GameState
```

获取当前游戏状态。

- **返回值**：游戏状态对象

##### setState

```typescript
setState(state: GameState): void
```

从给定状态恢复游戏。

- **参数**：
  - `state`: 游戏状态对象

### Board 类

#### 构造函数

```typescript
constructor(size: number)
```

- **参数**：
  - `size`: 棋盘大小

#### 方法

##### getCell

```typescript
getCell(row: number, col: number): Player | null
```

获取指定位置的棋子。

- **参数**：
  - `row`: 行索引
  - `col`: 列索引
- **返回值**：棋子颜色（'black'、'white'）或`null`（空）

##### setCell

```typescript
setCell(row: number, col: number, player: Player | null): void
```

设置指定位置的棋子。

- **参数**：
  - `row`: 行索引
  - `col`: 列索引
  - `player`: 棋子颜色或`null`

##### getSize

```typescript
getSize(): number
```

获取棋盘大小。

- **返回值**：棋盘大小

##### isWithinBounds

```typescript
isWithinBounds(row: number, col: number): boolean
```

检查指定位置是否在棋盘范围内。

- **参数**：
  - `row`: 行索引
  - `col`: 列索引
- **返回值**：如果在范围内返回`true`

### AIController 类

#### 构造函数

```typescript
constructor(board: Board, difficulty: 'easy' | 'medium' | 'hard' = 'medium')
```

- **参数**：
  - `board`: Board实例
  - `difficulty`: AI难度级别，默认为'medium'

#### 方法

##### makeMove

```typescript
makeMove(currentPlayer: Player): { row: number; col: number } | null
```

AI生成下一步走法。

- **参数**：
  - `currentPlayer`: 当前玩家（AI的颜色）
- **返回值**：包含行和列的走法对象，或`null`（无法移动）

##### setDifficulty

```typescript
setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void
```

设置AI难度。

- **参数**：
  - `difficulty`: 难度级别

## 存储服务 API

### StorageService 类

#### 静态方法

##### saveGameRecord

```typescript
static saveGameRecord(name: string, gameState: GameState, gameMode: 'human' | 'ai', difficulty?: 'easy' | 'medium' | 'hard'): void
```

保存游戏记录。

- **参数**：
  - `name`: 记录名称
  - `gameState`: 游戏状态
  - `gameMode`: 游戏模式
  - `difficulty`: AI难度（仅当模式为人机时需要）

##### loadGameRecord

```typescript
static loadGameRecord(id: string): GameRecord
```

加载指定ID的游戏记录。

- **参数**：
  - `id`: 记录ID
- **返回值**：游戏记录对象

##### getAllGameRecords

```typescript
static getAllGameRecords(): GameRecord[]
```

获取所有游戏记录。

- **返回值**：游戏记录数组

##### deleteGameRecord

```typescript
static deleteGameRecord(id: string): void
```

删除指定ID的游戏记录。

- **参数**：
  - `id`: 记录ID

##### clearAllGameRecords

```typescript
static clearAllGameRecords(): void
```

清空所有游戏记录。

##### exportGameRecord

```typescript
static exportGameRecord(id: string): void
```

导出指定ID的游戏记录为JSON文件。

- **参数**：
  - `id`: 记录ID

##### importGameRecords

```typescript
static importGameRecords(jsonContent: string): GameRecord[]
```

从JSON内容导入游戏记录。

- **参数**：
  - `jsonContent`: JSON格式的游戏记录内容
- **返回值**：导入的游戏记录数组

## React 组件

### Board 组件

```tsx
<Board 
  size={19} 
  game={game} 
  onCellClick={handleCellClick}
/>
```

#### 属性

- `size`: 棋盘大小
- `game`: Game实例
- `onCellClick`: 单元格点击回调函数

### GameControls 组件

```tsx
<GameControls 
  onUndo={handleUndo} 
  onReset={handleReset} 
  onCalculateScore={handleCalculateScore}
  canUndo={canUndo}
  currentPlayer={currentPlayer}
/>
```

#### 属性

- `onUndo`: 悔棋按钮点击回调
- `onReset`: 重置按钮点击回调
- `onCalculateScore`: 计算分数按钮点击回调
- `canUndo`: 是否可以悔棋
- `currentPlayer`: 当前玩家

### GameRecordManager 组件

```tsx
<GameRecordManager 
  onSaveGame={handleSaveGame} 
  onLoadGame={handleLoadGame}
  showNotification={showNotification}
/>
```

#### 属性

- `onSaveGame`: 保存游戏回调
- `onLoadGame`: 加载游戏回调
- `showNotification`: 显示通知回调（可选）

## 类型定义

### Player

```typescript
type Player = 'black' | 'white';
```

### GameState

```typescript
interface GameState {
  board: (Player | null)[][];
  currentPlayer: Player;
  moveHistory: { row: number; col: number; capturedStones?: { row: number; col: number }[] }[];
  koPosition: { row: number; col: number } | null;
  lastMove: { row: number; col: number } | null;
}
```

### GameRecord

```typescript
interface GameRecord {
  id: string;
  name: string;
  timestamp: number;
  gameState: GameState;
  gameMode: 'human' | 'ai';
  difficulty?: 'easy' | 'medium' | 'hard';
}

### NotificationType

```typescript
type NotificationType = 'success' | 'error' | 'warning' | 'info';
```

## 使用示例

### 创建游戏实例

```typescript
import { Game, AIController } from './engine';

// 创建一个19x19的围棋游戏
const game = new Game(19);

// 创建AI控制器（中等难度）
const aiController = new AIController(game.getBoard(), 'medium');

// 玩家落子
const success = game.placeStone(9, 9);

// AI落子
if (game.getCurrentPlayer() === 'white') { // 假设AI是白方
  const aiMove = aiController.makeMove('white');
  if (aiMove) {
    game.placeStone(aiMove.row, aiMove.col);
  }
}

// 悔棋
game.undoMove();

// 计算得分
const score = game.calculateScore();
console.log(`黑方得分: ${score.black}, 白方得分: ${score.white}`);
```

### 保存和加载游戏

```typescript
import { StorageService } from './engine/StorageService';

// 保存游戏
const gameState = game.getState();
StorageService.saveGameRecord('我的游戏', gameState, 'ai', 'medium');

// 加载游戏
const allRecords = StorageService.getAllGameRecords();
const record = StorageService.loadGameRecord(allRecords[0].id);
game.setState(record.gameState);
```

### React组件使用

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Game } from './engine/Game';
import Board from './components/Board';
import GameControls from './components/GameControls';

function App() {
  const [game, setGame] = useState(() => new Game(19));
  
  const handleCellClick = useCallback((row: number, col: number) => {
    const newGame = new Game(19);
    newGame.setState(game.getState());
    const success = newGame.placeStone(row, col);
    if (success) {
      setGame(newGame);
    }
  }, [game]);
  
  const handleUndo = useCallback(() => {
    const newGame = new Game(19);
    newGame.setState(game.getState());
    if (newGame.undoMove()) {
      setGame(newGame);
    }
  }, [game]);
  
  const handleReset = useCallback(() => {
    setGame(new Game(19));
  }, []);
  
  return (
    <div className="game-container">
      <h1>围棋游戏</h1>
      <Board 
        size={19} 
        game={game} 
        onCellClick={handleCellClick}
      />
      <GameControls 
        onUndo={handleUndo} 
        onReset={handleReset} 
        canUndo={game.getMoveHistory().length > 0}
        currentPlayer={game.getCurrentPlayer()}
      />
    </div>
  );
}

export default App;
```

## 注意事项

1. **棋盘索引**：棋盘索引从0开始
2. **游戏规则**：实现了标准围棋规则，包括落子、提子、禁止自杀和打劫
3. **性能考虑**：对于大型棋盘(19x19)，某些操作可能会有性能开销
4. **存储限制**：使用localStorage存储游戏记录，有大小限制（通常为5-10MB）