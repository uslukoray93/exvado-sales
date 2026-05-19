"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Eye,
  Edit
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = "Metin girin..." }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "html">("visual")

  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById("editor-textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    // Cursor pozisyonunu ayarla
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const toolbarButtons = [
    { icon: Bold, label: "Kalın", action: () => insertText("**", "**") },
    { icon: Italic, label: "İtalik", action: () => insertText("*", "*") },
    { icon: Underline, label: "Alt Çizgi", action: () => insertText("<u>", "</u>") },
    { icon: List, label: "Liste", action: () => insertText("\n- ") },
    { icon: ListOrdered, label: "Numaralı Liste", action: () => insertText("\n1. ") },
    { icon: Link, label: "Bağlantı", action: () => insertText("[", "](https://example.com)") },
    { icon: Image, label: "Resim", action: () => insertText("![", "](image-url.jpg)") },
    { icon: Code, label: "Kod", action: () => insertText("`", "`") }
  ]

  const renderPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n- (.*)/g, '<ul><li>$1</li></ul>')
      .replace(/\n\d+\. (.*)/g, '<ol><li>$1</li></ol>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 underline">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto" />')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "visual" | "html")}>
        <div className="border-b bg-gray-50 dark:bg-slate-800">
          <TabsList className="h-auto p-1 bg-transparent">
            <TabsTrigger value="visual" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Görsel</span>
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>HTML</span>
            </TabsTrigger>
          </TabsList>

          {activeTab === "visual" && (
            <div className="flex flex-wrap gap-1 p-2 border-t">
              {toolbarButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  title={button.label}
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="visual" className="m-0">
          <div className="grid grid-cols-2 min-h-[300px]">
            <div className="border-r">
              <Textarea
                id="editor-textarea"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[300px] border-0 resize-none focus-visible:ring-0 rounded-none"
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900 overflow-y-auto">
              <h4 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Önizleme:</h4>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPreview(value) || '<p class="text-gray-400 italic">Önizleme burada görünecek...</p>' }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="html" className="m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="HTML kodunu buraya yazabilirsiniz..."
            className="min-h-[300px] border-0 resize-none focus-visible:ring-0 rounded-none font-mono text-sm"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}