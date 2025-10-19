import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { UserProvider } from "@/lib/user-context"
import { ExpenseProvider } from "@/lib/expense-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "Gastos Controle - Gestão Financeira Pessoal e Familiar",
  description: "Sistema completo de controle de gastos com análises detalhadas",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <UserProvider>
          <ExpenseProvider>
            {children}
            <Toaster />
          </ExpenseProvider>
        </UserProvider>
      </body>
    </html>
  )
}
