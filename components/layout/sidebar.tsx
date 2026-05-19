"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  CreditCard,
  Mail,
  Calendar,
  Activity,
  FolderOpen,
  BarChart3,
  Database,
  Shield,
  Briefcase,
  Plus,
  List,
  Tags,
  Building2,
  Truck,
  Upload,
  Clock,
  Trash2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Users2,
  Merge,
  FileImage,
  Globe,
  Zap,
  Code,
  FormInput,
  Navigation,
  Layout,
  Images,
  Smartphone,
  Menu as MenuIcon,
  Search,
  FileSearch,
  Map,
  Link2,
  LinkIcon,
  MapPin,
  TrendingDown,
  Trophy,
  Star,
  Package2,
  SearchIcon,
  Radio,
  AlertTriangle,
  Eye,
  Rss,
  Facebook,
  ExternalLink,
  Settings2,
  FileCode,
  Tag,
  Percent,
  Target,
  Gift,
  ShoppingBag,
  UserPlus,
  DollarSign,
  Server,
  Archive,
  Coins,
  UserCog,
  ShieldCheck,
  Key,
  Wallet,
  Calculator,
  Building,
  Award,
  Plug,
  ClipboardList,
  Sparkles
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"

const menuItems = [
  {
    title: "Sipariş Yönetimi",
    items: [
      { icon: ShoppingCart, label: "Sipariş Listesi", href: "/orders", badge: null },
      { icon: Mail, label: "Sipariş Soruları", href: "/order-questions", badge: null },
    ]
  },
  {
    title: "Raporlar",
    items: [
      { icon: BarChart3, label: "Satış Raporları", href: "/sales-reports", badge: null },
      { icon: TrendingDown, label: "Ürün Raporları", href: "/product-reports", badge: null },
      { icon: TrendingUp, label: "Büyüme Raporları", href: "/growth-reports", badge: null },
      { icon: Merge, label: "Ürün Karşılaştırma", href: "/product-comparison", badge: "new" },
    ]
  },
  {
    title: "Ayarlar",
    items: [
      { icon: Settings, label: "Genel Ayarlar", href: "/settings", badge: null },
      { icon: Mail, label: "E-posta Ayarları", href: "/email-settings", badge: null },
      { icon: ClipboardList, label: "Log Kayıtları", href: "/activity-logs", badge: null },
    ]
  },
  {
    title: "GİRİŞ EKRANLARI",
    items: [
      { icon: UserCheck, label: "Login Page", href: "/login", badge: null },
      { icon: Key, label: "Password Reset", href: "/password-reset", badge: null },
      { icon: UserPlus, label: "Register Page", href: "/register", badge: null },
      { icon: ShieldCheck, label: "Verification Page", href: "/verification", badge: null },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Determine which section should be open based on current pathname
  const getInitialOpenSections = () => {
    const sections: { [key: string]: boolean } = {
      "Sipariş Yönetimi": ["/orders", "/order-questions"].some(path => pathname.startsWith(path)),
      "Raporlar": ["/sales-reports", "/product-reports", "/growth-reports", "/product-comparison"].some(path => pathname.startsWith(path)),
      "Ayarlar": ["/settings", "/email-settings", "/activity-logs"].some(path => pathname.startsWith(path)),
      "GİRİŞ EKRANLARI": ["/login", "/password-reset", "/register", "/verification"].some(path => pathname.startsWith(path)),
    }
    return sections
  }

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(getInitialOpenSections())

  // Update open sections when pathname changes
  useEffect(() => {
    setOpenSections(getInitialOpenSections())
  }, [pathname])

  const toggleSection = (sectionTitle: string) => {
    if (!collapsed) {
      setOpenSections(prev => ({
        ...prev,
        [sectionTitle]: !prev[sectionTitle]
      }))
    }
  }

  return (
    <div className={cn(
      "relative flex flex-col h-screen bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 border-r border-gray-200/80 dark:border-slate-700/80 transition-all duration-300 shadow-lg",
      collapsed ? "w-[70px]" : "w-[260px]"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-slate-700">
        <Link href="/" className="flex items-center">
          <Logo size="md" showText={!collapsed} className="" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-2 px-1 min-h-0">
        {menuItems.map((section, idx) => {
          const isOpen = openSections[section.title]

          return (
            <div key={idx} className="mb-1">
              {!collapsed ? (
                <div>
                  {/* Section Header - Clickable */}
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full px-3 py-1.5 mb-0.5 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    <span>{section.title}</span>
                    {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {/* Collapsible Menu Items */}
                  <div className={cn(
                    "space-y-0.5 px-1 transition-all duration-200 overflow-hidden",
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  )}>
                    {section.items.map((item, itemIdx) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      const isAIButton = item.href === "/products/ai-add"
                      return (
                        <Link
                          key={`${section.title}-${itemIdx}`}
                          href={item.href}
                          className={cn(
                            "group relative flex items-center justify-between px-2 py-1.5 rounded-md transition-all duration-200 hover:shadow-sm",
                            isAIButton
                              ? isActive
                                ? "bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-fuchsia-500/20 dark:from-purple-400/30 dark:via-violet-400/30 dark:to-fuchsia-400/30 text-purple-700 dark:text-purple-300 border-l-4 border-purple-600"
                                : "bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-fuchsia-500/5 hover:from-purple-500/15 hover:via-violet-500/15 hover:to-fuchsia-500/15 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:translate-x-1 hover:shadow-purple-200/50 dark:hover:shadow-purple-900/50"
                              : isActive
                              ? "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-400/20 dark:via-indigo-400/20 dark:to-purple-400/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500"
                              : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 dark:hover:from-slate-700/50 dark:hover:to-blue-900/20 text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className={cn(
                              "h-3.5 w-3.5",
                              isAIButton && "animate-pulse"
                            )} />
                            <span className={cn(
                              "text-xs font-medium",
                              isAIButton && "font-semibold"
                            )}>{item.label}</span>
                          </div>
                          {item.badge && (
                            <Badge
                              variant={item.badge === "Yeni" ? "default" : "secondary"}
                              className="ml-auto text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // Collapsed mode - show only icons
                <div className="space-y-1 px-2">
                  {section.items.map((item, itemIdx) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    const isAIButton = item.href === "/products/ai-add"
                    return (
                      <Link
                        key={`${section.title}-collapsed-${itemIdx}`}
                        href={item.href}
                        className={cn(
                          "group relative flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:shadow-md",
                          isAIButton
                            ? isActive
                              ? "bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-fuchsia-500/20 dark:from-purple-400/30 dark:via-violet-400/30 dark:to-fuchsia-400/30 text-purple-700 dark:text-purple-300"
                              : "bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-fuchsia-500/5 hover:from-purple-500/15 hover:via-violet-500/15 hover:to-fuchsia-500/15 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-purple-200/50 dark:hover:shadow-purple-900/50"
                            : isActive
                            ? "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-400/20 dark:via-indigo-400/20 dark:to-purple-400/20 text-blue-600 dark:text-blue-400"
                            : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 dark:hover:from-slate-700/50 dark:hover:to-blue-900/20 text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                        )}
                        title={item.label}
                      >
                        <Icon className={cn(
                          "h-5 w-5",
                          isAIButton && "animate-pulse"
                        )} />
                        {item.badge && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* User Section */}
      {!collapsed && (
        <div className="mt-auto border-t border-gray-200 dark:border-slate-700">
          <div className="p-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                KU
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Koray Uslu</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}