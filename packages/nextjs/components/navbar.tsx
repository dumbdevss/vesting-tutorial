"use client"

import { useState } from "react"
import Link from "next/link"
import { Crown, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { CustomConnectButton } from "~~/components/scaffold-move";

// Simplified version of cn function to avoid potential issues
const classNames = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(" ")
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname() || ""

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full min-h-0 border-b border-yellow-500/20 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Crown className="h-8 w-8 text-yellow-400" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
            VestKing
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={classNames(
              "text-sm font-medium transition-colors hover:text-yellow-400",
              isActive("/") ? "text-yellow-400" : "text-gray-400",
            )}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={classNames(
              "text-sm font-medium transition-colors hover:text-yellow-400",
              isActive("/dashboard") ? "text-yellow-400" : "text-gray-400",
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/admin"
            className={classNames(
              "text-sm font-medium transition-colors hover:text-yellow-400",
              isActive("/admin") ? "text-yellow-400" : "text-gray-400",
            )}
          >
            Admin
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-4">
        <CustomConnectButton />
        </div>
        <button className="flex md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6 text-yellow-400" /> : <Menu className="h-6 w-6 text-yellow-400" />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden p-4 space-y-4 bg-black/90 backdrop-blur-lg border-b border-yellow-500/20">
          <Link
            href="/"
            className={classNames(
              "block py-2 text-sm font-medium transition-colors hover:text-yellow-400",
              isActive("/") ? "text-yellow-400" : "text-gray-400",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={classNames(
              "block py-2 text-sm font-medium transition-colors hover:text-yellow-400",
              isActive("/dashboard") ? "text-yellow-400" : "text-gray-400",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/admin"
            className={classNames(
              "block py-2 text-sm font-medium transition-colors hover:text-yellow-400",
              isActive("/admin") ? "text-yellow-400" : "text-gray-400",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Admin
          </Link>
          <CustomConnectButton />
        </div>
      )}
    </header>
  )
}

