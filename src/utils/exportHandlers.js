import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { marked } from 'marked'

/**
 * 导出文件
 */
export async function exportFile(data, fileName, mode, format) {
  switch (mode) {
    case 'excel':
      return exportExcel(data, fileName, format)
    case 'word':
      return exportWord(data, fileName, format)
    case 'markdown':
      return exportMarkdown(data, fileName, format)
    default:
      throw new Error('不支持的导出类型')
  }
}

/**
 * 导出 Excel
 */
function exportExcel(data, fileName, format) {
  const workbook = XLSX.utils.book_new()
  
  data.sheets.forEach(sheet => {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.data)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  })

  const baseName = fileName.replace(/\.[^/.]+$/, '')
  
  if (format === 'xlsx') {
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    saveAs(blob, `${baseName}.xlsx`)
  } else if (format === 'csv') {
    // 只导出第一个工作表
    const csvContent = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]])
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `${baseName}.csv`)
  }
}

/**
 * 导出 Word
 */
async function exportWord(data, fileName, format) {
  const baseName = fileName.replace(/\.[^/.]+$/, '')
  const htmlContent = data.html || ''

  if (format === 'html') {
    const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${baseName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    h1 { font-size: 28px; margin: 20px 0 10px; }
    h2 { font-size: 24px; margin: 18px 0 8px; }
    h3 { font-size: 20px; margin: 16px 0 6px; }
    p { margin: 10px 0; }
    ul, ol { padding-left: 30px; }
    blockquote {
      margin: 10px 0;
      padding: 10px 20px;
      border-left: 4px solid #3498db;
      background: #f8f9fa;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }
    th { background: #f5f5f5; }
    img { max-width: 100%; }
    a { color: #3498db; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    saveAs(blob, `${baseName}.html`)
  } else if (format === 'docx') {
    // 使用 html-docx-js 转换
    try {
      const { asBlob } = await import('html-docx-js-typescript')
      
      const docxHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12pt; }
    h1 { font-size: 18pt; }
    h2 { font-size: 16pt; }
    h3 { font-size: 14pt; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`
      
      const blob = await asBlob(docxHtml)
      saveAs(blob, `${baseName}.docx`)
    } catch (err) {
      // 备用方案：导出为 HTML
      console.warn('DOCX 导出失败，使用 HTML 备用方案:', err)
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
      saveAs(blob, `${baseName}.html`)
      alert('DOCX 导出失败，已导出为 HTML 格式')
    }
  }
}

/**
 * 导出 Markdown
 */
function exportMarkdown(data, fileName, format) {
  const baseName = fileName.replace(/\.[^/.]+$/, '')
  const content = data.content || ''

  if (format === 'md') {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    saveAs(blob, `${baseName}.md`)
  } else if (format === 'html') {
    const htmlContent = marked(content)
    const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${baseName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    h1 {
      font-size: 28px;
      margin: 20px 0 10px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e8e8e8;
    }
    h2 {
      font-size: 24px;
      margin: 18px 0 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e8e8e8;
    }
    h3 { font-size: 20px; margin: 16px 0 6px; }
    p { margin: 10px 0; }
    ul, ol { padding-left: 30px; }
    li { margin: 5px 0; }
    blockquote {
      margin: 10px 0;
      padding: 10px 20px;
      border-left: 4px solid #3498db;
      background: #f8f9fa;
      color: #666;
    }
    code {
      padding: 2px 6px;
      background: #f5f5f5;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
      color: #c7254e;
    }
    pre {
      margin: 10px 0;
      padding: 15px;
      background: #2d2d2d;
      border-radius: 6px;
      overflow-x: auto;
    }
    pre code {
      padding: 0;
      background: transparent;
      color: #f8f8f2;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 10px 15px;
      border: 1px solid #e8e8e8;
      text-align: left;
    }
    th { background: #f5f5f5; font-weight: 600; }
    img { max-width: 100%; height: auto; }
    a { color: #3498db; }
    hr {
      margin: 20px 0;
      border: none;
      border-top: 1px solid #e8e8e8;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    saveAs(blob, `${baseName}.html`)
  }
}