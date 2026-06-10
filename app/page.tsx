"use client"

import { MessProvider, useMess } from "@/components/mess-store"
import { LoginScreen } from "@/components/login-screen"
import { AppShell } from "@/components/app-shell"

function Toast() {
  const { toast } = useMess()
  if (!toast) return null
  return (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-[60] rounded-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-lg"
    >
      {toast}
    </div>
  )
}

function Root() {
  const { currentUser } = useMess()
  return (
    <>
      {currentUser ? <AppShell /> : <LoginScreen />}
      <Toast />
    </>
  )
}

export default function Page() {
  return (
    <MessProvider>
      <Root />
    </MessProvider>
  )
}
