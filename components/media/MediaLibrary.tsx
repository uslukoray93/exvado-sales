'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  File,
  Upload,
  Search,
  Image as ImageIcon,
  FileText,
  Video,
  Grid3X3,
  List,
  Folder,
  FolderOpen,
  Eye,
  Loader2,
  RefreshCw,
  Trash2,
  FolderPlus,
  X,
  Copy,
  Download,
  ChevronRight,
  UploadCloud
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import FileContextMenu from './FileContextMenu'
import FileEditDialog from './FileEditDialog'
import ImageEditorModal from './editor/ImageEditorModal'

interface MediaLibraryProps {
  mode?: 'page' | 'modal'
  onSelect?: (file: any) => void
  showHeader?: boolean
  defaultFolder?: string // Parent'tan gelen varsayılan klasör
}

export default function MediaLibrary({
  mode = 'page',
  onSelect,
  showHeader = true,
  defaultFolder
}: MediaLibraryProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [selectedFolder, setSelectedFolder] = useState(defaultFolder || 'all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ file: any; x: number; y: number } | null>(null)
  const [editingFile, setEditingFile] = useState<any>(null)
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false)
  const [imageEditorFile, setImageEditorFile] = useState<string | null>(null)
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  // Medya dosyalarını çek
  const fetchFiles = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(selectedFolder !== 'all' && { folder: selectedFolder }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`http://localhost:4000/api/media?${params}`)
      const data = await response.json()

      if (data.success) {
        setFiles(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Fetch files error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // İstatistikleri çek
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/media/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  useEffect(() => {
    fetchFiles()
    fetchStats()
  }, [currentPage, selectedFolder, searchQuery])

  // defaultFolder değiştiğinde selectedFolder'ı güncelle
  useEffect(() => {
    if (defaultFolder) {
      setSelectedFolder(defaultFolder)
    }
  }, [defaultFolder])

  // Dosya tipine göre ikon
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5" />
      case 'VIDEO':
        return <Video className="w-5 h-5" />
      case 'PDF':
      case 'DOCUMENT':
        return <FileText className="w-5 h-5" />
      default:
        return <File className="w-5 h-5" />
    }
  }

  // Dosya rengini al
  const getFileColor = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return 'text-green-600 bg-green-100'
      case 'VIDEO':
        return 'text-purple-600 bg-purple-100'
      case 'PDF':
        return 'text-red-600 bg-red-100'
      case 'DOCUMENT':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Dosya seçme
  const handleFileClick = (file: any) => {
    // Her durumda sağ paneli aç
    setSelectedFile(file)

    // Modal modunda parent'a da bildir
    if (mode === 'modal' && onSelect) {
      onSelect(file)
    }
  }

  // URL kopyala
  const copyToClipboard = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:4000${url}`
    navigator.clipboard.writeText(fullUrl)
    toast({
      title: 'Başarılı',
      description: 'URL kopyalandı!'
    })
  }

  // Dosya indirme
  const handleDownload = async (file: any) => {
    const baseUrl = 'http://localhost:4000'
    const url = file.url.startsWith('http') ? file.url : `${baseUrl}${file.url}`

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = file.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)

      await fetch(`http://localhost:4000/api/media/${file.id}/download`, {
        method: 'POST'
      })

      toast({
        title: 'Başarılı',
        description: 'Dosya indirildi'
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Hata',
        description: 'Dosya indirilemedi',
        variant: 'destructive'
      })
    }
  }

  // Dosya silme
  const handleDelete = async (file: any) => {
    if (!confirm(`"${file.filename}" dosyasını silmek istediğinize emin misiniz?`)) return

    try {
      const response = await fetch(`http://localhost:4000/api/media/${file.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Dosya silindi'
        })
        fetchFiles()
        fetchStats()
        setSelectedFile(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Hata',
        description: 'Dosya silinemedi',
        variant: 'destructive'
      })
    }
  }

  // Dosya yükleme
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files
    if (!uploadFiles || uploadFiles.length === 0) return

    setIsUploading(true)
    try {
      const token = localStorage.getItem('token')

      // Akıllı klasör seçimi: selectedFolder > defaultFolder > 'general'
      const targetFolder = selectedFolder !== 'all'
        ? selectedFolder
        : (defaultFolder || 'general')

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i]
        const formData = new FormData()
        formData.append('file', file)

        await fetch(`http://localhost:4000/api/media/upload?folder=${targetFolder}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        })
      }

      toast({
        title: 'Başarılı',
        description: `${uploadFiles.length} dosya "${targetFolder}" klasörüne yüklendi`
      })

      fetchFiles()
      fetchStats()
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Dosya yüklenirken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  // Klasör renklerini al
  const getFolderColor = (folderName: string) => {
    const colors: { [key: string]: string } = {
      'products': 'bg-blue-100 text-blue-600',
      'categories': 'bg-green-100 text-green-600',
      'brands': 'bg-purple-100 text-purple-600',
      'temp': 'bg-gray-100 text-gray-600',
      'general': 'bg-orange-100 text-orange-600'
    }
    return colors[folderName] || 'bg-gray-100 text-gray-600'
  }

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent, file: any) => {
    e.preventDefault()
    setContextMenu({
      file,
      x: e.clientX,
      y: e.clientY
    })
  }

  const handlePreview = (file: any) => {
    setSelectedFile(file)
  }

  const handleRename = (file: any) => {
    const newName = prompt('Yeni dosya adı:', file.filename)
    if (!newName || newName === file.filename) return

    // TODO: Backend'e rename isteği gönder
    toast({
      title: 'Bilgi',
      description: 'Dosya yeniden adlandırma özelliği yakında eklenecek'
    })
  }

  const handleEdit = (file: any) => {
    setEditingFile(file)
  }

  const handleAdvancedEdit = (file: any) => {
    const baseUrl = 'http://localhost:4000'
    setImageEditorFile(`${baseUrl}${file.url}`)
    setIsImageEditorOpen(true)
  }

  const handleCreateNew = () => {
    setImageEditorFile(null) // null = yeni görsel oluştur
    setIsImageEditorOpen(true)
  }

  const handleSaveEditedImage = async (imageData: string, filename: string) => {
    try {
      const token = localStorage.getItem('token')

      // Base64'ü blob'a çevir
      const response = await fetch(imageData)
      const blob = await response.blob()

      // FormData oluştur
      const formData = new FormData()
      formData.append('file', blob, filename)

      // Backend'e yükle
      const targetFolder = selectedFolder !== 'all' ? selectedFolder : 'general'
      const uploadResponse = await fetch(
        `http://localhost:4000/api/media/upload?folder=${targetFolder}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      )

      if (uploadResponse.ok) {
        toast({
          title: 'Başarılı',
          description: 'Düzenlenen görsel kütüphaneye kaydedildi'
        })
        fetchFiles()
        fetchStats()
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Save edited image error:', error)
      toast({
        title: 'Hata',
        description: 'Görsel kaydedilemedi',
        variant: 'destructive'
      })
      throw error
    }
  }

  // Yeni klasör oluştur
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: 'Uyarı',
        description: 'Klasör adı boş olamaz',
        variant: 'destructive'
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:4000/api/media/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newFolderName.trim() })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Başarılı',
          description: `"${newFolderName}" klasörü oluşturuldu`
        })
        setIsNewFolderDialogOpen(false)
        setNewFolderName('')
        fetchStats() // İstatistikleri güncelle
      } else {
        throw new Error(data.message || 'Folder creation failed')
      }
    } catch (error: any) {
      console.error('Create folder error:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Klasör oluşturulamadı',
        variant: 'destructive'
      })
    }
  }

  const handleSaveEdit = async (data: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/media/${editingFile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: data.title,
          altText: data.altText,
          // filename güncellemesi backend'de desteklenmiyor
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Başarılı',
          description: 'Dosya bilgileri güncellendi'
        })
        fetchFiles()
        // Eğer düzenlenen dosya seçili dosyaysa, onu da güncelle
        if (selectedFile?.id === editingFile.id) {
          setSelectedFile(result.data)
        }
        setEditingFile(null)
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast({
        title: 'Hata',
        description: 'Dosya bilgileri güncellenemedi',
        variant: 'destructive'
      })
      throw error
    }
  }

  const handleRefresh = (file: any) => {
    fetchFiles()
    toast({
      title: 'Başarılı',
      description: 'Dosyalar yenilendi'
    })
  }

  const handleCopyUrl = (file: any) => {
    const baseUrl = 'http://localhost:4000'
    const fullUrl = `${baseUrl}${file.url}`
    navigator.clipboard.writeText(fullUrl)
    toast({
      title: 'Başarılı',
      description: 'URL kopyalandı'
    })
  }

  return (
    <div className="flex h-full">
      {/* Sol Sidebar - Klasör Navigasyonu */}
      <div className="w-60 flex-shrink-0 border-r bg-gray-50/50 dark:bg-gray-900/50">
        <div className="p-4 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
            Klasörler
          </h3>

          {/* Tüm Dosyalar */}
          <button
            onClick={() => setSelectedFolder('all')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedFolder === 'all'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span className="flex-1 text-left">Tüm Dosyalar</span>
            <span className="text-xs text-gray-500">
              {stats?.totalFiles || 0}
            </span>
          </button>

          <Separator className="my-3" />

          {/* Dinamik Klasörler */}
          {stats?.byFolder?.map((folder: any) => (
            <button
              key={folder.folder}
              onClick={() => setSelectedFolder(folder.folder)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedFolder === folder.folder
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className={`p-1 rounded ${getFolderColor(folder.folder)}`}>
                <FolderOpen className="w-3 h-3" />
              </div>
              <span className="flex-1 text-left capitalize">{folder.folder}</span>
              <span className="text-xs text-gray-500">
                {folder._count.folder}
              </span>
            </button>
          ))}

          {/* Yeni Klasör Butonu */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => setIsNewFolderDialogOpen(true)}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Yeni Klasör
          </Button>
        </div>
      </div>

      {/* Orta Panel - Dosya Listesi */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
              <Folder className="w-4 h-4" />
              <span className="capitalize font-medium">
                {selectedFolder === 'all' ? 'Tüm Dosyalar' : selectedFolder}
              </span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Arama */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Dosya ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* Sağ Butonlar */}
            <div className="flex items-center gap-2 ml-auto">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateNew}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Yeni Görsel Oluştur
              </Button>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4 mr-2" />
                )}
                Yükle
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchFiles()}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dosya Grid/List */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <File className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Dosya bulunamadı</p>
              <p className="text-sm text-gray-400 mt-1">
                Yeni dosya yükleyin veya filtreleri değiştirin
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className={`grid gap-4 ${
              selectedFile
                ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}>
              {files.map((file) => {
                const baseUrl = 'http://localhost:4000'
                // URL zaten tam URL mi kontrol et
                const imageUrl = file.url.startsWith('http')
                  ? file.url
                  : `${baseUrl}${file.url}`
                const isSelected = selectedFile?.id === file.id
                return (
                  <Card
                    key={file.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleFileClick(file)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                  >
                    <CardContent className="p-3">
                      {/* Thumbnail */}
                      <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                        {file.type === 'IMAGE' ? (
                          <img
                            src={`${imageUrl}?t=${new Date(file.updatedAt).getTime()}`}
                            alt={file.altText || file.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`p-4 rounded-lg ${getFileColor(file.type)}`}>
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.filename}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {file.type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => {
                const baseUrl = 'http://localhost:4000'
                // URL zaten tam URL mi kontrol et
                const imageUrl = file.url.startsWith('http')
                  ? file.url
                  : `${baseUrl}${file.url}`
                const isSelected = selectedFile?.id === file.id
                return (
                  <div
                    key={file.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleFileClick(file)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                  >
                    {/* Icon/Thumbnail */}
                    <div className="w-10 h-10 flex-shrink-0">
                      {file.type === 'IMAGE' ? (
                        <img
                          src={`${imageUrl}?t=${new Date(file.updatedAt).getTime()}`}
                          alt={file.filename}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${getFileColor(file.type)}`}>
                          {getFileIcon(file.type)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>

                    {/* Type Badge */}
                    <Badge variant="secondary" className="flex-shrink-0">
                      {file.type}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Sayfa {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sağ Panel - Dosya Detayları */}
      {selectedFile && (
        <div className="w-80 flex-shrink-0 border-l bg-white dark:bg-gray-900 overflow-auto">
          <div className="p-4 space-y-4 sticky top-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Dosya Detayları</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview */}
            {selectedFile.type === 'IMAGE' ? (
              <div className="rounded-lg border overflow-hidden bg-black/5">
                <img
                  src={selectedFile.url.startsWith('http') ? selectedFile.url : `http://localhost:4000${selectedFile.url}`}
                  alt={selectedFile.filename}
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg border bg-gray-50 flex items-center justify-center">
                <div className={`p-4 rounded-lg ${getFileColor(selectedFile.type)}`}>
                  {getFileIcon(selectedFile.type)}
                </div>
              </div>
            )}

            <Separator />

            {/* File Info */}
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">Dosya Adı</p>
                <p className="font-medium break-all">{selectedFile.filename}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Boyut</p>
                <p className="font-medium">{formatFileSize(selectedFile.size)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Tip</p>
                <Badge variant="secondary">{selectedFile.type}</Badge>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Klasör</p>
                <p className="font-medium capitalize">{selectedFile.folder}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Yüklenme Tarihi</p>
                <p className="text-xs">
                  {new Date(selectedFile.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <Separator />

            {/* URL */}
            <div>
              <p className="text-xs text-gray-500 mb-2">URL</p>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <input
                  readOnly
                  value={selectedFile.url.startsWith('http') ? selectedFile.url : `http://localhost:4000${selectedFile.url}`}
                  className="flex-1 bg-transparent text-xs font-mono outline-none cursor-text"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => copyToClipboard(selectedFile.url)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleDownload(selectedFile)}
              >
                <Download className="h-3 w-3 mr-1" />
                İndir
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700"
                onClick={() => handleDelete(selectedFile)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Sil
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onClose={() => setContextMenu(null)}
          onPreview={handlePreview}
          onRename={handleRename}
          onEdit={handleEdit}
          onAdvancedEdit={handleAdvancedEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          onCopyUrl={handleCopyUrl}
          onDownload={handleDownload}
        />
      )}

      {/* Edit Dialog */}
      <FileEditDialog
        file={editingFile}
        open={!!editingFile}
        onClose={() => setEditingFile(null)}
        onSave={handleSaveEdit}
      />

      {/* Yeni Klasör Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Klasör Oluştur</DialogTitle>
            <DialogDescription>
              Medya dosyalarınız için yeni bir klasör oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Klasör Adı</Label>
              <Input
                id="folderName"
                placeholder="Örn: urunler, blog, kampanyalar"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateFolder}>
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Editor Modal */}
      <ImageEditorModal
        open={isImageEditorOpen}
        onClose={() => setIsImageEditorOpen(false)}
        initialImage={imageEditorFile}
        onSave={handleSaveEditedImage}
      />
    </div>
  )
}
