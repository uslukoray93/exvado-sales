'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Minus,
  Plus,
  ChevronDown as ChevronDownIcon,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LayerPanelProps {
  canvasRef: any
}

interface Layer {
  id: string
  name: string
  type: string
  visible: boolean
  locked: boolean
  selected: boolean
  object: any
}

export default function LayerPanel({ canvasRef }: LayerPanelProps) {
  const [layers, setLayers] = useState<Layer[]>([])
  const [forceUpdate, setForceUpdate] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Canvas'taki değişiklikleri dinle
  useEffect(() => {
    console.log('🎨 LayerPanel useEffect - canvasRef:', canvasRef.current)
    if (!canvasRef.current) {
      console.log('❌ canvasRef.current is null')
      return
    }

    // Canvas hazır olana kadar bekle (retry mechanism)
    let retryCount = 0
    const maxRetries = 10
    const retryInterval = 100 // 100ms

    const tryInitialize = () => {
      const canvas = canvasRef.current?.getCanvas()
      console.log(`🖼️ Canvas (retry ${retryCount}):`, canvas)

      if (!canvas) {
        retryCount++
        if (retryCount < maxRetries) {
          console.log(`⏳ Canvas not ready, retrying in ${retryInterval}ms...`)
          setTimeout(tryInitialize, retryInterval)
          return
        } else {
          console.log('❌ canvas is still null after max retries')
          return
        }
      }

      console.log('✅ Canvas is ready! Initializing layers...')

      const updateLayers = () => {
        // UNDO/REDO sırasında updateLayers çalışmasın!
        if ((canvas as any)._isLoadingHistory) {
          console.log('⏸️ LayerPanel: Skipping update (undo/redo in progress)')
          return
        }

        const objects = canvas.getObjects()
        const activeObject = canvas.getActiveObject()
        console.log('📦 Updating layers - objects count:', objects.length)

        // Object layers (nesneler)
        const objectLayers: Layer[] = objects.map((obj: any, index: number) => {
          // Layer ismi oluştur
          let name = 'Nesne'
          let icon = Square

          switch (obj.type) {
            case 'image':
              name = obj.name || `Görsel ${index + 1}`
              break
            case 'i-text':
            case 'text':
              name = obj.text ? obj.text.substring(0, 20) : `Metin ${index + 1}`
              break
            case 'rect':
              name = `Dikdörtgen ${index + 1}`
              break
            case 'circle':
              name = `Daire ${index + 1}`
              break
            case 'triangle':
              name = `Üçgen ${index + 1}`
              break
            case 'polygon':
              name = `Çokgen ${index + 1}`
              break
            case 'line':
              name = `Çizgi ${index + 1}`
              break
            case 'path':
              name = `Çizim ${index + 1}`
              break
            case 'group':
              name = `Grup ${index + 1}`
              break
            default:
              name = `${obj.type} ${index + 1}`
          }

          return {
            id: obj.id || `layer-${index}`,
            name: obj.name || name,
            type: obj.type,
            visible: obj.visible !== false,
            locked: obj.selectable === false,
            selected: obj === activeObject,
            object: obj
          }
        }).reverse() // En üstteki layer en üstte görünsün

        // Background layer (canvas arka planı - her zaman en altta)
        const backgroundLayer: Layer = {
          id: 'background-layer',
          name: 'Canvas (Arka Plan)',
          type: 'background',
          visible: true,
          locked: false,
          selected: !activeObject, // Hiçbir nesne seçili değilse background seçili
          object: null
        }

        // Background layer'ı en sona ekle (görsel olarak en altta)
        setLayers([...objectLayers, backgroundLayer])
      }

      // İlk yükleme
      updateLayers()

      // Canvas event listeners
      canvas.on('object:added', updateLayers)
      canvas.on('object:removed', updateLayers)
      canvas.on('object:modified', updateLayers)
      canvas.on('selection:created', updateLayers)
      canvas.on('selection:updated', updateLayers)
      canvas.on('selection:cleared', updateLayers)

      // Cleanup function
      return () => {
        canvas.off('object:added', updateLayers)
        canvas.off('object:removed', updateLayers)
        canvas.off('object:modified', updateLayers)
        canvas.off('selection:created', updateLayers)
        canvas.off('selection:updated', updateLayers)
        canvas.off('selection:cleared', updateLayers)
      }
    }

    // Başlat
    tryInitialize()
  }, [canvasRef, forceUpdate])

  const selectLayer = (layer: Layer) => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    // Background layer seçildiğinde tüm seçimleri temizle
    if (layer.type === 'background') {
      canvas.discardActiveObject()
      canvas.renderAll()
      return
    }

    // Normal nesne seçimi
    canvas.setActiveObject(layer.object)
    canvas.renderAll()
  }

  const toggleVisibility = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation()
    if (layer.type === 'background') return // Background layer için devre dışı

    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    layer.object.set('visible', !layer.visible)
    canvas.renderAll()
    setForceUpdate(prev => prev + 1)
  }

  const toggleLock = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation()
    if (layer.type === 'background') return // Background layer için devre dışı

    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    const newLocked = !layer.locked
    layer.object.set({
      selectable: !newLocked,
      evented: !newLocked
    })
    canvas.renderAll()
    setForceUpdate(prev => prev + 1)
  }

  const deleteLayer = (layer: Layer) => {
    if (layer.type === 'background') return // Background layer silinemez

    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    canvas.remove(layer.object)
    canvas.renderAll()
  }

  const duplicateLayer = (layer: Layer) => {
    if (layer.type === 'background') return // Background layer çoğaltılamaz

    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    // Fabric.js yeni versiyonunda clone async
    if (typeof layer.object.clone === 'function') {
      const result = layer.object.clone()
      if (result && typeof result.then === 'function') {
        // Promise dönüyor
        result.then((cloned: any) => {
          cloned.set({
            left: (cloned.left || 0) + 10,
            top: (cloned.top || 0) + 10,
          })
          canvas.add(cloned)
          canvas.setActiveObject(cloned)
          canvas.renderAll()
        })
      } else {
        // Eski API callback
        layer.object.clone((cloned: any) => {
          cloned.set({
            left: (cloned.left || 0) + 10,
            top: (cloned.top || 0) + 10,
          })
          canvas.add(cloned)
          canvas.setActiveObject(cloned)
          canvas.renderAll()
        })
      }
    }
  }

  const moveLayerUp = (layer: Layer) => {
    if (layer.type === 'background') return // Background layer taşınamaz

    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    canvas.bringForward(layer.object)
    canvas.renderAll()
    setForceUpdate(prev => prev + 1)
  }

  const moveLayerDown = (layer: Layer) => {
    if (layer.type === 'background') return // Background layer taşınamaz

    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    canvas.sendBackwards(layer.object)
    canvas.renderAll()
    setForceUpdate(prev => prev + 1)
  }

  // Yeni katman ekleme fonksiyonları
  const handleAddText = () => {
    canvasRef.current?.addText()
  }

  const handleAddShape = (shape: string) => {
    switch (shape) {
      case 'rect':
        canvasRef.current?.addRect()
        break
      case 'circle':
        canvasRef.current?.addCircle()
        break
      case 'triangle':
        canvasRef.current?.addTriangle()
        break
      case 'star':
        canvasRef.current?.addStar()
        break
      case 'line':
        canvasRef.current?.addLine()
        break
    }
  }

  const handleAddImage = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir görsel dosyası seçin')
      return
    }

    // Boyut kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu 10MB\'dan küçük olmalıdır')
      return
    }

    // FileReader ile yükle
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      canvasRef.current?.addImage(imageUrl)
    }
    reader.readAsDataURL(file)

    // Input'u sıfırla (aynı dosya tekrar seçilebilsin)
    e.target.value = ''
  }

  // Drag & Drop handlers
  const handleDragStart = (index: number) => {
    // Background layer sürüklenemez
    if (layers[index]?.type === 'background') return
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    // Background layer'a drop yapılamaz
    if (layers[index]?.type === 'background') return
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Background layer'a drop yapılamaz
    if (layers[dropIndex]?.type === 'background') {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    const draggedLayer = layers[draggedIndex]
    const targetLayer = layers[dropIndex]

    if (!draggedLayer?.object || !targetLayer?.object) return

    // Canvas'ta z-index değiştir
    // Layer listesi reverse olduğu için index'ler ters
    const draggedCanvasIndex = canvas.getObjects().indexOf(draggedLayer.object)
    const targetCanvasIndex = canvas.getObjects().indexOf(targetLayer.object)

    if (draggedCanvasIndex !== -1 && targetCanvasIndex !== -1) {
      // insertAt yerine moveTo kullan (Fabric.js v6+)
      if (typeof draggedLayer.object.moveTo === 'function') {
        draggedLayer.object.moveTo(targetCanvasIndex)
      } else {
        // Eski API: remove + add
        canvas.remove(draggedLayer.object)
        const objects = canvas.getObjects()
        objects.splice(targetCanvasIndex, 0, draggedLayer.object)
        canvas._objects = objects
      }
      canvas.renderAll()
      setForceUpdate(prev => prev + 1)
    }

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'background':
        return <Square className="w-4 h-4 fill-current" />
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'i-text':
      case 'text':
        return <Type className="w-4 h-4" />
      case 'rect':
        return <Square className="w-4 h-4" />
      case 'circle':
        return <Circle className="w-4 h-4" />
      case 'triangle':
        return <Triangle className="w-4 h-4" />
      case 'polygon':
        return <Star className="w-4 h-4" />
      case 'line':
        return <Minus className="w-4 h-4" />
      default:
        return <Square className="w-4 h-4" />
    }
  }

  return (
    <div className="w-80 border-l bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Katmanlar</h3>
            <p className="text-xs text-gray-500 mt-1">
              {layers.length} katman
            </p>
          </div>
        </div>

        {/* Yeni Katman Butonları */}
        <div className="flex gap-1">
          {/* Text Butonu */}
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleAddText}
            title="Metin Ekle"
          >
            <Type className="w-4 h-4 mr-1" />
            <span className="text-xs">Metin</span>
          </Button>

          {/* Shape Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                title="Şekil Ekle"
              >
                <Square className="w-4 h-4 mr-1" />
                <span className="text-xs">Şekil</span>
                <ChevronDownIcon className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleAddShape('rect')}>
                <Square className="w-4 h-4 mr-2" />
                Dikdörtgen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddShape('circle')}>
                <Circle className="w-4 h-4 mr-2" />
                Daire
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddShape('triangle')}>
                <Triangle className="w-4 h-4 mr-2" />
                Üçgen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddShape('star')}>
                <Star className="w-4 h-4 mr-2" />
                Yıldız
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddShape('line')}>
                <Minus className="w-4 h-4 mr-2" />
                Çizgi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Image Butonu */}
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleAddImage}
            title="Görsel Ekle"
          >
            <ImageIcon className="w-4 h-4 mr-1" />
            <span className="text-xs">Görsel</span>
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Layer List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {layers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Square className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Henüz katman yok</p>
              <p className="text-xs mt-1">Canvas'a nesne ekleyin</p>
            </div>
          ) : (
            layers.map((layer, index) => (
              <ContextMenu key={layer.id || index}>
                <ContextMenuTrigger>
                  <div
                    draggable={layer.type !== 'background'}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      group relative flex items-center gap-2 p-2 rounded-md transition-all
                      ${layer.type !== 'background' ? 'cursor-move' : 'cursor-pointer'}
                      hover:bg-gray-100 dark:hover:bg-gray-800
                      ${layer.selected ? 'bg-blue-100 dark:bg-blue-900 border border-blue-500' : ''}
                      ${!layer.visible ? 'opacity-50' : ''}
                      ${draggedIndex === index ? 'opacity-40 scale-95' : ''}
                      ${dragOverIndex === index && draggedIndex !== index ? 'border-t-2 border-blue-500' : ''}
                    `}
                    onClick={() => selectLayer(layer)}
                  >
                    {/* Icon */}
                    <div className="text-gray-600 dark:text-gray-400">
                      {getLayerIcon(layer.type)}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{layer.name}</p>
                    </div>

                    {/* Actions - Background layer için gizle */}
                    {layer.type !== 'background' && (
                      <div className="flex items-center gap-1">
                        {/* Visibility Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => toggleVisibility(layer, e)}
                        >
                          {layer.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </Button>

                        {/* Lock Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => toggleLock(layer, e)}
                        >
                          {layer.locked ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Unlock className="w-3 h-3" />
                          )}
                        </Button>

                        {/* Move Up/Down */}
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-3 w-4 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveLayerUp(layer)
                            }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-3 w-4 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveLayerDown(layer)
                            }}
                            disabled={index === layers.length - 1}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </ContextMenuTrigger>

                {/* Context Menu - Background layer için gizle */}
                {layer.type !== 'background' && (
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => duplicateLayer(layer)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Çoğalt
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => deleteLayer(layer)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sil
                    </ContextMenuItem>
                  </ContextMenuContent>
                )}
              </ContextMenu>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
