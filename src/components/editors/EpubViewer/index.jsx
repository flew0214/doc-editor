import React, { useState, useEffect, useCallback } from 'react'
import JSZip from 'jszip'
import './style.css'

function EpubViewer({ data }) {
  const [chapters, setChapters] = useState([])
  const [currentChapter, setCurrentChapter] = useState(0)
  const [toc, setToc] = useState([])
  const [metadata, setMetadata] = useState({})
  const [fontSize, setFontSize] = useState(16)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (data?.chapters) {
      setChapters(data.chapters)
      setToc(data.toc || [])
      setMetadata(data.metadata || {})
      setLoading(false)
    }
  }, [data])

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        setCurrentChapter(c => Math.max(0, c - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        setCurrentChapter(c => Math.min(chapters.length - 1, c + 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [chapters.length])

  const currentContent = chapters[currentChapter]

  if (loading) {
    return (
      <div className="epub-viewer">
        <div className="epub-loading">
          <div className="spinner"></div>
          <span>加载中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="epub-viewer">
        <div className="epub-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="epub-viewer">
      {/* 侧边栏 - 目录 */}
      <div className="epub-sidebar">
        <div className="epub-meta">
          {metadata.cover && (
            <img src={metadata.cover} alt="封面" className="epub-cover" />
          )}
          <h2 className="epub-title">{metadata.title || '未知书名'}</h2>
          {metadata.creator && (
            <p className="epub-author">作者: {metadata.creator}</p>
          )}
        </div>
        
        <div className="epub-toc">
          <h3>目录</h3>
          <ul>
            {chapters.map((chapter, index) => (
              <li
                key={index}
                className={currentChapter === index ? 'active' : ''}
                onClick={() => setCurrentChapter(index)}
              >
                <span className="chapter-num">{index + 1}</span>
                <span className="chapter-title">
                  {chapter.title || `章节 ${index + 1}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="epub-main">
        <div className="epub-toolbar">
          <div className="toolbar-left">
            <button
              onClick={() => setCurrentChapter(c => Math.max(0, c - 1))}
              disabled={currentChapter === 0}
            >
              ◀ 上一章
            </button>
            <span className="chapter-info">
              {currentChapter + 1} / {chapters.length}
            </span>
            <button
              onClick={() => setCurrentChapter(c => Math.min(chapters.length - 1, c + 1))}
              disabled={currentChapter === chapters.length - 1}
            >
              下一章 ▶
            </button>
          </div>
          
          <div className="toolbar-right">
            <span className="font-label">字号:</span>
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))}>A-</button>
            <span className="font-size">{fontSize}px</span>
            <button onClick={() => setFontSize(s => Math.min(28, s + 2))}>A+</button>
          </div>
        </div>

        <div className="epub-content-wrapper">
          <div 
            className="epub-content"
            style={{ fontSize: `${fontSize}px` }}
          >
            {currentContent?.title && (
              <h1 className="content-title">{currentContent.title}</h1>
            )}
            <div 
              className="content-body"
              dangerouslySetInnerHTML={{ __html: currentContent?.html || '' }}
            />
          </div>
        </div>

        <div className="epub-footer">
          使用 ← → 方向键翻页
        </div>
      </div>
    </div>
  )
}

export default EpubViewer