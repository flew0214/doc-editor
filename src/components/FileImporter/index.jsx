import React, { useCallback, useState } from 'react'
import { parseFile } from '../../utils/fileHandlers'
import './style.css'

function FileImporter({ accept, onImport, mode }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await parseFile(file, mode)
      onImport(data, file.name)
    } catch (err) {
      setError(err.message || '文件解析失败')
      console.error('文件解析错误:', err)
    } finally {
      setIsLoading(false)
    }
  }, [mode, onImport])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e) => {
    const file = e.target.files[0]
    handleFile(file)
    e.target.value = '' // 重置input以允许选择相同文件
  }, [handleFile])

  return (
    <div
      className={`file-importer ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleInputChange}
        id="file-input"
        className="file-input"
      />
      <label htmlFor="file-input" className="file-label">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>解析中...</span>
          </div>
        ) : (
          <>
            <span className="upload-icon">📂</span>
            <span className="upload-text">
              拖拽文件到这里，或 <span className="link">点击选择</span>
            </span>
            <span className="upload-hint">支持格式: {accept}</span>
          </>
        )}
      </label>
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default FileImporter