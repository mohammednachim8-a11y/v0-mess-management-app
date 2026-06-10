"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useMess } from "@/components/mess-store"
import { Section, PrimaryButton, Modal, Field, inputClass } from "@/components/ui-bits"

export function ShoppingPage() {
  const { shopping, addShoppingItem, toggleShopping, removeShopping } = useMess()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  const submit = () => {
    if (!name.trim()) return
    addShoppingItem(name.trim())
    setName("")
    setOpen(false)
  }

  return (
    <>
      <Section
        title="Shopping list"
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add item
          </PrimaryButton>
        }
      >
        <ul className="flex flex-col">
          {shopping.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 border-b border-border py-2.5 text-sm last:border-0"
            >
              <input
                id={`si-${item.id}`}
                type="checkbox"
                checked={item.done}
                onChange={() => toggleShopping(item.id)}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
              <label
                htmlFor={`si-${item.id}`}
                className={`flex-1 cursor-pointer ${
                  item.done ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {item.name}
              </label>
              <button
                type="button"
                onClick={() => removeShopping(item.id)}
                aria-label={`Remove ${item.name}`}
                className="text-muted-foreground transition-colors hover:text-danger"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
          {shopping.length === 0 && (
            <li className="py-4 text-center text-sm text-muted-foreground">No items yet.</li>
          )}
        </ul>
      </Section>

      <Modal open={open} title="Add shopping item" onClose={() => setOpen(false)}>
        <Field label="Item name">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rice 5kg"
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
          <PrimaryButton onClick={submit}>Add item</PrimaryButton>
        </div>
      </Modal>
    </>
  )
}
