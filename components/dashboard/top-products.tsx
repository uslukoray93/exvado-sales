"use client"

import { Badge } from "@/components/ui/badge"

const products = [
  {
    name: "Laptop Pro 15",
    category: "Elektronik",
    sales: 234,
    revenue: "₺234,500",
    status: "Stokta"
  },
  {
    name: "Kablosuz Kulaklık",
    category: "Aksesuar",
    sales: 156,
    revenue: "₺46,800",
    status: "Stokta"
  },
  {
    name: "Akıllı Saat Ultra",
    category: "Giyilebilir",
    sales: 98,
    revenue: "₺98,000",
    status: "Az Stok"
  },
  {
    name: "Bluetooth Hoparlör",
    category: "Ses Sistemi",
    sales: 87,
    revenue: "₺26,100",
    status: "Stokta"
  },
  {
    name: "Webcam HD",
    category: "Aksesuar",
    sales: 76,
    revenue: "₺15,200",
    status: "Tükendi"
  }
]

export function TopProducts() {
  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <div className="flex-1">
            <p className="text-sm font-medium leading-none">{product.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{product.revenue}</p>
              <p className="text-xs text-muted-foreground">{product.sales} satış</p>
            </div>
            <Badge
              variant={
                product.status === "Stokta" ? "default" :
                product.status === "Az Stok" ? "secondary" :
                "destructive"
              }
              className="ml-2"
            >
              {product.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}