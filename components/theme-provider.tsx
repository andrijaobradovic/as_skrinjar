"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // next-themes injects a blocking <script> to prevent theme flicker.
  // During SSR it must run as JavaScript; on the client React 19 warns about
  // <script> inside components, so we use a non-executable type after hydration.
  const scriptProps: React.ComponentProps<typeof NextThemesProvider>["scriptProps"] =
    typeof window === "undefined"
      ? { suppressHydrationWarning: true }
      : { suppressHydrationWarning: true, type: "application/json" }

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  )
}
