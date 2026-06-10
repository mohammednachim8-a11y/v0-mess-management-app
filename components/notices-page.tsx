"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useMess } from "@/components/mess-store"
import { Section, PrimaryButton, Modal, Field, inputClass } from "@/components/ui-bits"

export function NoticesPage() {
  const { notices, addNotice, removeNotice, currentUser } = useMess()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const isManager = currentUser?.role === "manager"

  const submit = () => {
    if (!text.trim()) return
    addNotice(text.trim())
    setText("")
    setOpen(false)
  }

  return (
    <>
      <Section
        title="Notice board"
        action={
          isManager ? (
            <PrimaryButton onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Post notice
            </PrimaryButton>
          ) : undefined
        }
      >
        <ul className="flex flex-col">
          {notices.map((n) => (
            <li key={n.id} className="flex gap-3 border-b border-border py-3 last:border-0">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-foreground">{n.text}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {n.time} · {n.author}
                </p>
              </div>
              {isManager && (
                <button
                  type="button"
                  onClick={() => removeNotice(n.id)}
                  aria-label="Delete notice"
                  className="mt-0.5 text-muted-foreground transition-colors hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
          {notices.length === 0 && (
            <li className="py-4 text-center text-sm text-muted-foreground">No notices yet.</li>
          )}
        </ul>
      </Section>

      <Modal open={open} title="Post notice" onClose={() => setOpen(false)}>
        <Field label="Notice">
          <textarea
            className={inputClass}
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your notice here..."
          />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <PrimaryButton onClick={submit}>Post notice</PrimaryButton>
        </div>
      </Modal>
    </>
  )
}
