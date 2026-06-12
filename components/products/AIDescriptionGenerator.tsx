"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sparkles, Loader2, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface AIDescriptionGeneratorProps {
  productData: {
    id?: string
    name?: string
    categoryId?: string
    brandId?: string
    shortDescription?: string
    specifications?: Record<string, string>
    warrantyPeriod?: number
  }
  onGenerate: (html: string) => void
  disabled?: boolean
}

export function AIDescriptionGenerator({
  productData,
  onGenerate,
  disabled = false
}: AIDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const wordCounts = [150, 250, 350, 500] as const

  const handleGenerate = async (wordCount: typeof wordCounts[number]) => {
    // Validasyon
    if (!productData.name) {
      toast({
        title: "Ürün adı gerekli",
        description: "Lütfen ürün adını girin",
        variant: "destructive"
      })
      return
    }

    if (!productData.categoryId) {
      toast({
        title: "Kategori gerekli",
        description: "Lütfen bir kategori seçin",
        variant: "destructive"
      })
      return
    }

    if (!productData.brandId) {
      toast({
        title: "Marka gerekli",
        description: "Lütfen bir marka seçin",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      // Token al
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Oturum bulunamadı')
      }

      // Backend'e istek gönder
      const response = await fetch('http://localhost:4000/api/products/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productData.id,
          name: productData.name,
          categoryId: productData.categoryId,
          brandId: productData.brandId,
          shortDescription: productData.shortDescription,
          specifications: productData.specifications,
          warrantyPeriod: productData.warrantyPeriod,
          wordCount
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // OpenAI entegrasyonu yoksa modal göster
        if (errorData.error?.includes('OpenAI')) {
          setShowSetupModal(true)
          return
        }

        throw new Error(errorData.error || 'Açıklama oluşturulamadı')
      }

      const data = await response.json()

      if (data.success && data.data.html) {
        // HTML içeriği editöre ekle
        onGenerate(data.data.html)

        toast({
          title: "İçerik oluşturuldu!",
          description: `${data.data.wordCount} kelimelik açıklama editöre eklendi`,
        })
      }
    } catch (error: any) {
      console.error('AI generation error:', error)
      toast({
        title: "Hata",
        description: error.message || "İçerik oluşturulamadı",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isGenerating || disabled}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI ile Oluştur
                <ChevronDown className="h-3 w-3 opacity-50" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {wordCounts.map((count) => (
            <DropdownMenuItem
              key={count}
              onClick={() => handleGenerate(count)}
              disabled={isGenerating}
            >
              {count} kelime
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* OpenAI Setup Modal */}
      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OpenAI Entegrasyonu Gerekli</DialogTitle>
            <DialogDescription>
              AI ile içerik oluşturmak için OpenAI API anahtarı gereklidir.
              Lütfen entegrasyonları ayarlayın.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSetupModal(false)}
            >
              İptal
            </Button>
            <Button
              onClick={() => {
                setShowSetupModal(false)
                router.push('/settings/integrations/optimization')
              }}
            >
              Entegrasyonları Ayarla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
