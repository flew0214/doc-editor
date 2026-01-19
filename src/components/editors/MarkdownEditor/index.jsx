import React, { useState, useCallback, useMemo } from 'react'
import { marked } from 'marked'
import './style.css'

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

function MarkdownEditor({ data, onChange, readOnly }) {
  const [viewMode, setViewMode] = useState('split') // edit, preview, split
  const content = data?.content || ''

  const handleChange = useCallback((e) => {
    if (!onChange || readOnly) return
    onChange({
      ...data,
      content: e.target.value
    })
  }, [data, onChange, readOnly])

  const preview = useMemo(() => {
    return marked(content)
  }, [content])

  // 插入 Markdown 语法
  const insertSyntax = (before, after = '', placeholder = '') => {
    const textarea = document.querySelector('.md-editor-textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end) || placeholder
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    onChange({
      ...data,
      content: newText
    })

    // 设置光标位置
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const toolbarItems = [
    { icon: 'H1', action: () => insertSyntax('# ', '\n', '标题'), title: '标题1' },
    { icon: 'H2', action: () => insertSyntax('## ', '\n', '标题'), title: '标题2' },
    { icon: 'H3', action: () => insertSyntax('### ', '\n', '标题'), title: '标题3' },
    { type: 'divider' },
    { icon: 'B', action: () => insertSyntax('**', '**', '粗体'), title: '粗体' },
    { icon: 'I', action: () => insertSyntax('*', '*', '斜体'), title: '斜体' },
    { icon: 'S', action: () => insertSyntax('~~', '~~', '删除线'), title: '删除线' },
    { type: 'divider' },
    { icon: '•', action: () => insertSyntax('- ', '\n', '列表项'), title: '无序列表' },
    { icon: '1.', action: () => insertSyntax('1. ', '\n', '列表项'), title: '有序列表' },
    { icon: '☑', action: () => insertSyntax('- [ ] ', '\n', '待办事项'), title: '任务列表' },
    { type: 'divider' },
    { icon: '"', action: () => insertSyntax('> ', '\n', '引用内容'), title: '引用' },
    { icon: '<>', action: () => insertSyntax('`', '`', '代码'), title: '行内代码' },
    { icon: '{}', action: () => insertSyntax('```\n', '\n```', '代码块'), title: '代码块' },
    { type: 'divider' },
    { icon: '🔗', action: () => insertSyntax('[', '](url)', '链接文字'), title: '链接' },
    { icon: '🖼️', action: () => insertSyntax('![', '](url)', '图片描述'), title: '图片' },
    { icon: '📊', action: () => insertSyntax('\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| ', ' |  |  |\n', '内容'), title: '表格' },
    { icon: '—', action: () => insertSyntax('\n---\n', '', ''), title: '分隔线' },
  ]

  return (
    <div className="markdown-editor">
      {!readOnly && (
        <div className="md-toolbar">
          <div className="md-toolbar-left">
            {toolbarItems.map((item, index) => (
              item.type === 'divider' ? (
                <span key={index} className="toolbar-divider"></span>
              ) : (
                <button
                  key={index}
                  onClick={item.action}
                  title={item.title}
                  className="md-toolbar-btn"
                >
                  {item.icon}
                </button>
              )
            ))}
          </div>
          <div className="md-toolbar-right">
            <button
              className={`view-btn ${viewMode === 'edit' ? 'active' : ''}`}
              onClick={() => setViewMode('edit')}
            >
              编辑
            </button>
            <button
              className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
            >
              分屏
            </button>
            <button
              className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
            >
              预览
            </button>
          </div>
        </div>
      )}

      <div className={`md-content ${viewMode}`}>
        {(viewMode === 'edit' || viewMode === 'split') && !readOnly && (
          <div className="md-edit-pane">
            <textarea
              className="md-editor-textarea"
              value={content}
              onChange={handleChange}
              placeholder="在这里输入 Markdown..."
            />
          </div>
        )}
        
        {(viewMode === 'preview' || viewMode === 'split' || readOnly) && (
          <div className="md-preview-pane">
            <div
              className="md-preview-content"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownEditor