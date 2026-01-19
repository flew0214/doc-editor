import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
import JSZip from 'jszip'

/**
 * 解析文件
 */
export async function parseFile(file, mode) {
  switch (mode) {
    case 'excel':
      return parseExcel(file)
    case 'word':
      return parseWord(file)
    case 'markdown':
      return parseMarkdown(file)
    case 'pdf':
      return parsePdf(file)
    case 'ppt':
      return parsePpt(file)
    case 'epub':
      return parseEpub(file)
    default:
      throw new Error('不支持的文件类型')
  }
}

/**
 * 解析 Excel 文件
 */
async function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const sheets = workbook.SheetNames.map(name => {
          const sheet = workbook.Sheets[name]
          const jsonData = XLSX.utils.sheet_to_json(sheet, { 
            header: 1,
            defval: ''
          })
          return { name, data: jsonData }
        })

        resolve({ sheets, workbook })
      } catch (err) {
        reject(new Error('Excel 解析失败: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 解析 Word 文件
 */
async function parseWord(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result
        const result = await mammoth.convertToHtml({ arrayBuffer })
        resolve({ html: result.value, messages: result.messages })
      } catch (err) {
        reject(new Error('Word 解析失败: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 解析 Markdown 文件
 */
async function parseMarkdown(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        resolve({ content: e.target.result })
      } catch (err) {
        reject(new Error('Markdown 解析失败: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

/**
 * 解析 PDF 文件
 */
async function parsePdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        resolve({ arrayBuffer: e.target.result })
      } catch (err) {
        reject(new Error('PDF 解析失败: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 解析 PPT 文件 - 修复版
 */
async function parsePpt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const zip = new JSZip()
        const content = await zip.loadAsync(e.target.result)
        
        // 存储图片
        const images = {}
        
        // 提取媒体文件
        for (const [path, zipEntry] of Object.entries(content.files)) {
          if (path.startsWith('ppt/media/') && !zipEntry.dir) {
            try {
              const imageData = await zipEntry.async('base64')
              const ext = path.split('.').pop().toLowerCase()
              const mimeTypes = {
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'svg': 'image/svg+xml',
                'emf': 'image/emf',
                'wmf': 'image/wmf'
              }
              const mimeType = mimeTypes[ext] || 'image/png'
              const fileName = path.split('/').pop()
              images[fileName] = `data:${mimeType};base64,${imageData}`
            } catch (err) {
              console.warn('图片提取失败:', path)
            }
          }
        }
        
        // 查找所有幻灯片
        const slideFiles = Object.keys(content.files)
          .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
          .sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)/)[1])
            const numB = parseInt(b.match(/slide(\d+)/)[1])
            return numA - numB
          })

        console.log('找到幻灯片文件:', slideFiles)

        const slides = []

        for (const slideFile of slideFiles) {
          try {
            const xmlContent = await content.files[slideFile].async('text')
            const slideData = parsePptSlide(xmlContent, images)
            slides.push(slideData)
          } catch (err) {
            console.warn('幻灯片解析失败:', slideFile, err)
            slides.push({
              title: `幻灯片`,
              content: [{ type: 'plain', text: '内容解析失败' }],
              images: []
            })
          }
        }

        if (slides.length === 0) {
          slides.push({
            title: '无法解析',
            content: [
              { type: 'plain', text: '未能从文件中提取到幻灯片内容' },
              { type: 'plain', text: '可能是文件格式不兼容' }
            ],
            images: []
          })
        }

        resolve({ slides, images })
      } catch (err) {
        console.error('PPT 解析失败:', err)
        reject(new Error('PPT 解析失败: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 解析单个 PPT 幻灯片
 */
function parsePptSlide(xmlString, images) {
  const slideData = {
    title: '',
    content: [],
    images: []
  }

  try {
    // 移除 XML 声明和命名空间前缀的影响
    const cleanXml = xmlString
      .replace(/<\?xml[^?]*\?>/g, '')
      .replace(/xmlns[^=]*="[^"]*"/g, '')
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlString, 'text/xml')
    
    // 检查解析错误
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      console.warn('XML 解析警告')
    }

    // 收集所有文本
    const allTexts = []
    
    // 方法1: 查找 a:t 标签
    const textNodes1 = doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 't')
    for (let i = 0; i < textNodes1.length; i++) {
      const text = textNodes1[i].textContent?.trim()
      if (text) allTexts.push(text)
    }
    
    // 方法2: 如果方法1没找到，尝试直接查找
    if (allTexts.length === 0) {
      const textNodes2 = doc.querySelectorAll('t')
      textNodes2.forEach(node => {
        const text = node.textContent?.trim()
        if (text) allTexts.push(text)
      })
    }
    
    // 方法3: 使用正则表达式直接从 XML 字符串提取
    if (allTexts.length === 0) {
      const regex = /<a:t[^>]*>([^<]+)<\/a:t>/g
      let match
      while ((match = regex.exec(xmlString)) !== null) {
        const text = match[1].trim()
        if (text) allTexts.push(text)
      }
    }
    
    // 方法4: 更宽松的正则
    if (allTexts.length === 0) {
      const regex = /<[^:]*:t>([^<]+)<\/[^:]*:t>/g
      let match
      while ((match = regex.exec(xmlString)) !== null) {
        const text = match[1].trim()
        if (text) allTexts.push(text)
      }
    }

    console.log('提取到的文本:', allTexts)

    // 分配标题和内容
    if (allTexts.length > 0) {
      slideData.title = allTexts[0]
      for (let i = 1; i < allTexts.length; i++) {
        slideData.content.push({
          type: 'bullet',
          text: allTexts[i]
        })
      }
    }

  } catch (err) {
    console.error('幻灯片解析错误:', err)
  }

  return slideData
}

/**
 * 解析 EPUB 文件
 */
async function parseEpub(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const zip = new JSZip()
        const content = await zip.loadAsync(e.target.result)
        
        // 存储图片为 base64
        const images = {}
        for (const [path, zipEntry] of Object.entries(content.files)) {
          if (/\.(jpg|jpeg|png|gif|svg)$/i.test(path) && !zipEntry.dir) {
            try {
              const imageData = await zipEntry.async('base64')
              const ext = path.split('.').pop().toLowerCase()
              const mimeTypes = {
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'svg': 'image/svg+xml'
              }
              const mimeType = mimeTypes[ext] || 'image/png'
              images[path] = `data:${mimeType};base64,${imageData}`
            } catch (err) {
              console.warn('图片提取失败:', path)
            }
          }
        }

        // 读取 container.xml 找到 rootfile
        let rootFilePath = 'OEBPS/content.opf'
        try {
          const containerXml = await content.files['META-INF/container.xml'].async('text')
          const containerMatch = containerXml.match(/full-path="([^"]+)"/)
          if (containerMatch) {
            rootFilePath = containerMatch[1]
          }
        } catch (err) {
          console.warn('container.xml 读取失败，使用默认路径')
        }

        // 获取根目录
        const rootDir = rootFilePath.substring(0, rootFilePath.lastIndexOf('/') + 1)

        // 读取 content.opf
        let metadata = {}
        let spine = []
        let manifest = {}

        try {
          const opfContent = await content.files[rootFilePath].async('text')
          const parser = new DOMParser()
          const opfDoc = parser.parseFromString(opfContent, 'text/xml')

          // 提取元数据
          const titleEl = opfDoc.querySelector('title')
          const creatorEl = opfDoc.querySelector('creator')
          metadata.title = titleEl?.textContent || ''
          metadata.creator = creatorEl?.textContent || ''

          // 提取封面
          const coverMeta = opfDoc.querySelector('meta[name="cover"]')
          if (coverMeta) {
            const coverId = coverMeta.getAttribute('content')
            const coverItem = opfDoc.querySelector(`item[id="${coverId}"]`)
            if (coverItem) {
              const coverHref = coverItem.getAttribute('href')
              const coverPath = rootDir + coverHref
              if (images[coverPath]) {
                metadata.cover = images[coverPath]
              }
            }
          }

          // 构建 manifest
          const manifestItems = opfDoc.querySelectorAll('manifest item')
          manifestItems.forEach(item => {
            const id = item.getAttribute('id')
            const href = item.getAttribute('href')
            const mediaType = item.getAttribute('media-type')
            manifest[id] = { href, mediaType }
          })

          // 获取 spine 顺序
          const spineItems = opfDoc.querySelectorAll('spine itemref')
          spineItems.forEach(item => {
            const idref = item.getAttribute('idref')
            if (manifest[idref]) {
              spine.push(manifest[idref].href)
            }
          })
        } catch (err) {
          console.warn('OPF 解析失败:', err)
        }

        // 如果 spine 为空，尝试查找所有 HTML/XHTML 文件
        if (spine.length === 0) {
          spine = Object.keys(content.files)
            .filter(name => /\.(html|xhtml|htm)$/i.test(name))
            .sort()
        }

        // 解析章节
        const chapters = []
        for (const href of spine) {
          const filePath = href.startsWith(rootDir) ? href : rootDir + href
          
          try {
            const fileEntry = content.files[filePath] || content.files[href]
            if (!fileEntry) {
              console.warn('章节文件未找到:', filePath)
              continue
            }

            const htmlContent = await fileEntry.async('text')
            const chapterData = parseEpubChapter(htmlContent, images, rootDir)
            chapters.push(chapterData)
          } catch (err) {
            console.warn('章节解析失败:', filePath, err)
          }
        }

        if (chapters.length === 0) {
          chapters.push({
            title: '无法解析',
            html: '<p>未能从 EPUB 文件中提取到内容</p>'
          })
        }

        resolve({ chapters, metadata, images })
      } catch (err) {
        console.error('EPUB 解析失败:', err)
        reject(new Error('EPUB 解析失败: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 解析 EPUB 章节 HTML
 */
function parseEpubChapter(htmlContent, images, rootDir) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  // 提取标题
  let title = ''
  const titleEl = doc.querySelector('title')
  const h1El = doc.querySelector('h1')
  const h2El = doc.querySelector('h2')
  title = h1El?.textContent || h2El?.textContent || titleEl?.textContent || ''

  // 处理图片路径
  const imgElements = doc.querySelectorAll('img')
  imgElements.forEach(img => {
    const src = img.getAttribute('src')
    if (src) {
      // 尝试匹配图片
      const possiblePaths = [
        src,
        rootDir + src,
        src.replace('../', rootDir),
        src.replace(/^\.\.\//, '')
      ]
      
      for (const path of possiblePaths) {
        // 查找匹配的图片
        for (const [imgPath, imgData] of Object.entries(images)) {
          if (imgPath.endsWith(src.split('/').pop()) || imgPath === path) {
            img.setAttribute('src', imgData)
            break
          }
        }
      }
    }
  })

  // 移除 script 和 style 标签
  doc.querySelectorAll('script, style, link').forEach(el => el.remove())

  // 获取 body 内容
  const body = doc.querySelector('body')
  let html = body ? body.innerHTML : doc.documentElement.innerHTML

  // 清理 HTML
  html = html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()

  return { title: title.trim(), html }
}