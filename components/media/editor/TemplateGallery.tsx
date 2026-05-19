'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TemplateGalleryProps {
  onSelect: (template: any) => void
}

const templates = [
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    bgColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    category: 'Social Media'
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    bgColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    category: 'Social Media'
  },
  {
    id: 'facebook-cover',
    name: 'Facebook Kapak',
    width: 820,
    height: 312,
    bgColor: '#3b5998',
    category: 'Social Media'
  },
  {
    id: 'twitter-header',
    name: 'X (Twitter) Header',
    width: 1500,
    height: 500,
    bgColor: '#1da1f2',
    category: 'Social Media'
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    bgColor: '#ff0000',
    category: 'Video'
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    width: 1200,
    height: 627,
    bgColor: '#0077b5',
    category: 'Social Media'
  },
  {
    id: 'blog-featured',
    name: 'Blog Öne Çıkan Görsel',
    width: 1200,
    height: 630,
    bgColor: '#f8f9fa',
    category: 'Web'
  },
]

export default function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Hazır Şablonlar</h3>
      <p className="text-sm text-gray-500 mb-6">
        Sosyal medya ve web için optimize edilmiş boyutlar
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {templates.map((template) => {
          // Her şablon için gerçek oranı hesapla
          const aspectRatio = template.width / template.height

          // Preview boyutları: max 200px height, width orana göre
          let previewHeight = 150
          let previewWidth = previewHeight * aspectRatio

          // Çok geniş olanları sınırla
          if (previewWidth > 250) {
            previewWidth = 250
            previewHeight = previewWidth / aspectRatio
          }

          return (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition hover:ring-2 ring-blue-500"
              onClick={() => onSelect(template)}
            >
              <CardContent className="p-4">
                <div className="w-full flex items-center justify-center mb-3" style={{ minHeight: '100px' }}>
                  <div
                    className="rounded flex items-center justify-center text-white font-semibold text-sm"
                    style={{
                      background: template.bgColor,
                      width: `${previewWidth}px`,
                      height: `${previewHeight}px`,
                    }}
                  >
                    {template.width} x {template.height}
                  </div>
                </div>
                <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
