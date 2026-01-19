import React from 'react'
import './style.css'

const icons = {
  excel: '📊',
  word: '📝',
  markdown: '📑',
  pdf: '📄',
  epub: '📚',
  ppt: '📽️'
}

function Sidebar({ currentMode, onModeChange, config }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">📁</span>
        <span className="logo-text">文档编辑器</span>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3>可编辑</h3>
          {Object.entries(config)
            .filter(([_, conf]) => conf.canEdit)
            .map(([key, conf]) => (
              <button
                key={key}
                className={`nav-item ${currentMode === key ? 'active' : ''}`}
                onClick={() => onModeChange(key)}
              >
                <span className="nav-icon">{icons[key]}</span>
                <span className="nav-text">{conf.name}</span>
                <span className="nav-badge">编辑</span>
              </button>
            ))}
        </div>
        
        <div className="nav-section">
          <h3>仅查看</h3>
          {Object.entries(config)
            .filter(([_, conf]) => !conf.canEdit)
            .map(([key, conf]) => (
              <button
                key={key}
                className={`nav-item ${currentMode === key ? 'active' : ''}`}
                onClick={() => onModeChange(key)}
              >
                <span className="nav-icon">{icons[key]}</span>
                <span className="nav-text">{conf.name}</span>
                <span className="nav-badge readonly">只读</span>
              </button>
            ))}
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <p>版本 1.0.0</p>
      </div>
    </aside>
  )
}

export default Sidebar