import React, { useState, useEffect } from 'react'
import StorageService, { GameRecord } from '../engine/StorageService'
import { GameState } from '../types/weiqi'
import './GameRecordManager.css'

interface GameRecordManagerProps {
  onLoadGame: (gameState: GameState, gameMode: 'human' | 'ai', difficulty?: 'easy' | 'medium' | 'hard' | 'leela') => void
  onSaveGame: (name: string) => void
  showNotification?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
}

const GameRecordManager: React.FC<GameRecordManagerProps> = React.memo(({ onLoadGame, onSaveGame, showNotification }) => {
  const [records, setRecords] = useState<GameRecord[]>([])
  const [showModal, setShowModal] = useState(false)
  const [recordName, setRecordName] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 加载游戏记录列表
  const loadRecords = () => {
    const gameRecords = StorageService.getGameRecords()
    // 按时间倒序排序，最新的在前面
    gameRecords.sort((a, b) => b.timestamp - a.timestamp)
    setRecords(gameRecords)
  }

  useEffect(() => {
    loadRecords()
  }, [showModal])

  // 保存当前游戏
  const handleSaveGame = () => {
    if (!recordName.trim()) {
      displayNotification('请输入游戏名称', 'error')
      return
    }

    try {
      // 使用父组件传递的保存函数
      onSaveGame(recordName)
      setRecordName('')
      loadRecords()
      displayNotification('游戏保存成功', 'success')
    } catch (error) {
      displayNotification('保存失败', 'error')
    }
  }

  // 加载游戏
  const handleLoadGame = (record: GameRecord) => {
    onLoadGame(record.gameState, record.gameMode, record.difficulty)
    setShowModal(false)
    displayNotification('游戏加载成功', 'success')
  }

  // 删除游戏记录
  const handleDeleteGame = (id: string) => {
    if (window.confirm('确定要删除这条游戏记录吗？')) {
      const success = StorageService.deleteGameRecord(id)
      if (success) {
        loadRecords()
        displayNotification('游戏记录已删除', 'success')
      } else {
        displayNotification('删除失败', 'error')
      }
    }
  }

  // 导出游戏记录
  const handleExportGame = (id: string) => {
    try {
      StorageService.exportGameRecord(id)
      displayNotification('游戏记录导出成功', 'success')
    } catch (error) {
      displayNotification('导出失败', 'error')
    }
  }

  // 导入游戏记录
  const handleImportGame = async () => {
    if (!importFile) {
      displayNotification('请选择要导入的文件', 'error')
      return
    }

    setIsLoading(true)
    try {
      await StorageService.importGameRecord(importFile)
      loadRecords()
      setImportFile(null)
      document.getElementById('import-file-input')?.setAttribute('value', '')
      displayNotification('游戏记录导入成功', 'success')
    } catch (error: any) {
      displayNotification(error.message || '导入失败', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 显示通知
  const displayNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    if (showNotification) {
      showNotification(message, type)
    }
  }

  // 文件选择处理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0])
    }
  }

  return (
    <div className="game-record-manager">
      <button className="record-button" onClick={() => setShowModal(true)}>
        游戏记录
      </button>

      {/* 通知现在由父组件管理 */}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>游戏记录管理</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* 保存游戏表单 */}
              <div className="save-game-section">
                <h3>保存当前游戏</h3>
                <div className="save-form">
                  <input
                    type="text"
                    placeholder="输入游戏名称"
                    value={recordName}
                    onChange={(e) => setRecordName(e.target.value)}
                    className="record-name-input"
                  />
                  <button onClick={handleSaveGame} className="save-button">
                    保存
                  </button>
                </div>
              </div>

              {/* 导入游戏 */}
              <div className="import-game-section">
                <h3>导入游戏记录</h3>
                <div className="import-form">
                  <input
                    type="file"
                    id="import-file-input"
                    accept=".json"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="import-file-input" className="file-label">
                    选择文件
                  </label>
                  {importFile && (
                    <span className="file-name">{importFile.name}</span>
                  )}
                  <button 
                    onClick={handleImportGame} 
                    className="import-button"
                    disabled={isLoading}
                  >
                    {isLoading ? '导入中...' : '导入'}
                  </button>
                </div>
              </div>

              {/* 游戏记录列表 */}
              <div className="records-list-section">
                <h3>已保存的游戏</h3>
                {records.length === 0 ? (
                  <p className="no-records">暂无保存的游戏记录</p>
                ) : (
                  <div className="records-list">
                    {records.map((record) => (
                      <div key={record.id} className="record-item">
                        <div className="record-info">
                          <div className="record-name">{record.name}</div>
                          <div className="record-meta">
                            <span>{formatDate(record.timestamp)}</span>
                            <span>{record.gameMode === 'ai' ? `AI对战 (${record.difficulty})` : '人人对战'}</span>
                          </div>
                        </div>
                        <div className="record-actions">
                          <button onClick={() => handleLoadGame(record)} className="action-button load">
                            加载
                          </button>
                          <button onClick={() => handleExportGame(record.id)} className="action-button export">
                            导出
                          </button>
                          <button onClick={() => handleDeleteGame(record.id)} className="action-button delete">
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default GameRecordManager;
