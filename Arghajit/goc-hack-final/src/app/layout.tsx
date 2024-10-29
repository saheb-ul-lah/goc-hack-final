import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { twMerge } from "tailwind-merge"
import { dark, neobrutalism, shadesOfPurple } from "@clerk/themes"
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  UserButton,
} from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Excelitest- A Test automation platform",
  description: "A landing page designed for test creation and attempts",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      //custom signin signup
      appearance={{
        baseTheme: [neobrutalism],
        signIn: { baseTheme: neobrutalism },
        variables: {
          colorText: "black",
          colorBackground: "grey",
          // colorTextSecondary:"white"
        },
      }}
    >
      <html lang="en">
        <body
          className={twMerge(
            inter.className,
            "bg-black text-white antialiased"
          )}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
