"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const sales = [
  {
    name: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    amount: "₺1,999.00",
    avatar: "AY"
  },
  {
    name: "Ayşe Kaya",
    email: "ayse@example.com",
    amount: "₺39.00",
    avatar: "AK"
  },
  {
    name: "Mehmet Demir",
    email: "mehmet@example.com",
    amount: "₺299.00",
    avatar: "MD"
  },
  {
    name: "Fatma Çelik",
    email: "fatma@example.com",
    amount: "₺99.00",
    avatar: "FÇ"
  },
  {
    name: "Ali Öztürk",
    email: "ali@example.com",
    amount: "₺39.00",
    avatar: "AÖ"
  }
]

export function RecentSales() {
  return (
    <div className="space-y-8">
      {sales.map((sale, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt={sale.name} />
            <AvatarFallback>{sale.avatar}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium">{sale.amount}</div>
        </div>
      ))}
    </div>
  )
}