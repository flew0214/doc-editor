import React, { useState, useCallback, useEffect } from 'react'
import './style.css'

function ExcelEditor({ data, onChange, readOnly }) {
  const [activeSheet, setActiveSheet] = useState(0)
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')

  const sheets = data?.sheets || []
  const currentSheet = sheets[activeSheet] || { name: 'Sheet1', data: [[]] }

  // 处理单元格点击
  const handleCellClick = (rowIndex, colIndex) => {
    if (readOnly) return
    setEditingCell({ row: rowIndex, col: colIndex })
    setEditValue(currentSheet.data[rowIndex]?.[colIndex] || '')
  }

  // 处理单元格编辑完成
  const handleCellBlur = () => {
    if (!editingCell) return

    const newSheets = [...sheets]
    const newData = [...currentSheet.data]
    
    // 确保行存在
    while (newData.length <= editingCell.row) {
      newData.push([])
    }
    
    // 确保列存在
    while (newData[editingCell.row].length <= editingCell.col) {
      newData[editingCell.row].push('')
    }
    
    newData[editingCell.row][editingCell.col] = editValue
    newSheets[activeSheet] = { ...currentSheet, data: newData }
    
    onChange({ ...data, sheets: newSheets })
    setEditingCell(null)
  }

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCellBlur()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      handleCellBlur()
      if (editingCell) {
        setEditingCell({ row: editingCell.row, col: editingCell.col + 1 })
        setEditValue(currentSheet.data[editingCell.row]?.[editingCell.col + 1] || '')
      }
    }
  }

  // 添加新行
  const addRow = () => {
    const newSheets = [...sheets]
    const newData = [...currentSheet.data, new Array(getColCount()).fill('')]
    newSheets[activeSheet] = { ...currentSheet, data: newData }
    onChange({ ...data, sheets: newSheets })
  }

  // 添加新列
  const addCol = () => {
    const newSheets = [...sheets]
    const newData = currentSheet.data.map(row => [...row, ''])
    newSheets[activeSheet] = { ...currentSheet, data: newData }
    onChange({ ...data, sheets: newSheets })
  }

  // 获取列数
  const getColCount = () => {
    return Math.max(...currentSheet.data.map(row => row.length), 10)
  }

  // 获取行数
  const getRowCount = () => {
    return Math.max(currentSheet.data.length, 20)
  }

  // 生成列标题 (A, B, C, ...)
  const getColHeader = (index) => {
    let result = ''
    while (index >= 0) {
      result = String.fromCharCode(65 + (index % 26)) + result
      index = Math.floor(index / 26) - 1
    }
    return result
  }

  const colCount = getColCount()
  const rowCount = getRowCount()

  return (
    <div className="excel-editor">
      <div className="sheet-tabs">
        {sheets.map((sheet, index) => (
          <button
            key={index}
            className={`sheet-tab ${activeSheet === index ? 'active' : ''}`}
            onClick={() => setActiveSheet(index)}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      <div className="excel-toolbar">
        {!readOnly && (
          <>
            <button onClick={addRow}>➕ 添加行</button>
            <button onClick={addCol}>➕ 添加列</button>
          </>
        )}
      </div>

      <div className="excel-table-container">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="row-header"></th>
              {Array.from({ length: colCount }).map((_, i) => (
                <th key={i} className="col-header">{getColHeader(i)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="row-header">{rowIndex + 1}</td>
                {Array.from({ length: colCount }).map((_, colIndex) => {
                  const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex
                  const cellValue = currentSheet.data[rowIndex]?.[colIndex] || ''
                  
                  return (
                    <td
                      key={colIndex}
                      className={`cell ${isEditing ? 'editing' : ''}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                      ) : (
                        cellValue
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExcelEditor