'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  X,
  Undo,
  Redo,
  Download,
  ImagePlus,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  BringToFront,
  SendToBack,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import ImageCanvas from './ImageCanvas'
import EditorToolbar from './EditorToolbar'
import ImageSearchPanel from './ImageSearchPanel'
import TemplateGallery from './TemplateGallery'
import EditorProperties from './EditorProperties'
import LayerPanel from './LayerPanel'

interface ImageEditorModalProps {
  open: boolean
  onClose: () => void
  initialImage?: string | null // URL veya null (yeni görsel oluşturma)
  onSave: (imageData: string, filename: string) => Promise<void>
}

export type EditorMode = 'edit' | 'search' | 'template' | 'blank'
export type Tool = 'select' | 'crop' | 'draw' | 'text' | 'filter' | 'pan' | 'transform' | 'bgremove'

export default function ImageEditorModal({
  open,
  onClose,
  initialImage,
  onSave
}: ImageEditorModalProps) {
  const { toast } = useToast()
  const canvasRef = useRef<any>(null)

  const [mode, setMode] = useState<EditorMode>(initialImage ? 'edit' : 'template')
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  // Canvas info state (görsel ve canvas boyutları)
  const [canvasInfo, setCanvasInfo] = useState({
    canvasWidth: 0,
    canvasHeight: 0,
    imageWidth: 0,
    imageHeight: 0,
    zoom: 100
  })

  // Blank canvas form state
  const [canvasWidth, setCanvasWidth] = useState(1200)
  const [canvasHeight, setCanvasHeight] = useState(630)
  const [canvasBgColor, setCanvasBgColor] = useState('#ffffff')

  // Modal açıldığında mode'u ayarla ve resmi yükle
  useEffect(() => {
    if (open) {
      if (initialImage) {
        console.log('🎨 Modal opened with image:', initialImage)
        setMode('edit') // Edit moduna geç

        // Canvas'ın hazır olmasını bekle
        const timer = setTimeout(() => {
          console.log('⏰ Timeout fired, attempting to load image')
          console.log('Canvas ref exists:', !!canvasRef.current)
          if (canvasRef.current) {
            canvasRef.current.loadImage(initialImage)
          } else {
            console.error('❌ Canvas ref is null!')
          }
        }, 500) // 500ms'e çıkardım

        return () => clearTimeout(timer)
      } else {
        // Yeni görsel oluşturma - template sekmesine git
        console.log('📝 Modal opened for new image creation')
        setMode('template')
      }
    }
  }, [open, initialImage])

  // Zoom event listener - Canvas'tan zoom değişimlerini dinle
  useEffect(() => {
    const handleZoomChange = (e: any) => {
      setZoomLevel(e.detail.zoom)
      // Zoom değiştiğinde canvas info'yu da güncelle
      updateCanvasInfo()
    }

    window.addEventListener('canvas-zoom-changed', handleZoomChange)
    return () => window.removeEventListener('canvas-zoom-changed', handleZoomChange)
  }, [])

  // Canvas info'yu güncelle
  const updateCanvasInfo = () => {
    if (canvasRef.current && canvasRef.current.getCanvasInfo) {
      const info = canvasRef.current.getCanvasInfo()
      setCanvasInfo(info)
    }
  }

  // Canvas info'yu periyodik olarak güncelle (kullanıcı zoom yaptığında vs)
  useEffect(() => {
    if (!open) return

    const interval = setInterval(() => {
      updateCanvasInfo()
    }, 500) // 500ms'de bir güncelle

    return () => clearInterval(interval)
  }, [open])


  const handleUndo = () => {
    canvasRef.current?.undo()
  }

  const handleRedo = () => {
    canvasRef.current?.redo()
  }

  // NOTE: Keyboard shortcuts TAMAMEN KALDIRILDI - Text editing engellemesi yüzünden
  // Undo/Redo için header'daki butonları kullanın

  // Detect if user is on Mac
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const handleDownload = () => {
    if (!canvasRef.current) return

    const dataURL = canvasRef.current.exportImage('png')
    const link = document.createElement('a')
    link.download = `edited-image-${Date.now()}.png`
    link.href = dataURL
    link.click()

    toast({
      title: 'Başarılı',
      description: 'Görsel indirildi'
    })
  }

  const handleSave = async () => {
    if (!canvasRef.current) return

    setIsSaving(true)
    try {
      const dataURL = canvasRef.current.exportImage('png')
      const filename = `edited-${Date.now()}.png`

      await onSave(dataURL, filename)

      toast({
        title: 'Başarılı',
        description: 'Görsel kütüphaneye kaydedildi'
      })

      onClose()
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: 'Hata',
        description: 'Görsel kaydedilemedi',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadFromSearch = (imageUrl: string) => {
    // Eğer edit modundaysak, yeni layer olarak ekle
    if (mode === 'edit') {
      canvasRef.current?.addImage(imageUrl)
    } else {
      // İlk görselse loadImage kullan
      canvasRef.current?.loadImage(imageUrl)
      setMode('edit')
    }
  }

  const handleLoadFromTemplate = (templateData: any) => {
    console.log('🔵 handleLoadFromTemplate called with:', templateData)

    // Önce mode'u edit yap ki Canvas mount olsun
    setMode('edit')

    // Canvas'ın mount olmasını bekle
    setTimeout(() => {
      if (!canvasRef.current) {
        console.log('❌ canvasRef is still null after mounting!')
        return
      }
      console.log('✅ Calling canvasRef.loadTemplate...')
      canvasRef.current.loadTemplate(templateData)
      console.log('✅ Template loaded')
    }, 100)
  }

  const handleCreateBlank = (width: number, height: number, bgColor: string) => {
    // Önce mode'u edit yap ki Canvas mount olsun
    setMode('edit')

    // Canvas'ın mount olmasını bekle
    setTimeout(() => {
      if (!canvasRef.current) {
        console.log('❌ canvasRef is still null after mounting!')
        return
      }
      canvasRef.current.createBlank(width, height, bgColor)
      console.log('✅ Blank canvas created')
    }, 100)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      {/* Hidden for accessibility */}
      <div className="sr-only">
        <h1>Gelişmiş Görsel Düzenleyici</h1>
        <p>Görselleri düzenlemek, katman eklemek ve filtre uygulamak için gelişmiş düzenleyici</p>
      </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Gelişmiş Görsel Düzenleyici</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              title={`Geri Al (${isMac ? '⌘' : 'Ctrl'}+Z)`}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              title={`İleri Al (${isMac ? '⌘' : 'Ctrl'}+Y)`}
            >
              <Redo className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* Zoom Controls */}
            {mode === 'edit' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    canvasRef.current?.zoomOut()
                    setZoomLevel(canvasRef.current?.getZoom() || 100)
                  }}
                  title="Uzaklaştır (Ctrl + Mouse Wheel)"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>

                <span className="text-xs font-mono min-w-[45px] text-center">
                  {zoomLevel}%
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    canvasRef.current?.zoomIn()
                    setZoomLevel(canvasRef.current?.getZoom() || 100)
                  }}
                  title="Yakınlaştır (Ctrl + Mouse Wheel)"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    canvasRef.current?.resetZoom()
                    setZoomLevel(100)
                  }}
                  title="Zoom Sıfırla"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-2" />
              </>
            )}

            {/* Alignment Tools */}
            {mode === 'edit' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvasRef.current?.alignLeft()}
                  title="Sola Hizala"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvasRef.current?.alignCenter()}
                  title="Ortaya Hizala (Yatay)"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvasRef.current?.alignRight()}
                  title="Sağa Hizala"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-200 mx-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvasRef.current?.alignTop()}
                  title="Üste Hizala"
                >
                  <AlignVerticalJustifyStart className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvasRef.current?.alignMiddle()}
                  title="Ortaya Hizala (Dikey)"
                >
                  <AlignVerticalJustifyCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvasRef.current?.alignBottom()}
                  title="Alta Hizala"
                >
                  <AlignVerticalJustifyEnd className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-200 mx-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvasRef.current?.bringToFront()}
                  title="Öne Getir"
                >
                  <BringToFront className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvasRef.current?.sendToBack()}
                  title="Arkaya Gönder"
                >
                  <SendToBack className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-2" />
              </>
            )}

            {/* Download */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="İndir"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* Save */}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>

            {/* Close */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {mode === 'edit' ? (
            <>
              {/* Left Sidebar - Tools */}
              <div className="w-20 border-r bg-gray-50 dark:bg-gray-900">
                <EditorToolbar
                  activeTool={activeTool}
                  onToolChange={setActiveTool}
                  canvasRef={canvasRef}
                  zoomLevel={zoomLevel}
                  onZoomChange={setZoomLevel}
                />
              </div>

              {/* Center - Canvas */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-950 overflow-hidden flex items-center justify-center p-8 relative">
                <ImageCanvas
                  ref={canvasRef}
                  activeTool={activeTool}
                  onHistoryChange={(undo, redo) => {
                    setCanUndo(undo)
                    setCanRedo(redo)
                  }}
                />

                {/* Canvas Bilgisi - Container'ın sağ altında */}
                <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-3 rounded-lg text-xs font-mono space-y-1 backdrop-blur-sm shadow-xl pointer-events-none">
                  <div className="flex items-center gap-2 text-blue-300 font-semibold mb-1">
                    <span>📊</span>
                    <span>Canvas Bilgisi</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Görsel:</span>
                      <span className="text-green-400">
                        {canvasInfo.imageWidth}x{canvasInfo.imageHeight}px
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Canvas:</span>
                      <span className="text-yellow-400">
                        {canvasInfo.canvasWidth}x{canvasInfo.canvasHeight}px
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Zoom:</span>
                      <span className="text-purple-400">{canvasInfo.zoom}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Properties & Layers */}
              <div className="flex flex-col">
                <EditorProperties
                  activeTool={activeTool}
                  canvasRef={canvasRef}
                />
                <LayerPanel canvasRef={canvasRef} />
              </div>
            </>
          ) : (
            // Başlangıç Ekranı
            <div className="flex-1 p-8 overflow-auto">
              <Tabs value={mode} onValueChange={(v) => setMode(v as EditorMode)} className="h-full flex flex-col">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                  <TabsTrigger value="template">
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Şablonlar
                  </TabsTrigger>
                  <TabsTrigger value="search">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Stok Fotoğraf
                  </TabsTrigger>
                  <TabsTrigger value="blank">
                    Boş Canvas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="template" className="flex-1 overflow-auto mt-6">
                  <TemplateGallery onSelect={handleLoadFromTemplate} />
                </TabsContent>

                <TabsContent value="search" className="flex-1 overflow-auto mt-6">
                  <ImageSearchPanel onSelect={handleLoadFromSearch} />
                </TabsContent>

                <TabsContent value="blank" className="flex-1 mt-6">
                  <div className="max-w-md mx-auto space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Boş Canvas Oluştur</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Sıfırdan görsel tasarlamak için canvas boyutunu belirleyin
                      </p>
                    </div>

                    {/* Hızlı Şablonlar */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hızlı Boyutlar</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => { setCanvasWidth(1200); setCanvasHeight(630) }}
                          className="text-xs"
                        >
                          1200x630 (OG Image)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { setCanvasWidth(1080); setCanvasHeight(1080) }}
                          className="text-xs"
                        >
                          1080x1080 (Instagram)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { setCanvasWidth(1920); setCanvasHeight(1080) }}
                          className="text-xs"
                        >
                          1920x1080 (HD)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { setCanvasWidth(800); setCanvasHeight(600) }}
                          className="text-xs"
                        >
                          800x600 (Standart)
                        </Button>
                      </div>
                    </div>

                    {/* Özel Boyut */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium">Özel Boyut</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-gray-500">Genişlik (px)</label>
                          <input
                            type="number"
                            value={canvasWidth}
                            onChange={(e) => setCanvasWidth(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-md"
                            min="100"
                            max="4000"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-gray-500">Yükseklik (px)</label>
                          <input
                            type="number"
                            value={canvasHeight}
                            onChange={(e) => setCanvasHeight(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-md"
                            min="100"
                            max="4000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Arka Plan Rengi */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Arka Plan Rengi</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={canvasBgColor}
                          onChange={(e) => setCanvasBgColor(e.target.value)}
                          className="w-20 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={canvasBgColor}
                          onChange={(e) => setCanvasBgColor(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md font-mono text-sm"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    {/* Oluştur Butonu */}
                    <Button
                      onClick={() => handleCreateBlank(canvasWidth, canvasHeight, canvasBgColor)}
                      className="w-full"
                      size="lg"
                    >
                      <ImagePlus className="w-4 h-4 mr-2" />
                      Canvas Oluştur ({canvasWidth}x{canvasHeight})
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

      </div>
    </div>
  )
}
