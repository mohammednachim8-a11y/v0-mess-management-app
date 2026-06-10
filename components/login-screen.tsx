"use client"

import { useState } from "react"
import { UtensilsCrossed } from "lucide-react"
import { useMess } from "@/components/mess-store"

export function LoginScreen() {
  const { login, showToast } = useMess()
  const [user, setUser] = useState("manager")
  const [pass, setPass] = useState("1234")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!login(user, pass)) showToast("Invalid credentials")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-medium text-card-foreground">MessHub</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage your mess</p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs font-medium text-muted-foreground">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="manager / member1 / member2"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="password"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="mt-1 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 rounded-md bg-secondary p-3 text-xs leading-relaxed text-muted-foreground">
          Demo: <b className="text-secondary-foreground">manager</b> / 1234 &nbsp;|&nbsp;{" "}
          <b className="text-secondary-foreground">member1</b> / 1234 &nbsp;|&nbsp;{" "}
          <b className="text-secondary-foreground">member2</b> / 1234
        </p>
      </div>
    </main>
  )
}
