'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'

// Fabric.js instance (loaded dynamically)
let fabric: any

interface ImageCanvasProps {
  activeTool: string
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void
}

export interface ImageCanvasRef {
  loadImage: (url: string) => void
  loadTemplate: (data: any) => void
  createBlank: (width: number, height: number, bgColor: string) => void
  exportImage: (format: 'png' | 'jpeg' | 'webp') => string
  undo: () => void
  redo: () => void
  getCanvas: () => fabric.Canvas | null
  addText: () => void
  addRect: () => void
  addCircle: () => void
  rotateObject: (angle: number) => void
  applyFilter: (filterType: string, value: number) => void
  cropImage: () => void
}

const ImageCanvas = forwardRef<ImageCanvasRef, ImageCanvasProps>(
  ({ activeTool, onHistoryChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fabricCanvasRef = useRef<any>(null)
    const historyRef = useRef<string[]>([])
    const historyIndexRef = useRef(-1)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
      // Fabric.js'i client-side'da yükle
      import('fabric').then((fabricModule) => {
        // @ts-ignore - fabric paketinin export yapısı
        fabric = fabricModule.fabric || fabricModule.default || fabricModule
        setIsReady(true)
      }).catch((error) => {
        console.error('Fabric.js yükleme hatası:', error)
      })
    }, [])

    useEffect(() => {
      if (!canvasRef.current || !isReady || !fabric) return

      // Fabric.js canvas oluştur
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth - 320, // Minus sidebars
        height: window.innerHeight - 100,
        backgroundColor: '#f0f0f0',
      })

      fabricCanvasRef.current = canvas

      // İlk state'i kaydet
      saveState()

      // Canvas değişikliklerini dinle
      canvas.on('object:modified', () => saveState())
      canvas.on('object:added', () => saveState())
      canvas.on('object:removed', () => saveState())

      return () => {
        canvas.dispose()
      }
    }, [isReady])

    const saveState = () => {
      if (!fabricCanvasRef.current) return

      const json = JSON.stringify(fabricCanvasRef.current.toJSON())

      // Mevcut index'ten sonraki history'yi sil
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)

      // Yeni state ekle
      historyRef.current.push(json)
      historyIndexRef.current++

      // History limitini kontrol et (max 50)
      if (historyRef.current.length > 50) {
        historyRef.current.shift()
        historyIndexRef.current--
      }

      updateHistoryButtons()
    }

    const updateHistoryButtons = () => {
      const canUndo = historyIndexRef.current > 0
      const canRedo = historyIndexRef.current < historyRef.current.length - 1
      onHistoryChange(canUndo, canRedo)
    }

    const undo = () => {
      if (historyIndexRef.current <= 0 || !fabricCanvasRef.current) return

      historyIndexRef.current--
      const state = historyRef.current[historyIndexRef.current]
      fabricCanvasRef.current.loadFromJSON(state, () => {
        fabricCanvasRef.current?.renderAll()
        updateHistoryButtons()
      })
    }

    const redo = () => {
      if (
        historyIndexRef.current >= historyRef.current.length - 1 ||
        !fabricCanvasRef.current
      ) return

      historyIndexRef.current++
      const state = historyRef.current[historyIndexRef.current]
      fabricCanvasRef.current.loadFromJSON(state, () => {
        fabricCanvasRef.current?.renderAll()
        updateHistoryButtons()
      })
    }

    const loadImage = (url: string) => {
      if (!fabricCanvasRef.current || !fabric) return

      fabric.Image.fromURL(url, (img) => {
        if (!fabricCanvasRef.current) return

        // Canvas boyutunu ayarla
        const maxWidth = window.innerWidth - 320
        const maxHeight = window.innerHeight - 100

        let scale = 1
        if (img.width! > maxWidth || img.height! > maxHeight) {
          scale = Math.min(maxWidth / img.width!, maxHeight / img.height!)
        }

        img.scale(scale)

        // Canvas'ı temizle ve görseli ekle
        fabricCanvasRef.current.clear()
        fabricCanvasRef.current.setBackgroundImage(img, () => {
          fabricCanvasRef.current?.renderAll()
          saveState()
        }, {
          originX: 'left',
          originY: 'top'
        })
      }, { crossOrigin: 'anonymous' })
    }

    const createBlank = (width: number, height: number, bgColor: string) => {
      if (!fabricCanvasRef.current) return

      fabricCanvasRef.current.clear()
      fabricCanvasRef.current.setWidth(width)
      fabricCanvasRef.current.setHeight(height)
      fabricCanvasRef.current.backgroundColor = bgColor
      fabricCanvasRef.current.renderAll()
      saveState()
    }

    const loadTemplate = (data: any) => {
      // Template loading will be implemented
      createBlank(data.width, data.height, data.bgColor)
    }

    const exportImage = (format: 'png' | 'jpeg' | 'webp'): string => {
      if (!fabricCanvasRef.current) return ''

      return fabricCanvasRef.current.toDataURL({
        format,
        quality: 1,
      })
    }

    const getCanvas = () => fabricCanvasRef.current

    // Metin ekleme
    const addText = () => {
      if (!fabricCanvasRef.current || !fabric) return

      const text = new fabric.IText('Metninizi yazın', {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: 40,
        fill: '#000000',
      })

      fabricCanvasRef.current.add(text)
      fabricCanvasRef.current.setActiveObject(text)
      fabricCanvasRef.current.renderAll()
    }

    // Dikdörtgen ekleme
    const addRect = () => {
      if (!fabricCanvasRef.current || !fabric) return

      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
      })

      fabricCanvasRef.current.add(rect)
      fabricCanvasRef.current.setActiveObject(rect)
      fabricCanvasRef.current.renderAll()
    }

    // Daire ekleme
    const addCircle = () => {
      if (!fabricCanvasRef.current || !fabric) return

      const circle = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 75,
        fill: '#10b981',
        stroke: '#059669',
        strokeWidth: 2,
      })

      fabricCanvasRef.current.add(circle)
      fabricCanvasRef.current.setActiveObject(circle)
      fabricCanvasRef.current.renderAll()
    }

    // Nesne döndürme
    const rotateObject = (angle: number) => {
      if (!fabricCanvasRef.current) return

      const activeObject = fabricCanvasRef.current.getActiveObject()
      if (activeObject) {
        activeObject.rotate((activeObject.angle || 0) + angle)
        fabricCanvasRef.current.renderAll()
      }
    }

    // Filtre uygulama
    const applyFilter = (filterType: string, value: number) => {
      if (!fabricCanvasRef.current || !fabric) return

      const activeObject = fabricCanvasRef.current.getActiveObject()
      if (activeObject && activeObject.type === 'image') {
        const image = activeObject as any

        // Mevcut filtreleri temizle
        image.filters = []

        // Yeni filtre ekle
        switch (filterType) {
          case 'brightness':
            image.filters.push(new fabric.Image.filters.Brightness({ brightness: value }))
            break
          case 'contrast':
            image.filters.push(new fabric.Image.filters.Contrast({ contrast: value }))
            break
          case 'saturation':
            image.filters.push(new fabric.Image.filters.Saturation({ saturation: value }))
            break
          case 'grayscale':
            image.filters.push(new fabric.Image.filters.Grayscale())
            break
          case 'sepia':
            image.filters.push(new fabric.Image.filters.Sepia())
            break
          case 'blur':
            image.filters.push(new fabric.Image.filters.Blur({ blur: value }))
            break
        }

        image.applyFilters()
        fabricCanvasRef.current.renderAll()
      }
    }

    // Kırpma
    const cropImage = () => {
      if (!fabricCanvasRef.current || !fabric) return

      const activeObject = fabricCanvasRef.current.getActiveObject()
      if (activeObject && activeObject.type === 'image') {
        // Basit kırpma - seçili alanı kullan
        const image = activeObject as any

        // Kırpma modu için crop rect oluştur
        const cropRect = new fabric.Rect({
          left: image.left,
          top: image.top,
          width: image.width! * (image.scaleX || 1),
          height: image.height! * (image.scaleY || 1),
          fill: 'transparent',
          stroke: '#3b82f6',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          selectable: true,
        })

        fabricCanvasRef.current.add(cropRect)
        fabricCanvasRef.current.setActiveObject(cropRect)
        fabricCanvasRef.current.renderAll()
      }
    }

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      loadImage,
      loadTemplate,
      createBlank,
      exportImage,
      undo,
      redo,
      getCanvas,
      addText,
      addRect,
      addCircle,
      rotateObject,
      applyFilter,
      cropImage,
    }))

    // Handle tool changes
    useEffect(() => {
      if (!fabricCanvasRef.current || !fabric) return

      const canvas = fabricCanvasRef.current

      // Reset selection mode
      canvas.isDrawingMode = false
      canvas.selection = true

      switch (activeTool) {
        case 'select':
          // Default selection mode
          break

        case 'draw':
          canvas.isDrawingMode = true
          canvas.freeDrawingBrush.color = '#000000'
          canvas.freeDrawingBrush.width = 5
          break

        case 'text':
          // Text tool will be handled by toolbar
          break

        case 'shape':
          // Shape tool will be handled by toolbar
          break

        case 'crop':
          // Crop tool implementation
          break

        case 'filter':
          // Filter tool will be handled by toolbar
          break
      }
    }, [activeTool, fabric])

    return (
      <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
        <canvas ref={canvasRef} />
      </div>
    )
  }
)

ImageCanvas.displayName = 'ImageCanvas'

export default ImageCanvas
