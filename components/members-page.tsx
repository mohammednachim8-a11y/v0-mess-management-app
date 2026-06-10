"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useMess } from "@/components/mess-store"
import { Section, Badge, PrimaryButton, Modal, Field, inputClass } from "@/components/ui-bits"
import type { Role } from "@/lib/mess-data"

export function MembersPage() {
  const { members, addMember, currentUser } = useMess()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [room, setRoom] = useState("")
  const [role, setRole] = useState<Role>("member")
  const isManager = currentUser?.role === "manager"

  const submit = () => {
    if (!name.trim()) return
    addMember(name.trim(), room.trim(), role)
    setName("")
    setRoom("")
    setRole("member")
    setOpen(false)
  }

  return (
    <>
      <Section
        title="All members"
        action={
          isManager ? (
            <PrimaryButton onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add member
            </PrimaryButton>
          ) : undefined
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Room</th>
                <th className="px-3 py-3 font-medium">Joined</th>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-accent-foreground">
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span className="text-foreground">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{m.room}</td>
                  <td className="px-3 py-3 text-muted-foreground">{m.join}</td>
                  <td className="px-3 py-3">
                    <Badge tone={m.role === "manager" ? "primary" : "muted"}>{m.role}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={m.active ? "success" : "danger"}>
                      {m.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Modal open={open} title="Add new member" onClose={() => setOpen(false)}>
        <Field label="Full name">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sumon Ahmed"
          />
        </Field>
        <Field label="Room">
          <input
            className={inputClass}
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="e.g. Room 3"
          />
        </Field>
        <Field label="Role">
          <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="member">Member</option>
            <option value="manager">Manager</option>
          </select>
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <PrimaryButton onClick={submit}>Add member</PrimaryButton>
        </div>
      </Modal>
    </>
  )
}
