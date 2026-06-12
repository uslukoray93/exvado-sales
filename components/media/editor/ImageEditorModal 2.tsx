'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import ImageCanvas from './ImageCanvas'
import EditorToolbar from './EditorToolbar'
import ImageSearchPanel from './ImageSearchPanel'
import TemplateGallery from './TemplateGallery'
import EditorProperties from './EditorProperties'

interface ImageEditorModalProps {
  open: boolean
  onClose: () => void
  initialImage?: string | null // URL veya null (yeni görsel oluşturma)
  onSave: (imageData: string, filename: string) => Promise<void>
}

export type EditorMode = 'edit' | 'search' | 'template' | 'blank'
export type Tool = 'select' | 'crop' | 'draw' | 'text' | 'shape' | 'filter'

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

  // Canvas hazır olduğunda resmi yükle
  useEffect(() => {
    if (open && initialImage && canvasRef.current) {
      canvasRef.current.loadImage(initialImage)
    }
  }, [open, initialImage])

  const handleUndo = () => {
    canvasRef.current?.undo()
  }

  const handleRedo = () => {
    canvasRef.current?.redo()
  }

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
    canvasRef.current?.loadImage(imageUrl)
    setMode('edit')
  }

  const handleLoadFromTemplate = (templateData: any) => {
    canvasRef.current?.loadTemplate(templateData)
    setMode('edit')
  }

  const handleCreateBlank = (width: number, height: number, bgColor: string) => {
    canvasRef.current?.createBlank(width, height, bgColor)
    setMode('edit')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-none !w-[100vw] !h-[100vh] p-0 gap-0 !rounded-none !top-0 !left-0 !translate-x-0 !translate-y-0 m-0">
        <VisuallyHidden>
          <DialogTitle>Gelişmiş Görsel Düzenleyici</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
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
              title="Geri Al (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              title="İleri Al (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

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
                />
              </div>

              {/* Center - Canvas */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-950">
                <ImageCanvas
                  ref={canvasRef}
                  activeTool={activeTool}
                  onHistoryChange={(undo, redo) => {
                    setCanUndo(undo)
                    setCanRedo(redo)
                  }}
                />
              </div>

              {/* Right Sidebar - Properties */}
              <EditorProperties
                activeTool={activeTool}
                canvasRef={canvasRef}
              />
            </>
          ) : (
            // Başlangıç Ekranı
            <div className="flex-1 p-8">
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
                  <div className="max-w-md mx-auto space-y-4">
                    <h3 className="text-lg font-semibold">Boş Canvas Oluştur</h3>
                    <p className="text-sm text-gray-500">
                      Sıfırdan görsel tasarlamak için canvas boyutunu seçin
                    </p>
                    {/* Blank canvas form will be added */}
                    <Button onClick={() => handleCreateBlank(1200, 630, '#ffffff')}>
                      1200x630 Canvas Oluştur
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
