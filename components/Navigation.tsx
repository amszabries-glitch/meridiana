'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface NavigationProps {
  onTabChange?: (tab: string) => void
}

export default function Navigation({ onTabChange }: NavigationProps = {}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navItems = [
    {
      name: 'Übersicht',
      href: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      name: 'Börsenmäntel',
      href: '/dashboard?tab=projects',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      name: 'Pipeline',
      href: '/dashboard?tab=pipeline',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: 'Kontakte',
      href: '/contacts',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' && !searchParams.get('tab')
    }
    if (href === '/dashboard?tab=projects') {
      return pathname === '/dashboard' && searchParams.get('tab') === 'projects'
    }
    if (href === '/dashboard?tab=pipeline') {
      return pathname === '/dashboard' && searchParams.get('tab') === 'pipeline'
    }
    return pathname === href
  }

  return (
    <nav className="flex items-center space-x-1 overflow-x-auto -mx-2 px-1 sm:-mx-4 sm:px-2 md:overflow-visible md:space-x-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style]:none [scrollbar-width]:none scroll-smooth touch-pan-x">
      {navItems.map((item) => {
        const active = isActive(item.href)
        
        // Handle dashboard tabs differently
        if (item.href.startsWith('/dashboard') && onTabChange) {
          let tab = 'overview'
          if (item.href.includes('tab=projects')) tab = 'projects'
          else if (item.href.includes('tab=pipeline')) tab = 'pipeline'
          
          return (
            <button
              key={item.name}
              onClick={() => onTabChange(tab)}
              className={`
                flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 md:flex-row md:space-x-2 md:px-3 md:py-2 rounded-lg text-[9px] sm:text-[10px] md:text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-[52px] md:min-w-0 flex-shrink-0
                ${active 
                  ? 'bg-blue/10 text-blue border border-blue/20 shadow-sm' 
                  : 'text-ink-soft hover:text-ink hover:bg-ink/5'
                }
              `}
            >
              <span className={`${active ? 'text-blue' : 'text-ink-soft'} flex-shrink-0 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5`}>
                {item.icon}
              </span>
              <span className="text-center leading-tight hidden lg:inline">{item.name}</span>
            </button>
          )
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 md:flex-row md:space-x-2 md:px-3 md:py-2 rounded-lg text-[9px] sm:text-[10px] md:text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-[52px] md:min-w-0 flex-shrink-0
              ${active 
                ? 'bg-blue/10 text-blue border border-blue/20 shadow-sm' 
                : 'text-ink-soft hover:text-ink hover:bg-ink/5'
              }
            `}
          >
            <span className={`${active ? 'text-blue' : 'text-ink-soft'} flex-shrink-0 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5`}>
              {item.icon}
            </span>
            <span className="text-center leading-tight hidden lg:inline">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
