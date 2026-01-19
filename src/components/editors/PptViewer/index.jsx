import React, { useState, useEffect } from 'react'
import './style.css'

function PptViewer({ data }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const slides = data?.slides || []

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        setCurrentSlide(s => Math.max(0, s - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        setCurrentSlide(s => Math.min(slides.length - 1, s + 1))
      } else if (e.key === 'Home') {
        e.preventDefault()
        setCurrentSlide(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setCurrentSlide(slides.length - 1)
      } else if (e.key === 'Escape') {
        setIsFullscreen(false)
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(f => !f)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div className="ppt-viewer">
        <div className="ppt-empty">
          <span className="empty-icon">📽️</span>
          <p>无法解析此 PPT 文件</p>
          <p className="empty-hint">
            提示：纯前端对 PPTX 的支持有限，仅能提取文本内容。<br/>
            复杂的图表、图片、动画等无法显示。
          </p>
        </div>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div className={`ppt-viewer ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="ppt-main">
        <div className="ppt-toolbar">
          <div className="toolbar-left">
            <button onClick={() => setCurrentSlide(0)} disabled={currentSlide === 0}>
              ⏮ 首页
            </button>
            <button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0}>
              ◀ 上一页
            </button>
            <span className="slide-counter">
              {currentSlide + 1} / {slides.length}
            </span>
            <button onClick={() => setCurrentSlide(s => Math.min(slides.length - 1, s + 1))} disabled={currentSlide === slides.length - 1}>
              下一页 ▶
            </button>
            <button onClick={() => setCurrentSlide(slides.length - 1)} disabled={currentSlide === slides.length - 1}>
              末页 ⏭
            </button>
          </div>
          <div className="toolbar-right">
            <button onClick={() => setIsFullscreen(f => !f)}>
              {isFullscreen ? '⛶ 退出全屏' : '⛶ 全屏'}
            </button>
          </div>
        </div>

        <div className="ppt-slide-area">
          <div className="ppt-slide">
            {currentSlideData.title && (
              <div className="slide-title">{currentSlideData.title}</div>
            )}
            {currentSlideData.content && currentSlideData.content.length > 0 && (
              <div className="slide-content">
                {currentSlideData.content.map((item, index) => (
                  <div key={index} className={`content-item ${item.type}`}>
                    {item.type === 'bullet' ? (
                      <span className="bullet">•</span>
                    ) : item.type === 'numbered' ? (
                      <span className="number">{index + 1}.</span>
                    ) : null}
                    <span className="text">{item.text}</span>
                  </div>
                ))}
              </div>
            )}
            {currentSlideData.images && currentSlideData.images.length > 0 && (
              <div className="slide-images">
                {currentSlideData.images.map((img, index) => (
                  <img key={index} src={img.src} alt={img.alt || ''} />
                ))}
              </div>
            )}
            {!currentSlideData.title && (!currentSlideData.content || currentSlideData.content.length === 0) && (
              <div className="slide-empty">
                <p>此幻灯片无可显示的文本内容</p>
                <p className="hint">可能包含图片或图表等复杂元素</p>
              </div>
            )}
          </div>
        </div>

        <div className="ppt-hint">
          使用 ← → 方向键或点击按钮切换幻灯片 | 按 F 全屏 | 按 ESC 退出全屏
        </div>
      </div>

      {!isFullscreen && (
        <div className="ppt-sidebar">
          <div className="sidebar-title">幻灯片列表</div>
          <div className="thumbnails-scroll">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`thumbnail ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              >
                <div className="thumbnail-number">{index + 1}</div>
                <div className="thumbnail-preview">
                  {slide.title ? (
                    <div className="preview-title">{slide.title}</div>
                  ) : (
                    <div className="preview-empty">幻灯片 {index + 1}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PptViewer