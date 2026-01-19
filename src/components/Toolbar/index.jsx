import React from 'react'
import { exportFile } from '../../utils/exportHandlers'
import './style.css'

function Toolbar({ onSave, onUndo, onRedo, canUndo, canRedo, mode, fileData, fileName }) {
  
  const handleExport = async (format) => {
    try {
      await exportFile(fileData, fileName, mode, format)
    } catch (err) {
      alert('导出失败: ' + err.message)
    }
  }

  const getExportOptions = () => {
    switch (mode) {
      case 'excel':
        return [
          { label: '导出 XLSX', format: 'xlsx' },
          { label: '导出 CSV', format: 'csv' }
        ]
      case 'word':
        return [
          { label: '导出 DOCX', format: 'docx' },
          { label: '导出 HTML', format: 'html' }
        ]
      case 'markdown':
        return [
          { label: '导出 MD', format: 'md' },
          { label: '导出 HTML', format: 'html' }
        ]
      default:
        return []
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button 
          className="toolbar-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="撤销 (Ctrl+Z)"
        >
          ↩️ 撤销
        </button>
        <button 
          className="toolbar-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="重做 (Ctrl+Y)"
        >
          ↪️ 重做
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className="toolbar-btn primary"
          onClick={onSave}
          title="保存 (Ctrl+S)"
        >
          💾 保存
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        {getExportOptions().map(opt => (
          <button
            key={opt.format}
            className="toolbar-btn"
            onClick={() => handleExport(opt.format)}
          >
            📥 {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Toolbar