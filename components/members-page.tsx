"use client"

import { useState } from "react"
import { Plus, Crown, Trash2 } from "lucide-react"
import { useMess } from "@/components/mess-store"
import { Section, Badge, PrimaryButton, Modal, Field, inputClass } from "@/components/ui-bits"
import type { Role } from "@/lib/mess-data"

export function MembersPage() {
  const { members, addMember, deleteMember, transferManager, currentUser } = useMess()
  const [open, setOpen] = useState(false)
  const [transferId, setTransferId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
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

  const transferTarget = members.find((m) => m.id === transferId)
  const deleteTarget = members.find((m) => m.id === deleteId)

  const confirmTransfer = () => {
    if (transferId != null) transferManager(transferId)
    setTransferId(null)
  }

  const confirmDelete = () => {
    if (deleteId != null) {
      deleteMember(deleteId)
      setDeleteId(null)
    }
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
                {isManager && <th className="px-3 py-3 font-medium">Actions</th>}
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
                  {isManager && (
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        {m.role === "manager" ? (
                          <span className="text-xs text-muted-foreground">Current manager</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setTransferId(m.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground hover:bg-secondary"
                            title="Make manager"
                          >
                            <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteId(m.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground hover:bg-danger hover:text-card"
                          title="Delete member"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  )}
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

      <Modal
        open={transferId != null}
        title="Transfer manager role"
        onClose={() => setTransferId(null)}
      >
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Make <span className="font-medium text-foreground">{transferTarget?.name}</span> the new
          manager? The current manager will become a regular member. This is useful when the mess
          manager changes each month.
        </p>
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setTransferId(null)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <PrimaryButton onClick={confirmTransfer}>Confirm transfer</PrimaryButton>
        </div>
      </Modal>

      <Modal
        open={deleteId != null}
        title="Delete member"
        onClose={() => setDeleteId(null)}
      >
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>? 
          This action cannot be undone. All their meal records will also be removed.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setDeleteId(null)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="rounded-md border border-danger bg-danger px-3 py-1.5 text-xs font-medium text-card hover:opacity-90"
          >
            Delete Member
          </button>
        </div>
      </Modal>
    </>
  )
}
