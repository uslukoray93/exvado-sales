"use client"

import React, { useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Search,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
  Eye,
  ChevronRight,
  ChevronDown,
  User,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

// Platform type
type Platform = "trendyol" | "n11" | "hepsiburada" | "bolbolbul"

// Question status
type QuestionStatus = "pending" | "answered" | "closed"

// Question type
type Question = {
  id: string
  platform: Platform
  productName: string
  productSku: string
  customerName: string
  question: string
  answer: string | null
  status: QuestionStatus
  askedDate: string
  answeredDate: string | null
  orderId?: string
}

// Platform logos
const platformLogos: Record<Platform, string> = {
  trendyol: "/platforms/trendyol.png",
  n11: "/platforms/n11.png",
  hepsiburada: "/platforms/hepsiburada.png",
  bolbolbul: "/platforms/bolbolbul.png",
}

// Sample questions
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "1",
    platform: "trendyol",
    productName: "Bosch GSR 12V-15 Akülü Vidalama",
    productSku: "BSH-GSR-12V",
    customerName: "Ahmet Y.",
    question: "Bu ürünün garantisi kaç yıl? Türkiye garantisi var mı?",
    answer: null,
    status: "pending",
    askedDate: "2026-02-28 10:30",
    answeredDate: null,
  },
  {
    id: "2",
    platform: "hepsiburada",
    productName: "Makita DHP484 Darbeli Matkap",
    productSku: "MKT-DHP484",
    customerName: "Mehmet K.",
    question: "Bataryası dahil mi? Kaç amper saatlik batarya geliyor?",
    answer: null,
    status: "pending",
    askedDate: "2026-02-28 09:15",
    answeredDate: null,
  },
  {
    id: "3",
    platform: "n11",
    productName: "DeWalt DCD796 Darbeli Matkap",
    productSku: "DWT-DCD796",
    customerName: "Ayşe D.",
    question: "Çantası var mı bu üründe?",
    answer: "Evet, ürün orijinal DeWalt çantası ile birlikte gönderilmektedir.",
    status: "answered",
    askedDate: "2026-02-27 16:20",
    answeredDate: "2026-02-27 16:45",
  },
  {
    id: "4",
    platform: "bolbolbul",
    productName: "Black&Decker KR504RE Darbeli Matkap",
    productSku: "BD-KR504RE",
    customerName: "Fatma Ş.",
    question: "Kablo uzunluğu ne kadar? Bahçede kullanacağım.",
    answer: "Ürünün kablo uzunluğu 3 metredir. Bahçe kullanımı için uzatma kablosu kullanmanızı öneririz.",
    status: "answered",
    askedDate: "2026-02-27 14:10",
    answeredDate: "2026-02-27 14:30",
  },
  {
    id: "5",
    platform: "trendyol",
    productName: "Hilti SF 6H-A22 Akülü Vidalama",
    productSku: "HLT-SF6H",
    customerName: "Ali Ç.",
    question: "Fırçasız motor mu? LED ışığı var mı?",
    answer: null,
    status: "pending",
    askedDate: "2026-02-28 08:45",
    answeredDate: null,
  },
  {
    id: "6",
    platform: "hepsiburada",
    productName: "Stanley STHR202 Kırıcı Delici",
    productSku: "STN-STHR202",
    customerName: "Zeynep A.",
    question: "Beton delmek için uygun mudur? SDS plus mu?",
    answer: "Evet, beton delmek için uygundur. SDS plus uçlar kullanmaktadır.",
    status: "answered",
    askedDate: "2026-02-26 11:20",
    answeredDate: "2026-02-26 11:50",
  },
]

export default function OrderQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(SAMPLE_QUESTIONS)
  const [searchTerm, setSearchTerm] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("pending")
  const [answerSheet, setAnswerSheet] = useState<{ open: boolean; question: Question | null }>({
    open: false,
    question: null,
  })
  const [answerText, setAnswerText] = useState("")
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  // Toggle question expansion
  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  // Answer question
  const handleAnswerQuestion = () => {
    if (!answerSheet.question || !answerText.trim()) return

    setQuestions(questions.map(q =>
      q.id === answerSheet.question!.id
        ? {
            ...q,
            answer: answerText,
            status: "answered" as QuestionStatus,
            answeredDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        : q
    ))

    setAnswerSheet({ open: false, question: null })
    setAnswerText("")
  }

  // Filter questions by tab
  const getQuestionsByTab = (tab: string) => {
    switch (tab) {
      case "pending":
        return questions.filter(q => q.status === "pending")
      case "answered":
        return questions.filter(q => q.status === "answered")
      case "all":
      default:
        return questions
    }
  }

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    let result = getQuestionsByTab(activeTab)

    // Search filter
    if (searchTerm) {
      result = result.filter(question =>
        question.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.productSku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Platform filter
    if (platformFilter !== "all") {
      result = result.filter(question => question.platform === platformFilter)
    }

    return result
  }, [questions, searchTerm, platformFilter, activeTab])

  // Statistics
  const stats = {
    all: questions.length,
    pending: questions.filter(q => q.status === "pending").length,
    answered: questions.filter(q => q.status === "answered").length,
  }

  // Status badge
  const getStatusBadge = (status: QuestionStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700">
            <Clock className="h-3 w-3 mr-1" />
            Cevap Bekliyor
          </Badge>
        )
      case "answered":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Cevaplandı
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Kapatıldı
          </Badge>
        )
    }
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sipariş Soruları</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Müşteri sorularını platformlardan yönetin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Toplam Soru</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.all}</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Cevap Bekliyor</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-500">{stats.pending}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Cevaplandı</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-500">{stats.answered}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="pending" className="text-xs">
              Cevap Bekliyor ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="answered" className="text-xs">
              Cevaplandı ({stats.answered})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              Tümü ({stats.all})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Soru, ürün veya müşteri ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-[160px] bg-white text-xs h-9">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Platformlar</SelectItem>
                    <SelectItem value="trendyol">Trendyol</SelectItem>
                    <SelectItem value="n11">N11</SelectItem>
                    <SelectItem value="hepsiburada">Hepsiburada</SelectItem>
                    <SelectItem value="bolbolbul">Bolbolbul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Questions Table */}
            <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[40px]"></TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[100px]">Platform</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2">Ürün</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2">Müşteri</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2">Tarih</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center">Durum</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[100px]">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => {
                      const isExpanded = expandedQuestions.has(question.id)

                      return (
                        <React.Fragment key={question.id}>
                          <TableRow className="border-b dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors">
                            <TableCell className="py-2 h-12">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleQuestion(question.id)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="py-2 h-12">
                              <div className="flex items-center justify-center w-20 h-10 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-1.5">
                                <Image
                                  src={platformLogos[question.platform]}
                                  alt={question.platform}
                                  width={60}
                                  height={30}
                                  className="object-contain"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium text-gray-900 dark:text-gray-100 py-2 h-12">
                              <div>
                                <p className="font-semibold">{question.productName}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{question.productSku}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-2 h-12">
                              <div className="flex items-center gap-1.5">
                                <User className="h-3 w-3 text-gray-400" />
                                <span>{question.customerName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 dark:text-gray-400 py-2 h-12">
                              {question.askedDate}
                            </TableCell>
                            <TableCell className="py-2 h-12 text-center">
                              {getStatusBadge(question.status)}
                            </TableCell>
                            <TableCell className="py-2 h-12 text-center">
                              {question.status === "pending" ? (
                                <Button
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={() => {
                                    setAnswerSheet({ open: true, question })
                                    setAnswerText("")
                                  }}
                                >
                                  <Send className="h-3 w-3 mr-1.5" />
                                  Cevapla
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                  onClick={() => toggleQuestion(question.id)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Expanded question details */}
                          {isExpanded && (
                            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                              <TableCell colSpan={7} className="p-4">
                                <div className="space-y-4">
                                  {/* Question */}
                                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-start gap-3">
                                      <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                      <div className="flex-1">
                                        <Label className="text-xs text-gray-500 mb-1 block">Müşteri Sorusu</Label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                          {question.question}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Answer */}
                                  {question.answer && (
                                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                      <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                        <div className="flex-1">
                                          <Label className="text-xs text-gray-500 mb-1 block">
                                            Cevabınız ({question.answeredDate})
                                          </Label>
                                          <p className="text-sm text-gray-900 dark:text-white">
                                            {question.answer}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Answer Sheet */}
        <Sheet open={answerSheet.open} onOpenChange={(open) => setAnswerSheet({ open, question: null })}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Soruyu Cevapla</SheetTitle>
            </SheetHeader>
            {answerSheet.question && (
              <div className="space-y-6">
                {/* Product Info */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-12 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-1.5 flex items-center justify-center">
                      <Image
                        src={platformLogos[answerSheet.question.platform]}
                        alt={answerSheet.question.platform}
                        width={50}
                        height={25}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {answerSheet.question.productName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {answerSheet.question.productSku}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <User className="h-3 w-3" />
                    <span>{answerSheet.question.customerName}</span>
                    <span className="mx-2">•</span>
                    <span>{answerSheet.question.askedDate}</span>
                  </div>
                </div>

                {/* Question */}
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Müşteri Sorusu</Label>
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {answerSheet.question.question}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Answer Input */}
                <div>
                  <Label htmlFor="answer" className="text-xs text-gray-700 dark:text-gray-300 mb-2 block">
                    Cevabınız
                  </Label>
                  <Textarea
                    id="answer"
                    placeholder="Müşteriye gönderilecek cevabı yazın..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="min-h-[120px] text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Cevabınız {answerSheet.question.platform} platformunda müşteriye otomatik gönderilecektir.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => setAnswerSheet({ open: false, question: null })}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleAnswerQuestion}
                    disabled={!answerText.trim()}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Cevabı Gönder
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  )
}
