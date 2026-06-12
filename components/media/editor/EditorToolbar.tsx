'use client'

import { Button } from '@/components/ui/button'
import {
  MousePointer2,
  Crop,
  Pencil,
  Type,
  Square,
  Sliders,
  Eraser,
  Palette,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  Move,
  Scissors,
} from 'lucide-react'
import type { Tool } from './ImageEditorModal'

interface EditorToolbarProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  canvasRef: any
  zoomLevel?: number
  onZoomChange?: (level: number) => void
}

const tools: Array<{ id: Tool; icon: any; label: string }> = [
  { id: 'select', icon: MousePointer2, label: 'Seç' },
  { id: 'pan', icon: Hand, label: 'Kaydır' },
  { id: 'transform', icon: Move, label: 'Transform' },
  { id: 'crop', icon: Crop, label: 'Kırp' },
  { id: 'bgremove', icon: Scissors, label: 'Bg Remove' },
  { id: 'draw', icon: Pencil, label: 'Çiz' },
  { id: 'text', icon: Type, label: 'Metin' },
  { id: 'filter', icon: Sliders, label: 'Filtre' },
]

export default function EditorToolbar({
  activeTool,
  onToolChange,
  canvasRef,
  zoomLevel = 100,
  onZoomChange
}: EditorToolbarProps) {
  const handleToolClick = (toolId: Tool) => {
    console.log(`🔧 EditorToolbar: Tool clicked: ${toolId}`)
    onToolChange(toolId)

    // Bazı araçlar için direkt aksiyon al
    if (canvasRef.current) {
      switch (toolId) {
        case 'text':
          canvasRef.current.addText()
          break
        case 'crop':
          canvasRef.current.cropImage()
          break
      }
    }
  }

  const handleZoomIn = () => {
    if (canvasRef.current) {
      canvasRef.current.zoomIn()
      if (onZoomChange) {
        const newZoom = canvasRef.current.getZoom()
        onZoomChange(Math.round(newZoom * 100))
      }
    }
  }

  const handleZoomOut = () => {
    if (canvasRef.current) {
      canvasRef.current.zoomOut()
      if (onZoomChange) {
        const newZoom = canvasRef.current.getZoom()
        onZoomChange(Math.round(newZoom * 100))
      }
    }
  }

  const handleResetZoom = () => {
    if (canvasRef.current) {
      canvasRef.current.resetZoom()
      if (onZoomChange) {
        onZoomChange(100)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-between h-full">
      <div className="flex flex-col items-center gap-2 p-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id

          return (
            <Button
              key={tool.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              className="w-14 h-14 flex flex-col gap-1"
              onClick={() => handleToolClick(tool.id)}
              title={tool.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{tool.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Zoom Controls */}
      <div className="flex flex-col items-center gap-2 p-2 border-t w-full">
        <Button
          variant="ghost"
          size="sm"
          className="w-14 h-10"
          onClick={handleZoomIn}
          title="Yakınlaştır"
        >
          <ZoomIn className="w-5 h-5" />
        </Button>

        <div className="text-xs font-mono text-center">
          {zoomLevel}%
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-14 h-10"
          onClick={handleZoomOut}
          title="Uzaklaştır"
        >
          <ZoomOut className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-14 h-10"
          onClick={handleResetZoom}
          title="Sıfırla (100%)"
        >
          <Maximize2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
