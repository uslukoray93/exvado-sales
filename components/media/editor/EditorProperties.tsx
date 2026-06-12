'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RotateCw,
  RotateCcw,
  Circle,
  Square,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Triangle,
  Star,
  Minus,
  ArrowRight,
  Scissors,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Tool } from './ImageEditorModal'

interface EditorPropertiesProps {
  activeTool: Tool
  canvasRef: any
}

export default function EditorProperties({
  activeTool,
  canvasRef
}: EditorPropertiesProps) {
  const { toast } = useToast()

  // Filter states
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [blur, setBlur] = useState(0)

  // Text states
  const [selectedObject, setSelectedObject] = useState<any>(null)
  const [fontSize, setFontSize] = useState(40)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [textColor, setTextColor] = useState('#000000')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [textAlign, setTextAlign] = useState('left')

  // Text stroke (kontur) states
  const [textStrokeColor, setTextStrokeColor] = useState('#000000')
  const [textStrokeWidth, setTextStrokeWidth] = useState(0)

  // Text shadow states
  const [shadowColor, setShadowColor] = useState('#000000')
  const [shadowBlur, setShadowBlur] = useState(0)
  const [shadowOffsetX, setShadowOffsetX] = useState(0)
  const [shadowOffsetY, setShadowOffsetY] = useState(0)

  // Shape states
  const [fillColor, setFillColor] = useState('#3b82f6')
  const [strokeColor, setStrokeColor] = useState('#1e40af')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [opacity, setOpacity] = useState(100)

  // Drawing states
  const [brushColor, setBrushColorState] = useState('#000000')
  const [brushWidth, setBrushWidthState] = useState(2)
  const [isEraser, setIsEraser] = useState(false)

  // Background removal states
  const [isRemovingBg, setIsRemovingBg] = useState(false)
  const [bgRemovalStatus, setBgRemovalStatus] = useState<string>('')

  // Listen for object selection changes
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current.getCanvas()
    if (!canvas) return

    const handleSelection = () => {
      const activeObj = canvas.getActiveObject()
      console.log('🔍 Selection changed:', activeObj?.type, activeObj)
      setSelectedObject(activeObj)

      // Update text states if text is selected
      if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'textbox')) {
        setFontSize(activeObj.fontSize || 40)
        setFontFamily(activeObj.fontFamily || 'Arial')
        setTextColor(activeObj.fill || '#000000')
        setIsBold(activeObj.fontWeight === 'bold')
        setIsItalic(activeObj.fontStyle === 'italic')
        setIsUnderline(activeObj.underline || false)
        setTextAlign(activeObj.textAlign || 'left')
      }

      // Update shape states if shape is selected
      if (activeObj && (activeObj.type === 'rect' || activeObj.type === 'circle' || activeObj.type === 'triangle' || activeObj.type === 'polygon' || activeObj.type === 'line')) {
        setFillColor(activeObj.fill || '#3b82f6')
        setStrokeColor(activeObj.stroke || '#1e40af')
        setStrokeWidth(activeObj.strokeWidth || 2)
        setOpacity(Math.round((activeObj.opacity || 1) * 100))
      }
    }

    // İlk yükleme için mevcut seçimi kontrol et
    const currentSelection = canvas.getActiveObject()
    if (currentSelection) {
      console.log('🔍 Initial selection:', currentSelection?.type)
      setSelectedObject(currentSelection)
    }

    canvas.on('selection:created', handleSelection)
    canvas.on('selection:updated', handleSelection)
    canvas.on('selection:cleared', () => {
      console.log('🔍 Selection cleared')
      setSelectedObject(null)
    })

    return () => {
      canvas.off('selection:created', handleSelection)
      canvas.off('selection:updated', handleSelection)
      canvas.off('selection:cleared')
    }
  }, [canvasRef, activeTool])

  const handleRotate = (angle: number) => {
    canvasRef.current?.rotateObject(angle)
  }

  const handleAddShape = (shape: 'rect' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow') => {
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
      case 'arrow':
        canvasRef.current?.addArrow()
        break
    }
  }

  const handleDeleteSelected = () => {
    const canvas = canvasRef.current?.getCanvas()
    if (canvas) {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        canvas.remove(activeObject)
        canvas.renderAll()
      }
    }
  }

  const handleRemoveBackground = async () => {
    console.log('🎨 handleRemoveBackground called')
    console.log('   canvasRef.current:', !!canvasRef.current)
    console.log('   selectedObject:', selectedObject)

    if (!canvasRef.current) {
      console.log('   ❌ Returning early - missing canvasRef')
      toast({
        title: 'Hata',
        description: 'Canvas bulunamadı.',
        variant: 'destructive',
      })
      return
    }

    const canvas = canvasRef.current.getCanvas()
    const hasSelectedImage = selectedObject && selectedObject.type === 'image'
    const hasBackgroundImage = canvas?.backgroundImage

    if (!hasSelectedImage && !hasBackgroundImage) {
      console.log('   ❌ Returning early - no image selected and no background image')
      toast({
        title: 'Hata',
        description: 'Lütfen bir görsel katmanı seçin veya canvas arka planı ayarlayın.',
        variant: 'destructive',
      })
      return
    }

    setIsRemovingBg(true)
    setBgRemovalStatus('Model yükleniyor...')

    // Simulate progress updates
    const statusTimer = setTimeout(() => {
      setBgRemovalStatus('Arka plan temizleniyor...')
    }, 5000)

    try {
      await canvasRef.current.removeBackground()

      clearTimeout(statusTimer)
      setBgRemovalStatus('')

      toast({
        title: 'Başarılı!',
        description: 'Arka plan başarıyla temizlendi.',
      })
    } catch (error: any) {
      clearTimeout(statusTimer)
      setBgRemovalStatus('')

      console.error('Background removal failed:', error)

      const errorMessage = error?.message || 'Bilinmeyen bir hata oluştu'

      toast({
        title: 'Arka Plan Temizleme Başarısız',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsRemovingBg(false)
      setBgRemovalStatus('')
    }
  }

  const applyBrightness = (value: number[]) => {
    const val = value[0]
    setBrightness(val)
    canvasRef.current?.applyFilter('brightness', val / 100)
  }

  const applyContrast = (value: number[]) => {
    const val = value[0]
    setContrast(val)
    canvasRef.current?.applyFilter('contrast', val / 100)
  }

  const applySaturation = (value: number[]) => {
    const val = value[0]
    setSaturation(val)
    canvasRef.current?.applyFilter('saturation', val / 100)
  }

  const applyBlur = (value: number[]) => {
    const val = value[0]
    setBlur(val)
    canvasRef.current?.applyFilter('blur', val / 100)
  }

  const applyGrayscale = () => {
    canvasRef.current?.applyFilter('grayscale', 1)
  }

  const applySepia = () => {
    canvasRef.current?.applyFilter('sepia', 1)
  }

  const applyInvert = () => {
    canvasRef.current?.applyFilter('invert', 1)
  }

  // Text property handlers
  const updateTextProperty = (property: string, value: any) => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    const activeObj = canvas.getActiveObject()
    if (!activeObj || (activeObj.type !== 'i-text' && activeObj.type !== 'textbox')) return

    activeObj.set(property, value)
    canvas.renderAll()
  }

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0]
    setFontSize(newSize)
    updateTextProperty('fontSize', newSize)
  }

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family)
    updateTextProperty('fontFamily', family)
  }

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setTextColor(color)
    updateTextProperty('fill', color)
  }

  const toggleBold = () => {
    const newBold = !isBold
    setIsBold(newBold)
    updateTextProperty('fontWeight', newBold ? 'bold' : 'normal')
  }

  const toggleItalic = () => {
    const newItalic = !isItalic
    setIsItalic(newItalic)
    updateTextProperty('fontStyle', newItalic ? 'italic' : 'normal')
  }

  const toggleUnderline = () => {
    const newUnderline = !isUnderline
    setIsUnderline(newUnderline)
    updateTextProperty('underline', newUnderline)
  }

  const handleTextAlignChange = (align: string) => {
    setTextAlign(align)

    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    const activeObj = canvas.getActiveObject() as any
    if (!activeObj) return

    // Textbox veya Group olabilir (önceki hizalama group oluşturmuşsa)
    let textToAlign = activeObj
    let originalText = ''
    let textProps: any = {}

    if (activeObj.type === 'group') {
      // Group ise, içindeki text bilgilerini al
      const firstText = activeObj._objects?.[0]
      if (!firstText) return

      // Tüm satırları birleştir
      originalText = activeObj._objects.map((obj: any) => obj.text).join('\n')
      textProps = {
        fontSize: firstText.fontSize,
        fontFamily: firstText.fontFamily,
        fontWeight: firstText.fontWeight,
        fontStyle: firstText.fontStyle,
        fill: firstText.fill,
        stroke: firstText.stroke,
        strokeWidth: firstText.strokeWidth,
        underline: firstText.underline,
        shadow: firstText.shadow,
      }
    } else if (activeObj.type === 'textbox') {
      if (activeObj.isEditing) {
        activeObj.exitEditing()
      }
      originalText = activeObj.text
      textProps = {
        fontSize: activeObj.fontSize,
        fontFamily: activeObj.fontFamily,
        fontWeight: activeObj.fontWeight,
        fontStyle: activeObj.fontStyle,
        fill: activeObj.fill,
        stroke: activeObj.stroke,
        strokeWidth: activeObj.strokeWidth,
        underline: activeObj.underline,
        shadow: activeObj.shadow,
      }
    } else {
      return
    }

    const Fabric = (window as any).fabric
    const lines = originalText.split('\n')

    // Her satır için Text nesnesi oluştur
    const textObjs = lines.map((line: string) =>
      new Fabric.Text(line || ' ', textProps)
    )

    // En uzun satırın genişliğini bul
    const maxWidth = Math.max(...textObjs.map((t: any) => t.width || 0))

    // Her satırı hizalama tipine göre konumlandır
    textObjs.forEach((textObj: any, i: number) => {
      const lineWidth = textObj.width || 0
      let x = 0

      if (align === 'center') {
        x = (maxWidth - lineWidth) / 2
      } else if (align === 'right') {
        x = maxWidth - lineWidth
      }

      textObj.set({
        left: x,
        top: i * textProps.fontSize * 1.2,
      })
    })

    // Yeni group oluştur
    const group = new Fabric.Group(textObjs, {
      left: activeObj.left,
      top: activeObj.top,
      angle: activeObj.angle,
      scaleX: activeObj.scaleX,
      scaleY: activeObj.scaleY,
    })

    // Eski objeyi sil, yenisini ekle
    canvas.remove(activeObj)
    canvas.add(group)
    canvas.setActiveObject(group)
    canvas.renderAll()
  }

  // Shape property handlers
  const updateShapeProperty = (property: string, value: any) => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return

    const activeObj = canvas.getActiveObject()
    if (!activeObj || activeObj.type === 'i-text' || activeObj.type === 'image') return

    activeObj.set(property, value)
    canvas.renderAll()
  }

  const handleFillColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setFillColor(color)
    updateShapeProperty('fill', color)
  }

  const handleStrokeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setStrokeColor(color)
    updateShapeProperty('stroke', color)
  }

  const handleStrokeWidthChange = (value: number[]) => {
    const width = value[0]
    setStrokeWidth(width)
    updateShapeProperty('strokeWidth', width)
  }

  const handleOpacityChange = (value: number[]) => {
    const opacityVal = value[0]
    setOpacity(opacityVal)
    updateShapeProperty('opacity', opacityVal / 100)
  }

  // Drawing handlers
  const handleBrushColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setBrushColorState(color)
    canvasRef.current?.setBrushColor(color)
  }

  const handleBrushWidthChange = (value: number[]) => {
    const width = value[0]
    setBrushWidthState(width)
    canvasRef.current?.setBrushWidth(width)
  }

  const toggleEraser = () => {
    const newEraser = !isEraser
    setIsEraser(newEraser)
    canvasRef.current?.setEraserMode(newEraser)
  }

  return (
    <div className="w-80 border-l bg-white dark:bg-gray-900 overflow-auto">
      <div className="p-4 space-y-6">
        {/* Genel Araçlar */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Genel Araçlar</h3>

          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 hover:text-red-700"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Seçili Nesneyi Sil
            </Button>
          </div>
        </div>

        <Separator />

        {/* Crop Araçları */}
        {activeTool === 'crop' && (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-3">Kırpma Araçları</h3>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">
                  Bir görseli seçin ve kırpma alanını ayarlayın
                </p>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const isCrop = canvasRef.current?.isCropMode()
                    if (isCrop) {
                      canvasRef.current?.applyCrop()
                    } else {
                      canvasRef.current?.cropImage()
                    }
                  }}
                >
                  {canvasRef.current?.isCropMode() ? 'Kırpmayı Uygula' : 'Kırpma Başlat'}
                </Button>
                {canvasRef.current?.isCropMode() && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => canvasRef.current?.cancelCrop()}
                  >
                    İptal
                  </Button>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Çizim Araçları */}
        {activeTool === 'draw' && (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-3">Çizim Araçları</h3>

              <div className="space-y-4">
                {/* Fırça Rengi */}
                <div>
                  <Label className="text-xs mb-2 block">Fırça Rengi</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={brushColor}
                      onChange={handleBrushColorChange}
                      className="w-16 h-9 rounded border cursor-pointer"
                      disabled={isEraser}
                    />
                    <Input
                      type="text"
                      value={brushColor}
                      onChange={handleBrushColorChange}
                      className="flex-1 h-9 font-mono text-xs"
                      placeholder="#000000"
                      disabled={isEraser}
                    />
                  </div>
                </div>

                {/* Fırça Kalınlığı */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Fırça Kalınlığı</Label>
                    <span className="text-xs text-gray-500">{brushWidth}px</span>
                  </div>
                  <Slider
                    value={[brushWidth]}
                    onValueChange={handleBrushWidthChange}
                    min={1}
                    max={50}
                    step={1}
                  />
                </div>

                {/* Silgi Modu */}
                <div>
                  <Button
                    variant={isEraser ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={toggleEraser}
                  >
                    {isEraser ? 'Silgi Aktif' : 'Silgi Modu'}
                  </Button>
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Metin Özellikleri */}
        {(activeTool === 'text' || (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'textbox'))) && (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-3">Metin Özellikleri</h3>

              {activeTool === 'text' && (
                <Button
                  onClick={() => canvasRef.current?.addText()}
                  className="w-full mb-4"
                  size="sm"
                >
                  Metin Ekle
                </Button>
              )}

              <div className="space-y-4">
                {/* Font Ailesi */}
                <div>
                  <Label className="text-xs mb-2 block">Font Ailesi</Label>
                  <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Arial Black">Arial Black</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Times">Times</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Courier">Courier</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Palatino">Palatino</SelectItem>
                      <SelectItem value="Garamond">Garamond</SelectItem>
                      <SelectItem value="Bookman">Bookman</SelectItem>
                      <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                      <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                      <SelectItem value="Impact">Impact</SelectItem>
                      <SelectItem value="Lucida Sans">Lucida Sans</SelectItem>
                      <SelectItem value="Tahoma">Tahoma</SelectItem>
                      <SelectItem value="Lucida Console">Lucida Console</SelectItem>
                      <SelectItem value="Monaco">Monaco</SelectItem>
                      <SelectItem value="Brush Script MT">Brush Script MT</SelectItem>
                      <SelectItem value="Papyrus">Papyrus</SelectItem>
                      <SelectItem value="Copperplate">Copperplate</SelectItem>
                      <SelectItem value="Optima">Optima</SelectItem>
                      <SelectItem value="Futura">Futura</SelectItem>
                      <SelectItem value="Gill Sans">Gill Sans</SelectItem>
                      <SelectItem value="Century Gothic">Century Gothic</SelectItem>
                      <SelectItem value="Calibri">Calibri</SelectItem>
                      <SelectItem value="Cambria">Cambria</SelectItem>
                      <SelectItem value="Candara">Candara</SelectItem>
                      <SelectItem value="Consolas">Consolas</SelectItem>
                      <SelectItem value="Constantia">Constantia</SelectItem>
                      <SelectItem value="Corbel">Corbel</SelectItem>
                      <SelectItem value="Franklin Gothic Medium">Franklin Gothic Medium</SelectItem>
                      <SelectItem value="Rockwell">Rockwell</SelectItem>
                      <SelectItem value="Baskerville">Baskerville</SelectItem>
                      <SelectItem value="Didot">Didot</SelectItem>
                      <SelectItem value="American Typewriter">American Typewriter</SelectItem>
                      <SelectItem value="Andale Mono">Andale Mono</SelectItem>
                      <SelectItem value="monospace">Monospace</SelectItem>
                      <SelectItem value="sans-serif">Sans-serif</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="cursive">Cursive</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Boyutu (Punto) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Punto (Font Size)</Label>
                    <span className="text-xs text-gray-500">{fontSize}px</span>
                  </div>
                  <Slider
                    value={[fontSize]}
                    onValueChange={handleFontSizeChange}
                    min={8}
                    max={200}
                    step={1}
                  />
                </div>

                {/* Metin Rengi */}
                <div>
                  <Label className="text-xs mb-2 block">Metin Rengi</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={handleTextColorChange}
                      className="w-16 h-9 rounded border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={handleTextColorChange}
                      className="flex-1 h-9 font-mono text-xs"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Metin Stilleri */}
                <div>
                  <Label className="text-xs mb-2 block">Metin Stili</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={isBold ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={toggleBold}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isItalic ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={toggleItalic}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isUnderline ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={toggleUnderline}
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Metin Hizalama */}
                <div>
                  <Label className="text-xs mb-2 block">Metin Hizalama</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={textAlign === 'left' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTextAlignChange('left')}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={textAlign === 'center' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTextAlignChange('center')}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={textAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTextAlignChange('right')}
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-3" />

                {/* Kontur (Stroke) */}
                <div>
                  <Label className="text-xs mb-2 block">Kontur</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textStrokeColor}
                        onChange={(e) => {
                          setTextStrokeColor(e.target.value)
                          canvasRef.current?.setTextStroke(e.target.value, textStrokeWidth)
                        }}
                        className="w-16 h-9 rounded border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={textStrokeColor}
                        onChange={(e) => {
                          setTextStrokeColor(e.target.value)
                          canvasRef.current?.setTextStroke(e.target.value, textStrokeWidth)
                        }}
                        className="flex-1 h-9 font-mono text-xs"
                        placeholder="#000000"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Kontur Kalınlığı</Label>
                        <span className="text-xs text-gray-500">{textStrokeWidth}px</span>
                      </div>
                      <Slider
                        value={[textStrokeWidth]}
                        onValueChange={(value) => {
                          setTextStrokeWidth(value[0])
                          canvasRef.current?.setTextStroke(textStrokeColor, value[0])
                        }}
                        min={0}
                        max={20}
                        step={1}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-3" />

                {/* Gölge (Shadow) */}
                <div>
                  <Label className="text-xs mb-2 block">Gölge</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={shadowColor}
                        onChange={(e) => {
                          setShadowColor(e.target.value)
                          canvasRef.current?.setTextShadow(e.target.value, shadowBlur, shadowOffsetX, shadowOffsetY)
                        }}
                        className="w-16 h-9 rounded border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={shadowColor}
                        onChange={(e) => {
                          setShadowColor(e.target.value)
                          canvasRef.current?.setTextShadow(e.target.value, shadowBlur, shadowOffsetX, shadowOffsetY)
                        }}
                        className="flex-1 h-9 font-mono text-xs"
                        placeholder="#000000"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Gölge Bulanıklığı</Label>
                        <span className="text-xs text-gray-500">{shadowBlur}px</span>
                      </div>
                      <Slider
                        value={[shadowBlur]}
                        onValueChange={(value) => {
                          setShadowBlur(value[0])
                          canvasRef.current?.setTextShadow(shadowColor, value[0], shadowOffsetX, shadowOffsetY)
                        }}
                        min={0}
                        max={50}
                        step={1}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Gölge X Mesafesi</Label>
                        <span className="text-xs text-gray-500">{shadowOffsetX}px</span>
                      </div>
                      <Slider
                        value={[shadowOffsetX]}
                        onValueChange={(value) => {
                          setShadowOffsetX(value[0])
                          canvasRef.current?.setTextShadow(shadowColor, shadowBlur, value[0], shadowOffsetY)
                        }}
                        min={-50}
                        max={50}
                        step={1}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Gölge Y Mesafesi</Label>
                        <span className="text-xs text-gray-500">{shadowOffsetY}px</span>
                      </div>
                      <Slider
                        value={[shadowOffsetY]}
                        onValueChange={(value) => {
                          setShadowOffsetY(value[0])
                          canvasRef.current?.setTextShadow(shadowColor, shadowBlur, shadowOffsetX, value[0])
                        }}
                        min={-50}
                        max={50}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Şekil Araçları */}
        {activeTool === 'shape' && (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-3">Şekil Ekle</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddShape('rect')}
                >
                  <Square className="w-4 h-4 mr-1" />
                  Dikdörtgen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddShape('circle')}
                >
                  <Circle className="w-4 h-4 mr-1" />
                  Daire
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddShape('triangle')}
                >
                  <Triangle className="w-4 h-4 mr-1" />
                  Üçgen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddShape('star')}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Yıldız
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddShape('line')}
                >
                  <Minus className="w-4 h-4 mr-1" />
                  Çizgi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddShape('arrow')}
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Ok
                </Button>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Şekil Özellikleri */}
        {selectedObject && (selectedObject.type === 'rect' || selectedObject.type === 'circle' || selectedObject.type === 'triangle' || selectedObject.type === 'polygon' || selectedObject.type === 'line') && (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-3">Şekil Özellikleri</h3>

              <div className="space-y-4">
                {/* Dolgu Rengi */}
                <div>
                  <Label className="text-xs mb-2 block">Dolgu Rengi</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={fillColor}
                      onChange={handleFillColorChange}
                      className="w-16 h-9 rounded border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={fillColor}
                      onChange={handleFillColorChange}
                      className="flex-1 h-9 font-mono text-xs"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                {/* Border (Kenarlık) Rengi */}
                <div>
                  <Label className="text-xs mb-2 block">Border (Kenarlık) Rengi</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={handleStrokeColorChange}
                      className="w-16 h-9 rounded border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={strokeColor}
                      onChange={handleStrokeColorChange}
                      className="flex-1 h-9 font-mono text-xs"
                      placeholder="#1e40af"
                    />
                  </div>
                </div>

                {/* Border Kalınlığı */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Border Kalınlığı</Label>
                    <span className="text-xs text-gray-500">{strokeWidth}px</span>
                  </div>
                  <Slider
                    value={[strokeWidth]}
                    onValueChange={handleStrokeWidthChange}
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>

                {/* Opacity (Saydamlık) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Opacity (Saydamlık)</Label>
                    <span className="text-xs text-gray-500">{opacity}%</span>
                  </div>
                  <Slider
                    value={[opacity]}
                    onValueChange={handleOpacityChange}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Arka Plan Kaldırma */}
        {activeTool === 'bgremove' && (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-3">Arka Plan Kaldırma</h3>

              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedObject && selectedObject.type === 'image'
                    ? `Seçili katman: ${selectedObject.type} (${selectedObject.name || 'isimsiz'})`
                    : canvasRef.current?.getCanvas()?.backgroundImage
                    ? 'Canvas arka plan görseli seçili'
                    : 'Lütfen bir görsel katmanı seçin veya canvas arka planı ayarlayın.'}
                </div>

                <Button
                  onClick={handleRemoveBackground}
                  disabled={(!selectedObject || selectedObject.type !== 'image') && !canvasRef.current?.getCanvas()?.backgroundImage || isRemovingBg}
                  className="w-full"
                  size="lg"
                >
                  {isRemovingBg ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {bgRemovalStatus || 'İşleniyor...'}
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4 mr-2" />
                      Arka Plan Temizliğini Başlat
                    </>
                  )}
                </Button>

                {isRemovingBg && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Loader2 className="w-4 h-4 mt-0.5 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="text-xs space-y-1">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {bgRemovalStatus}
                        </p>
                        <p className="text-blue-700 dark:text-blue-300">
                          Remove.bg API kullanılıyor. İşlem genellikle 2-5 saniye sürer.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isRemovingBg && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="font-semibold">Nasıl kullanılır:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Bir görsel katmanı seçin VEYA canvas arka planını ayarlayın</li>
                      <li>"Arka Plan Temizliğini Başlat" butonuna tıklayın</li>
                      <li>İşlem 2-5 saniye sürer (Remove.bg API)</li>
                    </ul>
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-blue-800 dark:text-blue-200">
                      <p className="text-xs">
                        💡 Backend üzerinden Remove.bg API kullanılıyor. API key backend'de tanımlı.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Filtre Araçları */}
        {activeTool === 'filter' && (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-3">Filtreler</h3>

              <div className="space-y-4">
                {/* Brightness */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Parlaklık</Label>
                    <span className="text-xs text-gray-500">{brightness}</span>
                  </div>
                  <Slider
                    value={[brightness]}
                    onValueChange={applyBrightness}
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Kontrast</Label>
                    <span className="text-xs text-gray-500">{contrast}</span>
                  </div>
                  <Slider
                    value={[contrast]}
                    onValueChange={applyContrast}
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Doygunluk</Label>
                    <span className="text-xs text-gray-500">{saturation}</span>
                  </div>
                  <Slider
                    value={[saturation]}
                    onValueChange={applySaturation}
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Blur */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Bulanıklık</Label>
                    <span className="text-xs text-gray-500">{blur}</span>
                  </div>
                  <Slider
                    value={[blur]}
                    onValueChange={applyBlur}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyGrayscale}
                >
                  Siyah-Beyaz
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applySepia}
                >
                  Sepya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyInvert}
                >
                  Negatif
                </Button>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Bilgi */}
        <div className="text-xs text-gray-500">
          <p className="font-semibold mb-1">Kısayollar:</p>
          <ul className="space-y-1">
            <li>• Ctrl+Z - Geri Al</li>
            <li>• Ctrl+Y - İleri Al</li>
            <li>• Delete - Sil</li>
            <li>• Ctrl+C/V - Kopyala/Yapıştır</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
