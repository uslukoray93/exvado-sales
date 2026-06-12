// Basit toast hook
import { useState } from 'react'

export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (props: Toast) => {
    // Console.log olarak göster (geçici)
    console.log(`[TOAST ${props.variant || 'default'}]`, props.title, props.description)

    // Gerçek toast implementasyonu için sonra eklenebilir
    setToasts([...toasts, props])

    // 3 saniye sonra kaldır
    setTimeout(() => {
      setToasts(toasts => toasts.slice(1))
    }, 3000)
  }

  return { toast, toasts }
}
