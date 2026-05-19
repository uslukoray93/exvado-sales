"use client"

import React, { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  FileText,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Minus,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

// DB Operation type
type DBOperation = {
  id: string
  supplierName: string
  timestamp: string
  operation: "insert" | "update" | "delete"
  status: "success" | "failed" | "partial"
  totalRecords: number
  successCount: number
  failedCount: number
  duration: number
  affectedTables: string[]
  errors: {
    table: string
    record: string
    error: string
    timestamp: string
  }[]
}

// Summary stats
type SummaryStats = {
  totalOperations: number
  successfulOps: number
  failedOps: number
  partialOps: number
  totalRecordsProcessed: number
  avgDuration: number
  successRate: number
}

export default function DBSyncPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [errorSheet, setErrorSheet] = useState<{ open: boolean; operation: DBOperation | null }>({
    open: false,
    operation: null,
  })

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Sample DB operations data
  const operations: DBOperation[] = [
    {
      id: "1",
      supplierName: "Cullas",
      timestamp: "2024-01-15 14:32:15",
      operation: "update",
      status: "success",
      totalRecords: 18750,
      successCount: 18750,
      failedCount: 0,
      duration: 45,
      affectedTables: ["products", "prices", "stock"],
      errors: [],
    },
    {
      id: "2",
      supplierName: "Ital",
      timestamp: "2024-01-15 14:46:52",
      operation: "insert",
      status: "success",
      totalRecords: 12340,
      successCount: 12340,
      failedCount: 0,
      duration: 38,
      affectedTables: ["products", "prices"],
      errors: [],
    },
    {
      id: "3",
      supplierName: "GoogleSheets",
      timestamp: "2024-01-15 13:00:25",
      operation: "update",
      status: "failed",
      totalRecords: 0,
      successCount: 0,
      failedCount: 0,
      duration: 2,
      affectedTables: [],
      errors: [
        {
          table: "products",
          record: "Connection Error",
          error: "Database connection timeout",
          timestamp: "2024-01-15 13:00:25",
        },
        {
          table: "prices",
          record: "Connection Error",
          error: "Failed to establish connection",
          timestamp: "2024-01-15 13:00:26",
        },
      ],
    },
    {
      id: "4",
      supplierName: "Mapas",
      timestamp: "2024-01-15 14:01:32",
      operation: "update",
      status: "partial",
      totalRecords: 8920,
      successCount: 8796,
      failedCount: 124,
      duration: 42,
      affectedTables: ["products", "prices", "stock", "categories"],
      errors: [
        {
          table: "products",
          record: "SKU-MAP-12345",
          error: "Duplicate key violation",
          timestamp: "2024-01-15 14:01:35",
        },
        {
          table: "prices",
          record: "SKU-MAP-67890",
          error: "Foreign key constraint failed",
          timestamp: "2024-01-15 14:01:38",
        },
      ],
    },
    {
      id: "5",
      supplierName: "Bizimhesap",
      timestamp: "2024-01-15 12:31:18",
      operation: "insert",
      status: "success",
      totalRecords: 5640,
      successCount: 5640,
      failedCount: 0,
      duration: 28,
      affectedTables: ["products", "stock"],
      errors: [],
    },
    {
      id: "6",
      supplierName: "Pars",
      timestamp: "2024-01-14 18:02:45",
      operation: "delete",
      status: "success",
      totalRecords: 245,
      successCount: 245,
      failedCount: 0,
      duration: 12,
      affectedTables: ["products", "prices"],
      errors: [],
    },
    {
      id: "7",
      supplierName: "Catpower",
      timestamp: "2024-01-15 13:32:08",
      operation: "update",
      status: "success",
      totalRecords: 4320,
      successCount: 4320,
      failedCount: 0,
      duration: 22,
      affectedTables: ["products", "prices"],
      errors: [],
    },
    {
      id: "8",
      supplierName: "Akinziraat",
      timestamp: "2024-01-15 14:16:55",
      operation: "insert",
      status: "success",
      totalRecords: 6780,
      successCount: 6780,
      failedCount: 0,
      duration: 31,
      affectedTables: ["products", "prices", "stock"],
      errors: [],
    },
  ]

  // Calculate summary stats
  const summaryStats: SummaryStats = {
    totalOperations: operations.length,
    successfulOps: operations.filter(op => op.status === "success").length,
    failedOps: operations.filter(op => op.status === "failed").length,
    partialOps: operations.filter(op => op.status === "partial").length,
    totalRecordsProcessed: operations.reduce((sum, op) => sum + op.totalRecords, 0),
    avgDuration: Math.round(operations.reduce((sum, op) => sum + op.duration, 0) / operations.length),
    successRate: Math.round((operations.filter(op => op.status === "success").length / operations.length) * 100),
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Başarılı
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Başarısız
          </Badge>
        )
      case "partial":
        return (
          <Badge className="bg-orange-500 text-white text-xs flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Kısmi
          </Badge>
        )
      default:
        return null
    }
  }

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case "insert":
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />
      case "update":
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      case "delete":
        return <ArrowDownCircle className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getOperationLabel = (operation: string) => {
    switch (operation) {
      case "insert":
        return "INSERT"
      case "update":
        return "UPDATE"
      case "delete":
        return "DELETE"
      default:
        return operation.toUpperCase()
    }
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              DB Update/Insert Raporu
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Veritabanı işlem durumu ve hata logları
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Activity className="h-3 w-3 animate-pulse text-green-600" />
              {currentTime ? currentTime.toLocaleTimeString('tr-TR') : '--:--:--'}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Toplam İşlem</p>
                  <p className="text-2xl font-bold mt-1">{summaryStats.totalOperations}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Başarı Oranı</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">%{summaryStats.successRate}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">İşlenen Kayıt</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">{formatNumber(summaryStats.totalRecordsProcessed)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ort. Süre</p>
                  <p className="text-2xl font-bold mt-1 text-purple-600">{summaryStats.avgDuration}s</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="border-green-200 dark:border-green-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Başarılı İşlemler</p>
                  <p className="text-xl font-bold mt-1 text-green-600">{summaryStats.successfulOps}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Kısmi Başarılı</p>
                  <p className="text-xl font-bold mt-1 text-orange-600">{summaryStats.partialOps}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">Başarısız İşlemler</p>
                  <p className="text-xl font-bold mt-1 text-red-600">{summaryStats.failedOps}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Veritabanı İşlem Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tedarikçi</TableHead>
                  <TableHead>İşlem Tipi</TableHead>
                  <TableHead>Zaman</TableHead>
                  <TableHead className="text-right">Toplam Kayıt</TableHead>
                  <TableHead className="text-right">Başarılı</TableHead>
                  <TableHead className="text-right">Başarısız</TableHead>
                  <TableHead className="text-right">Başarı Oranı</TableHead>
                  <TableHead className="text-right">Süre</TableHead>
                  <TableHead>Etkilenen Tablolar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-center">Detay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((operation) => {
                  const successRate = operation.totalRecords > 0
                    ? Math.round((operation.successCount / operation.totalRecords) * 100)
                    : 0

                  return (
                    <TableRow key={operation.id}>
                      <TableCell className="font-medium text-sm">{operation.supplierName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getOperationIcon(operation.operation)}
                          <span className="text-xs font-semibold">{getOperationLabel(operation.operation)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{operation.timestamp}</TableCell>
                      <TableCell className="text-right font-semibold">{formatNumber(operation.totalRecords)}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">{formatNumber(operation.successCount)}</TableCell>
                      <TableCell className="text-right text-red-600 font-semibold">{formatNumber(operation.failedCount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Progress value={successRate} className="h-1.5 w-16" />
                          <span className={`text-xs font-semibold ${successRate === 100 ? 'text-green-600' : successRate >= 90 ? 'text-orange-600' : 'text-red-600'}`}>
                            %{successRate}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-xs">{operation.duration}s</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {operation.affectedTables.map((table, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {table}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(operation.status)}</TableCell>
                      <TableCell className="text-center">
                        {operation.errors.length > 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-red-600 hover:text-red-700"
                            onClick={() => setErrorSheet({ open: true, operation })}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {operation.errors.length} Hata
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Error Details Sheet */}
        <Sheet open={errorSheet.open} onOpenChange={(open) => setErrorSheet({ open, operation: null })}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Hata Detayları</SheetTitle>
              <SheetDescription>
                {errorSheet.operation?.supplierName} - DB İşlem Hataları
              </SheetDescription>
            </SheetHeader>

            {errorSheet.operation && (
              <div className="space-y-4">
                {/* Operation Summary */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">İşlem Tipi</span>
                    <Badge variant="outline">{getOperationLabel(errorSheet.operation.operation)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Toplam Kayıt</span>
                    <span className="text-sm font-semibold">{formatNumber(errorSheet.operation.totalRecords)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Başarılı</span>
                    <span className="text-sm font-semibold text-green-600">{formatNumber(errorSheet.operation.successCount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Başarısız</span>
                    <span className="text-sm font-semibold text-red-600">{formatNumber(errorSheet.operation.failedCount)}</span>
                  </div>
                </div>

                {/* Errors List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Hata Listesi</h3>
                  {errorSheet.operation.errors.map((error, index) => (
                    <div
                      key={index}
                      className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="destructive" className="text-xs">
                              {error.table}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {error.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-red-900 dark:text-red-100 font-medium mb-1">
                            {error.error}
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            Kayıt: {error.record}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  )
}
