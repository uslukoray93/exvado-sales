"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  PackageCheck,
  PackageX,
  Boxes,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export default function DashboardPage() {
  // Satış ve Ciro Verileri
  const salesData = [
    {
      title: "Bugünkü Satışlar",
      sales: "45",
      revenue: "₺12,450",
      profit: "₺3,735",
      cost: "₺8,715",
      profitRate: "30%",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      change: "+12.5%",
      isPositive: true,
    },
    {
      title: "Bu Haftaki Satışlar",
      sales: "287",
      revenue: "₺78,320",
      profit: "₺23,496",
      cost: "₺54,824",
      profitRate: "30%",
      icon: Activity,
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      change: "+8.3%",
      isPositive: true,
    },
    {
      title: "Bu Ayki Satışlar",
      sales: "1,234",
      revenue: "₺342,890",
      profit: "₺102,867",
      cost: "₺240,023",
      profitRate: "30%",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      change: "+15.7%",
      isPositive: true,
    },
    {
      title: "Bu Yılki Satışlar",
      sales: "8,567",
      revenue: "₺2,456,780",
      profit: "₺737,034",
      cost: "₺1,719,746",
      profitRate: "30%",
      icon: DollarSign,
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      change: "+23.4%",
      isPositive: true,
    },
  ]

  // Komisyon Dağılımı Verileri
  const commissionData = [
    { platform: "Trendyol", orders: 145, revenue: "₺89,450", commission: "₺13,418", rate: "15%" },
    { platform: "Hepsiburada", orders: 132, revenue: "₺76,340", commission: "₺11,451", rate: "15%" },
    { platform: "N11", orders: 98, revenue: "₺54,230", commission: "₺8,135", rate: "15%" },
    { platform: "BolBolBul", orders: 76, revenue: "₺42,180", commission: "₺6,327", rate: "15%" },
    { platform: "Çiçeksepeti", orders: 54, revenue: "₺31,560", commission: "₺4,734", rate: "15%" },
  ]

  // Kar Dağılımı Verileri
  const profitData = [
    { category: "Elektronik", revenue: "₺145,670", cost: "₺98,453", profit: "₺47,217", margin: "32.4%" },
    { category: "Giyim", revenue: "₺98,450", cost: "₺59,070", profit: "₺39,380", margin: "40.0%" },
    { category: "Ev & Yaşam", revenue: "₺76,230", cost: "₺53,361", profit: "₺22,869", margin: "30.0%" },
    { category: "Kozmetik", revenue: "₺54,890", cost: "₺32,934", profit: "₺21,956", margin: "40.0%" },
    { category: "Spor & Outdoor", revenue: "₺42,340", cost: "₺29,638", profit: "₺12,702", margin: "30.0%" },
  ]

  // Envanter Verileri
  const inventoryData = [
    {
      title: "Toplam Ürün",
      value: "8,567",
      description: "Sistemdeki tüm ürünler",
      icon: Boxes,
      color: "from-indigo-500 to-indigo-600",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    },
    {
      title: "Envanterdeki Stoklu Ürünler",
      value: "6,234",
      description: "Stoğu mevcut ürünler",
      icon: PackageCheck,
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      title: "Envanterdeki Stoğu Bitenler",
      value: "2,333",
      description: "Stoğu tükenen ürünler",
      icon: PackageX,
      color: "from-rose-500 to-rose-600",
      textColor: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
    },
  ]

  // Cron Sync Durumu Verileri
  const cronSyncStatus = {
    totalSuppliers: 10,
    successfulSync: 7,
    failedSync: 3,
    lastSyncTime: "15:30",
    failedSuppliers: ["İtal", "Pars", "Gediz"],
  }

  // Komisyon Grafiği Verileri
  const commissionChartData = [
    { name: "Trendyol", value: 37450, color: "#f97316" },
    { name: "N11", value: 40155, color: "#fb923c" },
    { name: "Hepsiburada", value: 56304, color: "#fdba74" },
    { name: "Bolbolbul", value: 12640, color: "#fed7aa" },
  ]

  // Kar Grafiği Verileri
  const profitChartData = [
    { name: "Trendyol", value: 79865, color: "#16a34a" },
    { name: "N11", value: 36894, color: "#22c55e" },
    { name: "Hepsiburada", value: 93680, color: "#4ade80" },
    { name: "Bolbolbul", value: 25280, color: "#86efac" },
  ]

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {payload[0].value.toLocaleString('tr-TR')} ₺
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            %{((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Satış ve ciro istatistiklerinize genel bakış
          </p>
        </div>

        {/* Satış ve Ciro Kartları */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {salesData.map((data, index) => {
            const Icon = data.icon
            return (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-l-4" style={{ borderLeftColor: data.color.split(' ')[0].replace('from-', '') }}>
                {/* Arka plan pattern */}
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${data.color} opacity-5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-500`}></div>

                <CardContent className="pt-6 pb-6 relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{data.title}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.sales}</p>
                        <Badge variant={data.isPositive ? "default" : "destructive"} className="text-xs px-2">
                          {data.isPositive ? (
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-0.5" />
                          )}
                          {data.change}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Satış Adedi</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${data.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2.5 mt-4">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Ciro</span>
                      <span className={`text-sm font-bold ${data.textColor}`}>{data.revenue}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">Kar</span>
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">{data.profit}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Maliyet</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{data.cost}</span>
                    </div>
                  </div>

                  {/* Kar Oranı */}
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Kar Oranı</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: data.profitRate }}></div>
                        </div>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                          {data.profitRate}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Cron Sync Durumu Kartı ve Envanter Kartları */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Cron Sync Durumu Kartı */}
          <Card className="md:col-span-1 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950 dark:via-slate-900 dark:to-blue-950">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Cron Sync
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {cronSyncStatus.lastSyncTime}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Ana Durum Mesajı */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex-shrink-0 mt-0.5">
                    {cronSyncStatus.failedSync > 0 ? (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {cronSyncStatus.successfulSync}/{cronSyncStatus.totalSuppliers} başarılı
                    </p>
                    {cronSyncStatus.failedSync > 0 && (
                      <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                        Hata: {cronSyncStatus.failedSuppliers.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* İstatistikler */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Başarılı</span>
                    <span className="font-bold text-green-700 dark:text-green-400">{cronSyncStatus.successfulSync}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Hatalı</span>
                    <span className="font-bold text-red-700 dark:text-red-400">{cronSyncStatus.failedSync}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Envanter Kartları */}
          {inventoryData.map((data, index) => {
            const Icon = data.icon
            return (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${data.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform`}></div>
                <CardContent className="pt-6 pb-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${data.color} shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-3xl font-bold ${data.textColor}`}>{data.value}</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{data.title}</p>
                    <p className="text-xs text-muted-foreground">{data.description}</p>
                  </div>
                  <div className={`mt-4 pt-3 border-t border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Güncelleme</span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Az önce</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Komisyon ve Kar Dağılımı Kartları */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Komisyon Dağılımı */}
          <Card className="bg-orange-50/30 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <span className="text-orange-600 text-lg">%</span>
                </div>
                Komisyon Dağılımı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4">
                {/* Pasta Grafiği */}
                <div className="flex-shrink-0 w-[140px] h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={commissionChartData.map(item => ({
                          ...item,
                          total: commissionChartData.reduce((sum, i) => sum + i.value, 0)
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {commissionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 cursor-pointer transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Liste */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Trendyol</span>
                    </div>
                    <span className="text-sm font-semibold">37,450.00 ₺</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">N11</span>
                    </div>
                    <span className="text-sm font-semibold">40,155.00 ₺</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Hepsiburada</span>
                    </div>
                    <span className="text-sm font-semibold">56,304.00 ₺</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-300"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Bolbolbul</span>
                    </div>
                    <span className="text-sm font-semibold">12,640.00 ₺</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Toplam</span>
                  <span className="text-base font-bold text-orange-600">146,549.00 ₺</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kar Dağılımı */}
          <Card className="bg-green-50/30 dark:bg-green-950/10 border-green-100 dark:border-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                Kar Dağılımı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4">
                {/* Pasta Grafiği */}
                <div className="flex-shrink-0 w-[140px] h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={profitChartData.map(item => ({
                          ...item,
                          total: profitChartData.reduce((sum, i) => sum + i.value, 0)
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {profitChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 cursor-pointer transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Liste */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Trendyol</span>
                    </div>
                    <span className="text-sm font-semibold">79,865.00 ₺</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">N11</span>
                    </div>
                    <span className="text-sm font-semibold">36,894.00 ₺</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Hepsiburada</span>
                    </div>
                    <span className="text-sm font-semibold">93,680.00 ₺</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-300"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Bolbolbul</span>
                    </div>
                    <span className="text-sm font-semibold">25,280.00 ₺</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Toplam</span>
                  <span className="text-base font-bold text-green-600">235,719.00 ₺</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
