import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import './style.css'

// 使用本地 worker（更稳定）
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

function PdfViewer({ data }) {
  const [pdf, setPdf] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)
  const renderTaskRef = useRef(null)

  // 加载 PDF
  useEffect(() => {
    if (!data?.arrayBuffer) return

    const loadPdf = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // 复制 ArrayBuffer（因为它可能已被使用）
        const arrayBufferCopy = data.arrayBuffer.slice(0)
        
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBufferCopy,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
          cMapPacked: true,
        })
        
        const pdfDoc = await loadingTask.promise
        setPdf(pdfDoc)
        setTotalPages(pdfDoc.numPages)
        setCurrentPage(1)
      } catch (err) {
        console.error('PDF 加载失败:', err)
        setError('PDF 加载失败: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPdf()

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }
    }
  }, [data])

  // 渲染页面
  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current) return

    // 取消之前的渲染任务
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel()
      } catch (e) {
        // 忽略取消错误
      }
    }

    try {
      const page = await pdf.getPage(currentPage)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      // 设置 canvas 尺寸
      const outputScale = window.devicePixelRatio || 1
      canvas.width = Math.floor(viewport.width * outputScale)
      canvas.height = Math.floor(viewport.height * outputScale)
      canvas.style.width = Math.floor(viewport.width) + 'px'
      canvas.style.height = Math.floor(viewport.height) + 'px'

      const transform = outputScale !== 1 
        ? [outputScale, 0, 0, outputScale, 0, 0] 
        : null

      const renderContext = {
        canvasContext: context,
        transform: transform,
        viewport: viewport
      }

      renderTaskRef.current = page.render(renderContext)
      await renderTaskRef.current.promise
    } catch (err) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('页面渲染失败:', err)
      }
    }
  }, [pdf, currentPage, scale])

  useEffect(() => {
    renderPage()
  }, [renderPage])

  // 上一页
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // 下一页
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // 缩放
  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3))
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.5))
  const resetZoom = () => setScale(1.2)

  // 错误状态
  if (error) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <p className="error-hint">请确保文件是有效的 PDF 格式</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <div className="toolbar-group">
          <button onClick={prevPage} disabled={currentPage <= 1}>
            ◀ 上一页
          </button>
          <span className="page-info">
            {currentPage} / {totalPages}
          </span>
          <button onClick={nextPage} disabled={currentPage >= totalPages}>
            下一页 ▶
          </button>
        </div>

        <div className="toolbar-group">
          <button onClick={zoomOut} title="缩小">➖</button>
          <button onClick={resetZoom} title="重置缩放" className="zoom-info">
            {Math.round(scale * 100)}%
          </button>
          <button onClick={zoomIn} title="放大">➕</button>
        </div>

        <div className="toolbar-group">
          <span className="page-label">跳转到:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value)
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page)
              }
            }}
            className="page-input"
          />
        </div>
      </div>

      <div className="pdf-container">
        {loading ? (
          <div className="pdf-loading">
            <div className="spinner"></div>
            <span>加载中...</span>
          </div>
        ) : (
          <div className="pdf-canvas-wrapper">
            <canvas ref={canvasRef} className="pdf-canvas" />
          </div>
        )}
      </div>
    </div>
  )
}

export default PdfViewer