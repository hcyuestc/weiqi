import { GameState } from '../types/weiqi'

// 游戏记录类型定义
export interface GameRecord {
  id: string
  timestamp: number
  name: string
  gameState: GameState
  gameMode: 'human' | 'ai'
  difficulty?: 'easy' | 'medium' | 'hard' | 'leela'
}

/**
 * 存储服务类，负责游戏记录的保存、加载和管理
 */
class StorageService {
  private readonly STORAGE_KEY = 'weiqi_game_records'

  /**
   * 保存游戏记录
   * @param name 游戏记录名称
   * @param gameState 游戏状态
   * @param gameMode 游戏模式
   * @param difficulty AI难度（如果适用）
   * @returns 保存的游戏记录ID
   */
  saveGameRecord(name: string, gameState: GameState, gameMode: 'human' | 'ai', difficulty?: 'easy' | 'medium' | 'hard' | 'leela'): string {
    try {
      const recordId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newRecord: GameRecord = {
        id: recordId,
        timestamp: Date.now(),
        name,
        gameState,
        gameMode,
        difficulty
      }

      // 获取现有记录
      const records = this.getGameRecords()
      
      // 添加新记录
      records.push(newRecord)
      
      // 保存到本地存储
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records))
      
      return recordId
    } catch (error) {
      console.error('保存游戏记录失败:', error)
      throw new Error('保存游戏记录失败')
    }
  }

  /**
   * 获取所有游戏记录
   * @returns 游戏记录列表
   */
  getGameRecords(): GameRecord[] {
    try {
      const recordsJson = localStorage.getItem(this.STORAGE_KEY)
      if (!recordsJson) {
        return []
      }
      return JSON.parse(recordsJson)
    } catch (error) {
      console.error('读取游戏记录失败:', error)
      return []
    }
  }

  /**
   * 根据ID获取游戏记录
   * @param id 游戏记录ID
   * @returns 游戏记录对象或undefined
   */
  getGameRecordById(id: string): GameRecord | undefined {
    const records = this.getGameRecords()
    return records.find(record => record.id === id)
  }

  /**
   * 删除游戏记录
   * @param id 游戏记录ID
   * @returns 是否删除成功
   */
  deleteGameRecord(id: string): boolean {
    try {
      let records = this.getGameRecords()
      const initialLength = records.length
      
      records = records.filter(record => record.id !== id)
      
      if (records.length === initialLength) {
        return false // 没有找到要删除的记录
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records))
      return true
    } catch (error) {
      console.error('删除游戏记录失败:', error)
      return false
    }
  }

  /**
   * 清空所有游戏记录
   */
  clearAllGameRecords(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('清空游戏记录失败:', error)
      throw new Error('清空游戏记录失败')
    }
  }

  /**
   * 导出游戏记录为JSON文件
   * @param recordId 游戏记录ID
   */
  exportGameRecord(recordId: string): void {
    const record = this.getGameRecordById(recordId)
    if (!record) {
      throw new Error('找不到指定的游戏记录')
    }

    try {
      // 创建JSON字符串
      const recordJson = JSON.stringify(record, null, 2)
      
      // 创建Blob对象
      const blob = new Blob([recordJson], { type: 'application/json' })
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `weiqi_game_${record.name.replace(/\s+/g, '_')}_${new Date(record.timestamp).toISOString().slice(0, 10)}.json`
      
      // 触发下载
      document.body.appendChild(a)
      a.click()
      
      // 清理
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出游戏记录失败:', error)
      throw new Error('导出游戏记录失败')
    }
  }

  /**
   * 从JSON文件导入游戏记录
   * @param file JSON文件对象
   * @returns Promise，解析为导入的游戏记录
   */
  importGameRecord(file: File): Promise<GameRecord> {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith('.json')) {
        reject(new Error('请选择JSON文件'))
        return
      }

      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          if (!event.target?.result) {
            throw new Error('文件读取失败')
          }
          
          const record: GameRecord = JSON.parse(event.target.result as string)
          
          // 验证记录格式
          if (!record.id || !record.gameState || !record.timestamp) {
            throw new Error('无效的游戏记录格式')
          }
          
          // 生成新ID避免冲突
          record.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          record.name = `${record.name} (导入)`
          
          // 保存导入的记录
          const records = this.getGameRecords()
          records.push(record)
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records))
          
          resolve(record)
        } catch (error) {
          reject(new Error('导入失败：无效的游戏记录文件'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      
      reader.readAsText(file)
    })
  }
}

// 导出单例实例
export default new StorageService()
