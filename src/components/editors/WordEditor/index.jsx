import React, { useRef, useCallback, useEffect } from 'react'
import './style.css'

function WordEditor({ data, onChange, readOnly }) {
  const editorRef = useRef(null)
  const isInternalChange = useRef(false)

  // 同步外部数据到编辑器
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== data?.html) {
        editorRef.current.innerHTML = data?.html || ''
      }
    }
    isInternalChange.current = false
  }, [data])

  // 处理内容变化
  const handleInput = useCallback(() => {
    if (!onChange || readOnly) return
    isInternalChange.current = true
    onChange({
      ...data,
      html: editorRef.current.innerHTML
    })
  }, [data, onChange, readOnly])

  // 执行格式化命令
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  // 插入链接
  const insertLink = () => {
    const url = prompt('请输入链接地址:', 'https://')
    if (url) {
      execCommand('createLink', url)
    }
  }

  // 插入图片
  const insertImage = () => {
    const url = prompt('请输入图片地址:', 'https://')
    if (url) {
      execCommand('insertImage', url)
    }
  }

  return (
    <div className="word-editor">
      {!readOnly && (
        <div className="word-toolbar">
          <div className="toolbar-group">
            <button onClick={() => execCommand('bold')} title="加粗">
              <b>B</b>
            </button>
            <button onClick={() => execCommand('italic')} title="斜体">
              <i>I</i>
            </button>
            <button onClick={() => execCommand('underline')} title="下划线">
              <u>U</u>
            </button>
            <button onClick={() => execCommand('strikeThrough')} title="删除线">
              <s>S</s>
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <select onChange={(e) => execCommand('fontSize', e.target.value)} defaultValue="3">
              <option value="1">特小</option>
              <option value="2">较小</option>
              <option value="3">正常</option>
              <option value="4">较大</option>
              <option value="5">大</option>
              <option value="6">特大</option>
              <option value="7">最大</option>
            </select>
            
            <select onChange={(e) => execCommand('formatBlock', e.target.value)} defaultValue="p">
              <option value="p">正文</option>
              <option value="h1">标题 1</option>
              <option value="h2">标题 2</option>
              <option value="h3">标题 3</option>
              <option value="h4">标题 4</option>
              <option value="blockquote">引用</option>
            </select>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button onClick={() => execCommand('justifyLeft')} title="左对齐">⬅</button>
            <button onClick={() => execCommand('justifyCenter')} title="居中">⬛</button>
            <button onClick={() => execCommand('justifyRight')} title="右对齐">➡</button>
            <button onClick={() => execCommand('justifyFull')} title="两端对齐">⬜</button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button onClick={() => execCommand('insertUnorderedList')} title="无序列表">•</button>
            <button onClick={() => execCommand('insertOrderedList')} title="有序列表">1.</button>
            <button onClick={() => execCommand('indent')} title="增加缩进">→</button>
            <button onClick={() => execCommand('outdent')} title="减少缩进">←</button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <input
              type="color"
              onChange={(e) => execCommand('foreColor', e.target.value)}
              title="字体颜色"
              defaultValue="#000000"
            />
            <input
              type="color"
              onChange={(e) => execCommand('hiliteColor', e.target.value)}
              title="背景颜色"
              defaultValue="#ffffff"
            />
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button onClick={insertLink} title="插入链接">🔗</button>
            <button onClick={insertImage} title="插入图片">🖼️</button>
            <button onClick={() => execCommand('insertHorizontalRule')} title="分隔线">—</button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button onClick={() => execCommand('removeFormat')} title="清除格式">✖</button>
          </div>
        </div>
      )}

      <div
        ref={editorRef}
        className="word-content"
        contentEditable={!readOnly}
        onInput={handleInput}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: data?.html || '' }}
      />
    </div>
  )
}

export default WordEditor