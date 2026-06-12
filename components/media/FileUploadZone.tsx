'use client'

import { useCallback, useState } from 'react'
import { Upload, X, FileIcon, Image as ImageIcon, Video, FileText, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface FileUploadZoneProps {
  folder?: string
  onUploadComplete?: (files: any[]) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // MB cinsinden
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  id: string
}

export default function FileUploadZone({
  folder = 'general',
  onUploadComplete,
  multiple = true,
  accept = 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv',
  maxSize = 50
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  // Dosya tipine göre ikon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8" />
    if (type.startsWith('video/')) return <Video className="w-8 h-8" />
    if (type === 'application/pdf') return <FileText className="w-8 h-8" />
    if (type.includes('document') || type.includes('sheet') || type.includes('word') || type.includes('excel')) {
      return <FileIcon className="w-8 h-8" />
    }
    return <File className="w-8 h-8" />
  }

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Dosya yükleme
  const uploadFile = async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)

    // Folder'ı query parameter olarak gönder (multer body'i parse edemez)
    const response = await fetch(`http://localhost:4000/api/media/upload?folder=${folder}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Yükleme başarısız')
    }

    return response.json()
  }

  // Dosyaları işle
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    // Boyut kontrolü
    const validFiles = fileArray.filter(file => {
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > maxSize) {
        alert(`${file.name} dosyası çok büyük (Max: ${maxSize}MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Tek dosya modunda sadece ilk dosyayı al
    const filesToUpload = multiple ? validFiles : [validFiles[0]]

    // Yükleme durumu başlat
    const uploadingFilesData: UploadingFile[] = filesToUpload.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      id: Math.random().toString(36).substr(2, 9)
    }))

    setUploadingFiles(prev => [...prev, ...uploadingFilesData])

    // Paralel yükleme
    const uploadPromises = uploadingFilesData.map(async (uploadingFile) => {
      try {
        // Simüle edilmiş ilerleme (gerçek XMLHttpRequest ile daha detaylı yapılabilir)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === uploadingFile.id && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          )
        }, 200)

        const result = await uploadFile(uploadingFile.file)

        clearInterval(progressInterval)

        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadingFile.id
              ? { ...f, progress: 100, status: 'success' as const }
              : f
          )
        )

        return result.data
      } catch (error: any) {
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadingFile.id
              ? { ...f, status: 'error' as const, error: error.message }
              : f
          )
        )
        return null
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)
    const successfulUploads = uploadedFiles.filter(f => f !== null)

    if (onUploadComplete && successfulUploads.length > 0) {
      onUploadComplete(successfulUploads)
    }

    // 2 saniye sonra başarılı yüklemeleri temizle
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.status !== 'success'))
    }, 2000)
  }, [folder, multiple, maxSize, onUploadComplete])

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    handleFiles(e.dataTransfer.files)
  }

  // Dosya seçimi
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  // Yükleme iptal
  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-colors cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
      >
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragging ? 'Dosyaları buraya bırakın' : 'Dosyaları sürükleyip bırakın'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              veya tıklayarak dosya seçin
            </p>
          </div>

          <div className="text-xs text-gray-400">
            <p>Maksimum dosya boyutu: {maxSize}MB</p>
            <p className="mt-1">
              Desteklenen formatlar: JPG, PNG, GIF, WebP, MP4, PDF, DOCX, XLSX, vb.
            </p>
          </div>
        </div>
      </div>

      {/* Yüklenen Dosyalar */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile) => (
            <div
              key={uploadingFile.id}
              className="flex items-center gap-3 p-3 bg-white border rounded-lg"
            >
              {/* Dosya İkonu */}
              <div className="flex-shrink-0 text-gray-400">
                {getFileIcon(uploadingFile.file.type)}
              </div>

              {/* Dosya Bilgileri */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadingFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadingFile.file.size)}
                </p>

                {/* İlerleme Çubuğu */}
                {uploadingFile.status === 'uploading' && (
                  <Progress value={uploadingFile.progress} className="h-1 mt-2" />
                )}

                {/* Hata Mesajı */}
                {uploadingFile.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">
                    {uploadingFile.error}
                  </p>
                )}

                {/* Başarı Mesajı */}
                {uploadingFile.status === 'success' && (
                  <p className="text-xs text-green-500 mt-1">
                    Yükleme tamamlandı
                  </p>
                )}
              </div>

              {/* Kapat Butonu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeUploadingFile(uploadingFile.id)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
