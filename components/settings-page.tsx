"use client"

import { useState } from "react"
import { Lock, Edit2 } from "lucide-react"
import { useMess } from "@/components/mess-store"
import { Section, PrimaryButton, Modal, Field, inputClass } from "@/components/ui-bits"

export function SettingsPage() {
  const { currentUser, messName, setMessName, changePassword } = useMess()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showMessNameModal, setShowMessNameModal] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newMessName, setNewMessName] = useState(messName)

  const isManager = currentUser?.role === "manager"

  const handleChangePassword = () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      return
    }
    if (newPassword !== confirmPassword) {
      return
    }
    if (newPassword.length < 4) {
      return
    }
    if (changePassword(oldPassword, newPassword)) {
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordModal(false)
    }
  }

  const handleMessNameChange = () => {
    if (newMessName.trim() && newMessName !== messName) {
      setMessName(newMessName)
      setShowMessNameModal(false)
    }
  }

  return (
    <>
      <div className="max-w-2xl">
        <Section title="Account Settings" noPadding>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
              <div>
                <p className="text-sm font-medium text-card-foreground">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your account password for security</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Change Password
              </button>
            </div>

            {isManager && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Mess Name</p>
                  <p className="text-xs text-muted-foreground">Currently: <span className="font-medium">{messName}</span></p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewMessName(messName)
                    setShowMessNameModal(true)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
                >
                  <Edit2 className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                </button>
              </div>
            )}
          </div>
        </Section>

        <Section title="Account Information" noPadding>
          <div className="space-y-3 p-4">
            <div className="flex justify-between rounded-lg border border-border bg-secondary/30 p-3">
              <span className="text-xs font-medium text-muted-foreground">Name</span>
              <span className="text-sm font-medium text-foreground">{currentUser?.name}</span>
            </div>
            <div className="flex justify-between rounded-lg border border-border bg-secondary/30 p-3">
              <span className="text-xs font-medium text-muted-foreground">Role</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {currentUser?.role === "manager" ? "Admin" : "Member"}
              </span>
            </div>
            <div className="flex justify-between rounded-lg border border-border bg-secondary/30 p-3">
              <span className="text-xs font-medium text-muted-foreground">Username</span>
              <span className="text-sm font-medium text-foreground">{currentUser?.key}</span>
            </div>
          </div>
        </Section>
      </div>

      {/* Change Password Modal */}
      <Modal open={showPasswordModal} title="Change Password" onClose={() => setShowPasswordModal(false)}>
        <Field label="Current Password">
          <input
            className={inputClass}
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </Field>

        <Field label="New Password">
          <input
            className={inputClass}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 4 characters)"
          />
        </Field>

        <Field label="Confirm New Password">
          <input
            className={inputClass}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </Field>

        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <p className="mb-2 text-xs text-danger">Passwords do not match</p>
        )}

        {newPassword && newPassword.length < 4 && (
          <p className="mb-2 text-xs text-danger">Password must be at least 4 characters</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowPasswordModal(false)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <PrimaryButton onClick={handleChangePassword}>Change Password</PrimaryButton>
        </div>
      </Modal>

      {/* Mess Name Modal */}
      {isManager && (
        <Modal open={showMessNameModal} title="Change Mess Name" onClose={() => setShowMessNameModal(false)}>
          <Field label="Mess Name">
            <input
              className={inputClass}
              value={newMessName}
              onChange={(e) => setNewMessName(e.target.value)}
              placeholder="e.g. Green Villa Mess"
            />
          </Field>

          <p className="mb-2 text-xs text-muted-foreground">
            This name will be displayed to all members in the application.
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowMessNameModal(false)}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <PrimaryButton onClick={handleMessNameChange}>Save Changes</PrimaryButton>
          </div>
        </Modal>
      )}
    </>
  )
}
