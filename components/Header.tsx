"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { logout } from "@/app/admin/actions"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navLinks = [
  { href: "/", label: "Početna" },
  { href: "/automobili", label: "Automobili" },
  { href: "/chiptuning", label: "Chiptuning" },
  { href: "/status", label: "Status" },
  { href: "/kontakt", label: "Kontakt" },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

const navLinkActiveClassName =
  "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),black_35%)]"

const navLinkInactiveClassName =
  "text-foreground hover:bg-primary/10 dark:hover:bg-primary/15"

function navLinkClassName(active: boolean) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active ? navLinkActiveClassName : navLinkInactiveClassName
  )
}

export default function Header({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean
}) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="AS Škrinjar — početna">
          <Image
            src="/logo.png?v=2"
            alt="AS Škrinjar"
            width={180}
            height={48}
            priority
            unoptimized
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Button
                key={link.href}
                asChild
                variant={active ? "default" : "ghost"}
                size="sm"
                className={active ? undefined : navLinkInactiveClassName}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          {isAuthenticated ? (
            <form action={logout} className="hidden md:block">
              <Button type="submit" variant="ghost" size="sm">
                Odjavi se
              </Button>
            </form>
          ) : null}

          <ModeToggle />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Otvori meni"
              >
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>AS Škrinjar</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-2">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={navLinkClassName(isActive(pathname, link.href))}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}

                {isAuthenticated ? (
                  <form action={logout} className="mt-2 border-t pt-2">
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      Odjavi se
                    </Button>
                  </form>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
