'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Link2, Image as ImageIcon,
  Maximize, Minimize, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Code2, Table
} from 'lucide-react'
import MediaLibraryModal from '@/components/media/MediaLibraryModal'

interface CustomEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CustomEditor({ value, onChange, placeholder = "Metin girin..." }: CustomEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [activeTab, setActiveTab] = useState<'visual' | 'html'>('visual')
  const [htmlValue, setHtmlValue] = useState(value)
  const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; cell: HTMLTableCellElement } | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const isUpdatingRef = useRef(false)
  const isInitializedRef = useRef(false)

  // İlk yükleme - sadece bir kez
  useEffect(() => {
    if (editorRef.current && !isInitializedRef.current) {
      editorRef.current.innerHTML = value
      setHtmlValue(value)
      reattachImageHandlers()
      isInitializedRef.current = true
    }
  }, [])

  // value prop değiştiğinde güncelle
  useEffect(() => {
    if (value !== htmlValue && !isUpdatingRef.current) {
      setHtmlValue(value)

      // Visual tab'dayken editör içeriğini de güncelle
      if (activeTab === 'visual' && editorRef.current) {
        editorRef.current.innerHTML = value
        // Görsellere handler'ları yeniden ekle
        setTimeout(() => reattachImageHandlers(), 50)
      }
    }
  }, [value, activeTab])

  // Context menu'yü kapatmak için global click listener
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Tab değişikliği handler'ı
  const handleTabChange = (newTab: 'visual' | 'html') => {
    if (newTab === 'html' && activeTab === 'visual') {
      // Visual'den HTML'e - editör içeriğini HTML state'ine kaydet ve formatla
      if (editorRef.current) {
        const clonedContent = editorRef.current.cloneNode(true) as HTMLElement
        const handles = clonedContent.querySelectorAll('.resize-handle')
        handles.forEach(handle => handle.remove())
        const wrappers = clonedContent.querySelectorAll('.image-wrapper')
        wrappers.forEach(wrapper => {
          (wrapper as HTMLElement).style.outline = ''
        })
        const cleanHtml = clonedContent.innerHTML
        const formattedHtml = formatHtml(cleanHtml)
        setHtmlValue(formattedHtml)
      }
      setActiveTab(newTab)
    } else if (newTab === 'visual' && activeTab === 'html') {
      // HTML'den Visual'e - önce tab'ı değiştir, sonra içeriği yükle
      setActiveTab(newTab)
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = htmlValue
          setTimeout(() => reattachImageHandlers(), 50)
        }
      }, 10)
    } else {
      setActiveTab(newTab)
    }
  }

  // Görsellere event handler'ları yeniden ekle
  const reattachImageHandlers = () => {
    if (!editorRef.current) return

    const imageWrappers = editorRef.current.querySelectorAll('.image-wrapper')

    imageWrappers.forEach((wrapper) => {
      const imageWrapper = wrapper as HTMLElement
      const img = imageWrapper.querySelector('img')

      if (!img) return

      // Eski event listener'ları temizle
      const newImg = img.cloneNode(true) as HTMLImageElement
      img.replaceWith(newImg)

      // Yeni click event ekle
      newImg.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Önceki seçimi kaldır
        if (selectedImage && selectedImage !== imageWrapper) {
          selectedImage.style.outline = ''
          const prevHandles = selectedImage.querySelectorAll('.resize-handle')
          prevHandles.forEach(h => (h as HTMLElement).style.display = 'none')
        }

        // Yeni görseli seç
        setSelectedImage(imageWrapper)
        imageWrapper.style.outline = '2px solid #3b82f6'
        const handles = imageWrapper.querySelectorAll('.resize-handle')
        handles.forEach(h => (h as HTMLElement).style.display = 'block')
      })

      // Eğer resize handle'lar yoksa ekle
      if (imageWrapper.querySelectorAll('.resize-handle').length === 0) {
        addResizeHandles(imageWrapper)
      }
    })
  }

  // Resize handle'ları ekleyen fonksiyon
  const addResizeHandles = (imageWrapper: HTMLElement) => {
    const handlePositions = [
      { name: 'nw', top: '-6px', left: '-6px', cursor: 'nw-resize' },
      { name: 'n', top: '-6px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
      { name: 'ne', top: '-6px', right: '-6px', cursor: 'ne-resize' },
      { name: 'e', top: '50%', right: '-6px', transform: 'translateY(-50%)', cursor: 'e-resize' },
      { name: 'se', bottom: '-6px', right: '-6px', cursor: 'se-resize' },
      { name: 's', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
      { name: 'sw', bottom: '-6px', left: '-6px', cursor: 'sw-resize' },
      { name: 'w', top: '50%', left: '-6px', transform: 'translateY(-50%)', cursor: 'w-resize' },
    ]

    let isResizing = false
    let startX = 0
    let startY = 0
    let startWidth = 0
    let startHeight = 0
    let currentHandle = ''

    handlePositions.forEach(pos => {
      const handle = document.createElement('div')
      handle.className = 'resize-handle'
      handle.dataset.position = pos.name
      handle.style.position = 'absolute'
      handle.style.width = '12px'
      handle.style.height = '12px'
      handle.style.background = '#3b82f6'
      handle.style.border = '2px solid white'
      handle.style.borderRadius = '50%'
      handle.style.cursor = pos.cursor
      handle.style.display = 'none'
      handle.style.zIndex = '10'

      if (pos.top) handle.style.top = pos.top
      if (pos.bottom) handle.style.bottom = pos.bottom
      if (pos.left) handle.style.left = pos.left
      if (pos.right) handle.style.right = pos.right
      if (pos.transform) handle.style.transform = pos.transform

      handle.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        isResizing = true
        currentHandle = pos.name
        startX = e.clientX
        startY = e.clientY
        startWidth = imageWrapper.offsetWidth
        startHeight = imageWrapper.offsetHeight
        document.body.style.cursor = pos.cursor
      })

      imageWrapper.appendChild(handle)
    })

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      e.preventDefault()

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      let newWidth = startWidth
      let newHeight = startHeight

      if (currentHandle.includes('e')) {
        newWidth = startWidth + deltaX
      } else if (currentHandle.includes('w')) {
        newWidth = startWidth - deltaX
      }

      if (currentHandle.includes('s')) {
        newHeight = startHeight + deltaY
      } else if (currentHandle.includes('n')) {
        newHeight = startHeight - deltaY
      }

      newWidth = Math.max(100, Math.min(newWidth, editorRef.current?.offsetWidth || 800))
      newHeight = Math.max(50, newHeight)

      if (['nw', 'ne', 'sw', 'se'].includes(currentHandle)) {
        const aspectRatio = startWidth / startHeight
        newHeight = newWidth / aspectRatio
      }

      imageWrapper.style.width = `${newWidth}px`
      imageWrapper.style.height = `${newHeight}px`
    }

    const handleMouseUp = () => {
      if (isResizing) {
        isResizing = false
        currentHandle = ''
        document.body.style.cursor = ''
        handleEditorInput()
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Editörden HTML'e senkronizasyon
  const handleEditorInput = () => {
    // Sadece Visual tab'ındayken güncelle
    if (activeTab !== 'visual') return

    if (editorRef.current && !isUpdatingRef.current) {
      isUpdatingRef.current = true

      // HTML'i al ama resize handle'ları temizle
      const clonedContent = editorRef.current.cloneNode(true) as HTMLElement
      const handles = clonedContent.querySelectorAll('.resize-handle')
      handles.forEach(handle => handle.remove())

      // Wrapper'lardan outline'ları temizle
      const wrappers = clonedContent.querySelectorAll('.image-wrapper')
      wrappers.forEach(wrapper => {
        (wrapper as HTMLElement).style.outline = ''
      })

      const newHtml = clonedContent.innerHTML
      setHtmlValue(newHtml)
      onChange(newHtml)
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 0)
    }
  }

  // Editöre tıklandığında görsel seçimini kaldır
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Eğer görsel veya resize handle'a tıklanmadıysa seçimi kaldır
    if (!target.closest('.image-wrapper') && selectedImage) {
      selectedImage.style.outline = ''
      const handle = selectedImage.querySelector('.resize-handle') as HTMLElement
      if (handle) handle.style.display = 'none'
      setSelectedImage(null)
    }
  }

  // Tablo hücresine sağ tık
  const handleCellContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const cell = target.closest('td, th') as HTMLTableCellElement

    if (cell) {
      e.preventDefault()
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        cell: cell
      })
    }
  }

  // Hücre birleştir (sağa)
  const mergeCellRight = () => {
    if (!contextMenu) return
    const cell = contextMenu.cell
    const nextCell = cell.nextElementSibling as HTMLTableCellElement

    if (nextCell) {
      const currentColspan = parseInt(cell.getAttribute('colspan') || '1')
      const nextColspan = parseInt(nextCell.getAttribute('colspan') || '1')
      cell.setAttribute('colspan', (currentColspan + nextColspan).toString())
      nextCell.remove()
      handleEditorInput()
    }
    setContextMenu(null)
  }

  // Hücre birleştir (aşağı)
  const mergeCellDown = () => {
    if (!contextMenu) return
    const cell = contextMenu.cell
    const row = cell.parentElement as HTMLTableRowElement
    const cellIndex = Array.from(row.children).indexOf(cell)
    const nextRow = row.nextElementSibling as HTMLTableRowElement

    if (nextRow) {
      const nextCell = nextRow.children[cellIndex] as HTMLTableCellElement
      if (nextCell) {
        const currentRowspan = parseInt(cell.getAttribute('rowspan') || '1')
        const nextRowspan = parseInt(nextCell.getAttribute('rowspan') || '1')
        cell.setAttribute('rowspan', (currentRowspan + nextRowspan).toString())
        nextCell.remove()
        handleEditorInput()
      }
    }
    setContextMenu(null)
  }

  // Hücreyi böl
  const splitCell = () => {
    if (!contextMenu) return
    const cell = contextMenu.cell
    const colspan = parseInt(cell.getAttribute('colspan') || '1')
    const rowspan = parseInt(cell.getAttribute('rowspan') || '1')

    if (colspan > 1) {
      cell.setAttribute('colspan', '1')
      for (let i = 1; i < colspan; i++) {
        const newCell = document.createElement(cell.tagName.toLowerCase()) as HTMLTableCellElement
        newCell.style.border = '1px solid #d1d5db'
        newCell.style.padding = '8px'
        newCell.innerHTML = '&nbsp;'
        cell.after(newCell)
      }
    } else if (rowspan > 1) {
      cell.setAttribute('rowspan', '1')
      const row = cell.parentElement as HTMLTableRowElement
      const cellIndex = Array.from(row.children).indexOf(cell)
      let currentRow = row.nextElementSibling as HTMLTableRowElement

      for (let i = 1; i < rowspan && currentRow; i++) {
        const newCell = document.createElement('td')
        newCell.style.border = '1px solid #d1d5db'
        newCell.style.padding = '8px'
        newCell.innerHTML = '&nbsp;'
        currentRow.children[cellIndex]?.before(newCell)
        currentRow = currentRow.nextElementSibling as HTMLTableRowElement
      }
    }

    handleEditorInput()
    setContextMenu(null)
  }

  // Satır ekle (üste)
  const insertRowAbove = () => {
    if (!contextMenu) return
    const cell = contextMenu.cell
    const row = cell.parentElement as HTMLTableRowElement
    const table = row.closest('table')
    const colCount = row.children.length

    const newRow = document.createElement('tr')
    for (let i = 0; i < colCount; i++) {
      const newCell = document.createElement('td')
      newCell.style.border = '1px solid #d1d5db'
      newCell.style.padding = '8px'
      newCell.innerHTML = '&nbsp;'
      newRow.appendChild(newCell)
    }

    row.before(newRow)
    handleEditorInput()
    setContextMenu(null)
  }

  // Satır ekle (alta)
  const insertRowBelow = () => {
    if (!contextMenu) return
    const cell = contextMenu.cell
    const row = cell.parentElement as HTMLTableRowElement
    const colCount = row.children.length

    const newRow = document.createElement('tr')
    for (let i = 0; i < colCount; i++) {
      const newCell = document.createElement('td')
      newCell.style.border = '1px solid #d1d5db'
      newCell.style.padding = '8px'
      newCell.innerHTML = '&nbsp;'
      newRow.appendChild(newCell)
    }

    row.after(newRow)
    handleEditorInput()
    setContextMenu(null)
  }

  // Satır sil
  const deleteRow = () => {
    if (!contextMenu) return
    const cell = contextMenu.cell
    const row = cell.parentElement as HTMLTableRowElement
    row.remove()
    handleEditorInput()
    setContextMenu(null)
  }

  // Sütun ekle (sola)
  const insertColumnLeft = () => {
    if (!contextMenu) return
    const cell = contextMenu.cell
    const row = cell.parentElement as HTMLTableRowElement
    const cellIndex = Array.from(row.children).indexOf(cell)
    const table = row.closest('table')

    if (table) {
      const rows = table.querySelectorAll('tr')
      rows.forEach((r, index) => {
        const newCell = document.createElement(index === 0 ? 'th' : 'td')
        newCell.style.border = '1px solid #d1d5db'
        newCell.style.padding = '8px'
        newCell.style.minWidth = '100px'
        if (index === 0) {
          newCell.style.backgroundColor = '#f3f4f6'
          newCell.style.textAlign = 'left'
          newCell.style.position = 'relative'
        }
        newCell.innerHTML = index === 0 ? 'Başlık' : '&nbsp;'
        r.children[cellIndex]?.before(newCell)
      })
    }

    handleEditorInput()
    setContextMenu(null)
  }

  // Sütun ekle (sağa)
  const insertColumnRight = () => {
    if (!contextMenu) return
    const cell = contextMenu.cell
    const row = cell.parentElement as HTMLTableRowElement
    const cellIndex = Array.from(row.children).indexOf(cell)
    const table = row.closest('table')

    if (table) {
      const rows = table.querySelectorAll('tr')
      rows.forEach((r, index) => {
        const newCell = document.createElement(index === 0 ? 'th' : 'td')
        newCell.style.border = '1px solid #d1d5db'
        newCell.style.padding = '8px'
        newCell.style.minWidth = '100px'
        if (index === 0) {
          newCell.style.backgroundColor = '#f3f4f6'
          newCell.style.textAlign = 'left'
          newCell.style.position = 'relative'
        }
        newCell.innerHTML = index === 0 ? 'Başlık' : '&nbsp;'
        r.children[cellIndex]?.after(newCell)
      })
    }

    handleEditorInput()
    setContextMenu(null)
  }

  // Sütun sil
  const deleteColumn = () => {
    if (!contextMenu) return
    const cell = contextMenu.cell
    const row = cell.parentElement as HTMLTableRowElement
    const cellIndex = Array.from(row.children).indexOf(cell)
    const table = row.closest('table')

    if (table) {
      const rows = table.querySelectorAll('tr')
      rows.forEach(r => {
        if (r.children[cellIndex]) {
          r.children[cellIndex].remove()
        }
      })
    }

    handleEditorInput()
    setContextMenu(null)
  }

  // Format komutları
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleEditorInput()
  }

  const formatHeading = (level: number) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (selectedText) {
      // Seçili metin varsa, onu heading ile sar
      const heading = document.createElement(`h${level}`)
      heading.textContent = selectedText
      range.deleteContents()
      range.insertNode(heading)

      // İmleci heading'in sonuna taşı
      const newRange = document.createRange()
      newRange.setStartAfter(heading)
      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)
    } else {
      // Seçili metin yoksa, içinde bulunulan bloğu formatla
      execCommand('formatBlock', `h${level}`)
    }

    handleEditorInput()
  }

  const formatParagraph = () => {
    execCommand('formatBlock', 'p')
  }

  const insertLink = () => {
    const url = prompt('Link URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const insertTable = () => {
    if (!editorRef.current) return

    // Tablo wrapper oluştur
    const tableWrapper = document.createElement('div')
    tableWrapper.className = 'table-wrapper'
    tableWrapper.style.position = 'relative'
    tableWrapper.style.overflow = 'auto'
    tableWrapper.style.margin = '16px 0'

    // Tablo oluştur
    const table = document.createElement('table')
    table.className = 'editor-table resizable-table'
    table.style.borderCollapse = 'collapse'
    table.style.width = '100%'
    table.style.border = '1px solid #d1d5db'

    // Başlık satırı
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')
    headerRow.style.backgroundColor = '#f3f4f6'

    for (let j = 0; j < tableCols; j++) {
      const th = document.createElement('th')
      th.style.border = '1px solid #d1d5db'
      th.style.padding = '8px'
      th.style.textAlign = 'left'
      th.style.position = 'relative'
      th.style.minWidth = '100px'
      th.textContent = `Başlık ${j + 1}`

      // Son sütun değilse resize handle ekle
      if (j < tableCols - 1) {
        const resizer = document.createElement('div')
        resizer.className = 'column-resizer'
        resizer.style.position = 'absolute'
        resizer.style.right = '0'
        resizer.style.top = '0'
        resizer.style.width = '5px'
        resizer.style.height = '100%'
        resizer.style.cursor = 'col-resize'
        resizer.style.userSelect = 'none'
        resizer.style.backgroundColor = 'transparent'
        resizer.style.zIndex = '10'

        resizer.addEventListener('mouseenter', () => {
          resizer.style.backgroundColor = '#3b82f6'
        })
        resizer.addEventListener('mouseleave', () => {
          resizer.style.backgroundColor = 'transparent'
        })

        resizer.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()

          const startX = e.clientX
          const startWidth = th.offsetWidth

          const handleMouseMove = (e: MouseEvent) => {
            const diff = e.clientX - startX
            const newWidth = Math.max(50, startWidth + diff)
            th.style.width = newWidth + 'px'
            th.style.minWidth = newWidth + 'px'
          }

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            resizer.style.backgroundColor = 'transparent'
            handleEditorInput()
          }

          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        })

        th.appendChild(resizer)
      }

      headerRow.appendChild(th)
    }
    thead.appendChild(headerRow)
    table.appendChild(thead)

    // İçerik satırları
    const tbody = document.createElement('tbody')
    for (let i = 0; i < tableRows - 1; i++) {
      const row = document.createElement('tr')
      for (let j = 0; j < tableCols; j++) {
        const td = document.createElement('td')
        td.style.border = '1px solid #d1d5db'
        td.style.padding = '8px'
        td.style.minWidth = '100px'
        td.innerHTML = '&nbsp;'
        row.appendChild(td)
      }
      tbody.appendChild(row)
    }
    table.appendChild(tbody)

    tableWrapper.appendChild(table)

    // Paragraf ekle
    const paragraph = document.createElement('p')
    paragraph.innerHTML = '<br>'

    // Editörün mevcut içeriğine ekle
    editorRef.current.appendChild(tableWrapper)
    editorRef.current.appendChild(paragraph)

    handleEditorInput()
    setShowTableDialog(false)
  }

  const handleImageSelect = (files: any[]) => {
    if (files.length > 0 && editorRef.current) {
      const file = files[0]
      let imageUrl = file.url || file.path || file.imageUrl

      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `http://localhost:4000${imageUrl}`
      }

      if (imageUrl) {
        // Resmi wrapper div içine koyarak resize özelliği ekle
        const imageWrapper = document.createElement('div')
        imageWrapper.className = 'image-wrapper'
        imageWrapper.contentEditable = 'false'
        imageWrapper.style.display = 'inline-block'
        imageWrapper.style.position = 'relative'
        imageWrapper.style.maxWidth = '100%'

        const img = document.createElement('img')
        img.src = imageUrl
        img.style.width = '100%'
        img.style.height = 'auto'
        img.style.display = 'block'
        img.style.cursor = 'pointer'

        // Görsele tıklandığında seç
        img.addEventListener('click', (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()

          // Önceki seçimi kaldır
          if (selectedImage) {
            selectedImage.style.outline = ''
            const prevHandles = selectedImage.querySelectorAll('.resize-handle')
            prevHandles.forEach(h => (h as HTMLElement).style.display = 'none')
          }

          // Yeni görseli seç
          setSelectedImage(imageWrapper)
          imageWrapper.style.outline = '2px solid #3b82f6'
          const handles = imageWrapper.querySelectorAll('.resize-handle')
          handles.forEach(h => (h as HTMLElement).style.display = 'block')
        })

        // 8 resize handle oluştur (4 köşe + 4 kenar)
        const handlePositions = [
          { name: 'nw', top: '-6px', left: '-6px', cursor: 'nw-resize' },
          { name: 'n', top: '-6px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
          { name: 'ne', top: '-6px', right: '-6px', cursor: 'ne-resize' },
          { name: 'e', top: '50%', right: '-6px', transform: 'translateY(-50%)', cursor: 'e-resize' },
          { name: 'se', bottom: '-6px', right: '-6px', cursor: 'se-resize' },
          { name: 's', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
          { name: 'sw', bottom: '-6px', left: '-6px', cursor: 'sw-resize' },
          { name: 'w', top: '50%', left: '-6px', transform: 'translateY(-50%)', cursor: 'w-resize' },
        ]

        let isResizing = false
        let startX = 0
        let startY = 0
        let startWidth = 0
        let startHeight = 0
        let startLeft = 0
        let startTop = 0
        let currentHandle = ''

        handlePositions.forEach(pos => {
          const handle = document.createElement('div')
          handle.className = 'resize-handle'
          handle.dataset.position = pos.name
          handle.style.position = 'absolute'
          handle.style.width = '12px'
          handle.style.height = '12px'
          handle.style.background = '#3b82f6'
          handle.style.border = '2px solid white'
          handle.style.borderRadius = '50%'
          handle.style.cursor = pos.cursor
          handle.style.display = 'none'
          handle.style.zIndex = '10'

          if (pos.top) handle.style.top = pos.top
          if (pos.bottom) handle.style.bottom = pos.bottom
          if (pos.left) handle.style.left = pos.left
          if (pos.right) handle.style.right = pos.right
          if (pos.transform) handle.style.transform = pos.transform

          handle.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            isResizing = true
            currentHandle = pos.name
            startX = e.clientX
            startY = e.clientY
            startWidth = imageWrapper.offsetWidth
            startHeight = imageWrapper.offsetHeight
            const rect = imageWrapper.getBoundingClientRect()
            startLeft = rect.left
            startTop = rect.top
            document.body.style.cursor = pos.cursor
          })

          imageWrapper.appendChild(handle)
        })

        document.addEventListener('mousemove', (e: MouseEvent) => {
          if (!isResizing) return
          e.preventDefault()

          const deltaX = e.clientX - startX
          const deltaY = e.clientY - startY
          let newWidth = startWidth
          let newHeight = startHeight

          // Yön kontrolü
          if (currentHandle.includes('e')) {
            newWidth = startWidth + deltaX
          } else if (currentHandle.includes('w')) {
            newWidth = startWidth - deltaX
          }

          if (currentHandle.includes('s')) {
            newHeight = startHeight + deltaY
          } else if (currentHandle.includes('n')) {
            newHeight = startHeight - deltaY
          }

          // Minimum ve maksimum boyutlar
          newWidth = Math.max(100, Math.min(newWidth, editorRef.current?.offsetWidth || 800))
          newHeight = Math.max(50, newHeight)

          // Aspect ratio koru (köşe handle'ları için)
          if (['nw', 'ne', 'sw', 'se'].includes(currentHandle)) {
            const aspectRatio = startWidth / startHeight
            newHeight = newWidth / aspectRatio
          }

          imageWrapper.style.width = `${newWidth}px`
          imageWrapper.style.height = `${newHeight}px`
        })

        document.addEventListener('mouseup', () => {
          if (isResizing) {
            isResizing = false
            currentHandle = ''
            document.body.style.cursor = ''
            handleEditorInput()
          }
        })

        imageWrapper.appendChild(img)

        // İmlecin bulunduğu yere ekle
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.deleteContents()
          range.insertNode(imageWrapper)

          // İmleci resmin sonrasına taşı
          const newRange = document.createRange()
          newRange.setStartAfter(imageWrapper)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }

        handleEditorInput()
      }
    }
    setShowMediaLibrary(false)
  }

  // HTML tab değişikliği
  const handleHtmlChange = (newHtml: string) => {
    setHtmlValue(newHtml)
    onChange(newHtml)
  }

  // HTML kodunu formatla
  const formatHtml = (html: string): string => {
    let result = ''
    let indent = 0
    const tab = '    ' // 4 boşluk

    // HTML'i tag'lere göre böl
    const parts = html.split(/(<\/?[^>]+>)/g)

    parts.forEach(part => {
      const trimmed = part.trim()
      if (!trimmed) return

      // Kapanış tag'i mi kontrol et
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1)
        result += tab.repeat(indent) + trimmed + '\n'
      }
      // Self-closing tag mı kontrol et
      else if (trimmed.endsWith('/>') || trimmed.match(/<(br|hr|img|input|meta|link)[^>]*>/i)) {
        result += tab.repeat(indent) + trimmed + '\n'
      }
      // Açılış tag'i mi kontrol et
      else if (trimmed.startsWith('<')) {
        result += tab.repeat(indent) + trimmed + '\n'
        // Inline tag'ler için indent artırma (span, a, strong, em, etc.)
        if (!trimmed.match(/<(span|a|strong|em|i|b|u|small|code)[^>]*>/i)) {
          indent++
        }
      }
      // Metin içeriği
      else {
        result += tab.repeat(indent) + trimmed + '\n'
      }
    })

    return result.trim()
  }

  // İstatistikler
  const getStats = () => {
    if (typeof window === 'undefined') return { chars: 0, words: 0 }
    const text = htmlValue.replace(/<[^>]*>/g, '').trim()
    const chars = text.length
    const words = text ? text.split(/\s+/).length : 0
    return { chars, words }
  }

  const stats = getStats()

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col' : 'border rounded-lg overflow-hidden flex flex-col'}`}>
      <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as 'visual' | 'html')}>
        <div className="border-b bg-gray-50 dark:bg-slate-800 flex items-center justify-between px-2">
          <TabsList className="h-auto p-1 bg-transparent">
            <TabsTrigger value="visual">Görsel</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Normal Boyut" : "Tam Ekran"}
            className="h-8 w-8 p-0"
          >
            {isFullScreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>

        <TabsContent value="visual" className="m-0 flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 dark:bg-slate-800">
            {/* Başlıklar */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={formatParagraph}
                className="h-8 w-8 p-0"
                title="Paragraf"
              >
                <Type className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatHeading(1)}
                className="h-8 w-8 p-0"
                title="Başlık 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatHeading(2)}
                className="h-8 w-8 p-0"
                title="Başlık 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatHeading(3)}
                className="h-8 w-8 p-0"
                title="Başlık 3"
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Metin formatları */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('bold')}
                className="h-8 w-8 p-0"
                title="Kalın"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('italic')}
                className="h-8 w-8 p-0"
                title="İtalik"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('underline')}
                className="h-8 w-8 p-0"
                title="Alt Çizgi"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('strikeThrough')}
                className="h-8 w-8 p-0"
                title="Üstü Çizili"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>

            {/* Hizalama */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyLeft')}
                className="h-8 w-8 p-0"
                title="Sola Hizala"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyCenter')}
                className="h-8 w-8 p-0"
                title="Ortala"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyRight')}
                className="h-8 w-8 p-0"
                title="Sağa Hizala"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyFull')}
                className="h-8 w-8 p-0"
                title="İki Yana Yasla"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>

            {/* Listeler ve alıntı */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('insertUnorderedList')}
                className="h-8 w-8 p-0"
                title="Madde İşaretli Liste"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('insertOrderedList')}
                className="h-8 w-8 p-0"
                title="Numaralı Liste"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('formatBlock', 'blockquote')}
                className="h-8 w-8 p-0"
                title="Alıntı"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>

            {/* Link, resim ve tablo */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={insertLink}
                className="h-8 w-8 p-0"
                title="Link Ekle"
              >
                <Link2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMediaLibrary(true)}
                className="h-8 w-8 p-0"
                title="Resim Ekle"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTableDialog(true)}
                className="h-8 w-8 p-0"
                title="Tablo Ekle"
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ContentEditable Editör */}
          <div className="relative flex-1 overflow-y-auto">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onClick={handleEditorClick}
              onContextMenu={handleCellContextMenu}
              className="custom-editor-content min-h-[400px] p-4 focus:outline-none"
              suppressContentEditableWarning
            />
            {!htmlValue && (
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                {placeholder}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 dark:bg-slate-800 text-xs text-gray-500 dark:text-gray-400">
            <div>
              {stats.chars} karakter • {stats.words} kelime
            </div>
          </div>
        </TabsContent>

        <TabsContent value="html" className="m-0 flex-1 flex flex-col bg-slate-900">
          {/* HTML Toolbar */}
          <div className="flex items-center justify-between px-2 py-2 border-b border-slate-700 bg-slate-800">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const formatted = formatHtml(htmlValue)
                  setHtmlValue(formatted)
                  onChange(formatted)
                }}
                className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
                title="Kodu Yeniden Formatla"
              >
                <Code2 className="h-4 w-4 mr-1" />
                Formatla
              </Button>
            </div>
            <div className="text-xs text-slate-500">
              {htmlValue.length} karakter
            </div>
          </div>

          <Textarea
            value={htmlValue}
            onChange={(e) => handleHtmlChange(e.target.value)}
            placeholder="HTML kodunu buraya yazabilirsiniz..."
            className={`flex-1 border-0 resize-none focus-visible:ring-0 rounded-none font-mono text-sm
              bg-slate-900 text-green-400
              placeholder:text-slate-600
              leading-relaxed
              ${isFullScreen ? 'h-full' : 'min-h-[400px]'}`}
            style={{
              tabSize: 2,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>{htmlValue.split('\n').length} satır</span>
              <span className="text-slate-500">|</span>
              <span>HTML</span>
            </div>
            <div className="text-slate-500">UTF-8</div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 min-w-[200px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={mergeCellRight}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            Sağdaki Hücre ile Birleştir
          </button>
          <button
            onClick={mergeCellDown}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            Alttaki Hücre ile Birleştir
          </button>
          <button
            onClick={splitCell}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            Hücreyi Böl
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            onClick={insertRowAbove}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            Üste Satır Ekle
          </button>
          <button
            onClick={insertRowBelow}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            Alta Satır Ekle
          </button>
          <button
            onClick={deleteRow}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600 dark:text-red-400"
          >
            Satırı Sil
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            onClick={insertColumnLeft}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            Sola Sütun Ekle
          </button>
          <button
            onClick={insertColumnRight}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            Sağa Sütun Ekle
          </button>
          <button
            onClick={deleteColumn}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600 dark:text-red-400"
          >
            Sütunu Sil
          </button>
        </div>
      )}

      <MediaLibraryModal
        open={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleImageSelect}
        multiple={false}
        folder="products"
        accept="images"
      />

      {/* Tablo Ekleme Dialog'u */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tablo Ekle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rows">Satır Sayısı</Label>
              <Input
                id="rows"
                type="number"
                min={2}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cols">Sütun Sayısı</Label>
              <Input
                id="cols"
                type="number"
                min={2}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowTableDialog(false)}>
              İptal
            </Button>
            <Button type="button" onClick={insertTable}>
              Tablo Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
