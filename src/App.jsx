import React, { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import FileImporter from './components/FileImporter'
import Toolbar from './components/Toolbar'
import ExcelEditor from './components/editors/ExcelEditor'
import WordEditor from './components/editors/WordEditor'
import MarkdownEditor from './components/editors/MarkdownEditor'
import PdfViewer from './components/editors/PdfViewer'
import PptViewer from './components/editors/PptViewer'
import EpubViewer from './components/editors/EpubViewer'

const editorComponents = {
  excel: ExcelEditor,
  word: WordEditor,
  markdown: MarkdownEditor,
  pdf: PdfViewer,
  ppt: PptViewer,
  epub: EpubViewer
}

const editorConfig = {
  excel: { 
    name: 'Excel', 
    extensions: ['.xlsx', '.xls', '.csv'],
    canEdit: true 
  },
  word: { 
    name: 'Word', 
    extensions: ['.docx', '.doc'],
    canEdit: true 
  },
  markdown: { 
    name: 'Markdown', 
    extensions: ['.md', '.markdown', '.txt'],
    canEdit: true 
  },
  pdf: { 
    name: 'PDF', 
    extensions: ['.pdf'],
    canEdit: false 
  },

  epub: {
    name: 'EPUB',
    extensions: ['.epub'],
    canEdit: false
  },
  ppt: { 
    name: 'PPT(未完成)', 
    extensions: ['.pptx', '.ppt'],
    canEdit: false 
  }
}

function App() {
  const [currentMode, setCurrentMode] = useState('markdown')
  const [fileData, setFileData] = useState(null)
  const [fileName, setFileName] = useState('')
  const [isModified, setIsModified] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const EditorComponent = editorComponents[currentMode]
  const config = editorConfig[currentMode]

  const handleModeChange = useCallback((mode) => {
    if (isModified) {
      if (!confirm('当前文件未保存，切换将丢失更改，是否继续？')) {
        return
      }
    }
    setCurrentMode(mode)
    setFileData(null)
    setFileName('')
    setIsModified(false)
    setHistory([])
    setHistoryIndex(-1)
  }, [isModified])

  const handleFileImport = useCallback((data, name) => {
    setFileData(data)
    setFileName(name)
    setIsModified(false)
    setHistory([data])
    setHistoryIndex(0)
  }, [])

  const handleContentChange = useCallback((newData) => {
    setFileData(newData)
    setIsModified(true)
    
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newData)
    if (newHistory.length > 50) newHistory.shift()
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setFileData(history[historyIndex - 1])
    }
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setFileData(history[historyIndex + 1])
    }
  }, [history, historyIndex])

  const handleSave = useCallback(() => {
    setIsModified(false)
    console.log('文件已保存到内存')
  }, [])

  return (
    <div className="app">
      <Sidebar
        currentMode={currentMode}
        onModeChange={handleModeChange}
        config={editorConfig}
      />
      
      <main className="main-content">
        <div className="header">
          <h1>{config.name} {config.canEdit ? '编辑器' : '查看器'}</h1>
          {fileName && (
            <span className="file-name">
              {fileName} {isModified && <span className="modified">*</span>}
            </span>
          )}
        </div>

        <FileImporter
          accept={config.extensions.join(',')}
          onImport={handleFileImport}
          mode={currentMode}
        />

        {fileData && config.canEdit && (
          <Toolbar
            onSave={handleSave}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            mode={currentMode}
            fileData={fileData}
            fileName={fileName}
          />
        )}

        <div className="editor-container">
          {fileData ? (
            <EditorComponent
              data={fileData}
              onChange={config.canEdit ? handleContentChange : undefined}
              readOnly={!config.canEdit}
            />
          ) : (
            <div className="empty-state">
              <p>请导入 {config.extensions.join(' / ')} 文件开始{config.canEdit ? '编辑' : '查看'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App