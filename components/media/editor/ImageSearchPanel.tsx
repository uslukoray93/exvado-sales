'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'

interface ImageSearchPanelProps {
  onSelect: (imageUrl: string) => void
}

export default function ImageSearchPanel({ onSelect }: ImageSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([
    // Demo başlangıç görselleri
    { id: '1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', description: 'Abstract' },
    { id: '2', url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600', description: 'Nature' },
    { id: '3', url: 'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?w=600', description: 'Technology' },
    { id: '4', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600', description: 'Gradient' },
    { id: '5', url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=600', description: 'Colors' },
    { id: '6', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=600', description: 'Pattern' },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      // Web'den ücretsiz görseller (Lorem Picsum)
      const endpoint = `/api/images/search/web?query=${encodeURIComponent(query)}`

      const response = await fetch(`http://localhost:4000${endpoint}`)
      const data = await response.json()

      if (data.success && data.data && data.data.length > 0) {
        setResults(data.data)
      } else {
        // Sonuç yok
        setResults([])
      }
    } catch (error) {
      // API bağlantı hatası
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Arama Başlığı */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Ücretsiz Görseller</h3>
        <p className="text-sm text-gray-500">
          Binlerce ücretsiz yüksek kaliteli fotoğraf - API key gerektirmez
        </p>
      </div>

      {/* Arama Kutusu */}
      <div className="flex gap-3">
        <Input
          placeholder="Görsel ara... (örn: office, nature, technology)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="text-base h-12"
        />
        <Button onClick={handleSearch} disabled={isLoading} size="lg" className="px-6">
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Aranıyor...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Ara
            </>
          )}
        </Button>
      </div>

      {/* Sonuçlar */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {results.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-4 ring-blue-500 transition-all transform hover:scale-105"
                onClick={() => {
                  console.log('🖼️ Image selected from search:', image.url)
                  onSelect(image.url)
                }}
              >
                <img
                  src={image.url}
                  alt={image.description || 'Web image'}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  loading="lazy"
                />
                {image.description && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                    {image.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Görsel aramak için anahtar kelime girin</p>
            <p className="text-sm mt-2">Web'den milyonlarca ücretsiz görsel - API key gerektirmez</p>
          </div>
        )}
      </div>
    </div>
  )
}
