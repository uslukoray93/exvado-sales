import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12'
}

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl'
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 shadow-lg',
        sizeClasses[size]
      )}>
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg blur opacity-25"></div>
          <div className={cn(
            'relative text-white font-bold flex items-center justify-center',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'
          )}>
            ES
          </div>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            'font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent dark:from-white dark:via-emerald-200 dark:to-cyan-200',
            textSizeClasses[size]
          )}>
            Exvado
          </span>
          <span className={cn(
            'text-xs font-medium text-gray-500 dark:text-gray-400 -mt-1',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-xs',
            size === 'lg' && 'text-sm',
            size === 'xl' && 'text-sm'
          )}>
            Sales V1.0.0
          </span>
        </div>
      )}
    </div>
  )
}