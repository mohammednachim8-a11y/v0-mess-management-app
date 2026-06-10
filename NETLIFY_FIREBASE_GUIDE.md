# Netlify Deployment Guide

## Why Netlify?

✅ **Free tier** - Very generous  
✅ **Reliable** - 99.9% uptime  
✅ **Easy deployment** - Direct from GitHub  
✅ **Automatic deployments** - Every push to main  
✅ **Free SSL/HTTPS** - Secure by default  
✅ **Environmental variables** - For secrets  
✅ **Free bandwidth** - Plenty for small projects  

---

## Step 1: Deploy Frontend to Netlify

### A. Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Authorize Netlify to access your repositories

### B. Connect Your Repository
1. Click **"New site from Git"**
2. Select GitHub
3. Find and select `v0-mess-management-app`
4. Click **Connect**

### C. Configure Build Settings
Netlify auto-detects Next.js, so just verify:

**Build command:**
```
npm run build
```

**Publish directory:**
```
.next
```

**Node version:** 18 or higher (auto-set)

### D. Deploy
1. Click **Deploy site**
2. Wait 2-3 minutes
3. Get your live URL: `your-site-name.netlify.app`

---

## Step 2: Automatic Deployments

Once connected, every time you push to `main`:
1. Netlify automatically builds your app
2. Deploys to live URL
3. Updates within 2-3 minutes

**No manual work needed!**

---

## Step 3: Save Data with Firebase (Free)

### Why Firebase with Netlify?

```
Netlify (Frontend)  →  Firebase (Backend + Database + Storage)
   .netlify.app    →    google.com
     (Free)              (Free tier)
```

**No backend server needed!**

---

## Firebase Setup Instructions

### A. Create Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click **"Get Started"** → **"Create a project"**
3. Project name: `mess-management`
4. Click **Continue**
5. Google Analytics: Disable (for now)
6. Click **Create project**
7. Wait for setup to complete

### B. Enable Firestore Database

1. In Firebase console, click **Firestore Database**
2. Click **Create Database**
3. Start in **test mode** (for development)
4. Select region closest to you (e.g., `asia-southeast1`)
5. Click **Enable**

### C. Enable Storage for Images

1. Click **Storage**
2. Click **Get Started**
3. Start in **test mode**
4. Select same region
5. Click **Done**

### D. Get Firebase Config

1. Click **Project Settings** (⚙️)
2. Scroll to **Your apps** section
3. Click **Web** icon (</> symbol)
4. Register app name: `mess-management-web`
5. Copy the Firebase config

---

## Step 4: Add Firebase to Your App

### A. Install Firebase SDK

```bash
npm install firebase
```

### B. Create Firebase Config File

Create `lib/firebase.ts`:

```typescript
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
```

### C. Add Environment Variables to Netlify

1. In Netlify console, go to **Site settings**
2. Click **Build & deploy** → **Environment**
3. Click **Edit variables**
4. Add these variables from your Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY = your_value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_value
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_value
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_value
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_value
NEXT_PUBLIC_FIREBASE_APP_ID = your_value
```

---

## Step 5: Update Your App to Use Firebase

### A. Create Data Service

Create `lib/firebase-service.ts`:

```typescript
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import type { Expense, Member, Deposit } from "@/lib/mess-data"

const MESS_ID = "default-mess" // For now, single mess

// EXPENSES
export async function saveExpense(expense: Expense) {
  const docRef = await addDoc(collection(db, "expenses"), {
    ...expense,
    messId: MESS_ID,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function loadExpenses() {
  const q = query(collection(db, "expenses"), where("messId", "==", MESS_ID))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Expense[]
}

// MEMBERS
export async function saveMember(member: Member) {
  const docRef = await addDoc(collection(db, "members"), {
    ...member,
    messId: MESS_ID,
  })
  return docRef.id
}

export async function loadMembers() {
  const q = query(collection(db, "members"), where("messId", "==", MESS_ID))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Member[]
}

export async function deleteMemberFromDB(memberId: string) {
  await deleteDoc(doc(db, "members", memberId))
}

// DEPOSITS
export async function saveDeposit(deposit: Deposit) {
  const docRef = await addDoc(collection(db, "deposits"), {
    ...deposit,
    messId: MESS_ID,
  })
  return docRef.id
}

export async function loadDeposits() {
  const q = query(collection(db, "deposits"), where("messId", "==", MESS_ID))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Deposit[]
}

// IMAGE UPLOAD
export async function uploadReceiptImage(file: File): Promise<string> {
  const timestamp = Date.now()
  const filename = `receipts/${MESS_ID}/${timestamp}-${file.name}`
  const storageRef = ref(storage, filename)
  
  await uploadBytes(storageRef, file)
  const downloadUrl = await getDownloadURL(storageRef)
  
  return downloadUrl
}
```

### B. Update Mess Store

Modify `components/mess-store.tsx` to load/save from Firebase:

```typescript
"use client"

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react"
import {
  loadExpenses,
  loadMembers,
  loadDeposits,
  saveExpense,
  saveMember,
  saveDeposit,
  uploadReceiptImage,
  deleteMemberFromDB,
} from "@/lib/firebase-service"
// ... rest of imports

export function MessProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [messName, setMessName] = useState(MESS_NAME)
  const [members, setMembers] = useState<Member[]>([])
  const [mealData, setMealData] = useState<Record<number, MemberMeals>>({})
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load data from Firebase on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        const [loadedExpenses, loadedMembers, loadedDeposits] = await Promise.all([
          loadExpenses(),
          loadMembers(),
          loadDeposits(),
        ])
        
        setExpenses(loadedExpenses)
        setMembers(loadedMembers)
        setDeposits(loadedDeposits)
      } catch (error) {
        console.error("Failed to load data:", error)
        showToast("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  const value = useMemo<MessStore>(() => {
    return {
      currentUser,
      login: (username, password) => {
        const entry = CREDENTIALS[username.trim()]
        if (entry && entry.password === password.trim()) {
          setCurrentUser({ ...entry.user })
          return true
        }
        return false
      },
      logout: () => setCurrentUser(null),

      messName,
      setMessName: (name) => {
        if (name.trim()) {
          setMessName(name.trim())
          showToast("Mess name updated")
        }
      },

      members,
      addMember: async (name, room, role) => {
        const newMember: Member = {
          id: Date.now(),
          name,
          room: room || "TBD",
          join: "June 2025",
          role,
          active: true,
        }
        
        try {
          await saveMember(newMember)
          setMembers((prev) => [...prev, newMember])
          showToast("Member added")
        } catch (error) {
          console.error("Error adding member:", error)
          showToast("Failed to add member")
        }
      },

      deleteMember: async (memberId) => {
        try {
          await deleteMemberFromDB(String(memberId))
          setMembers((prev) => prev.filter((m) => m.id !== memberId))
          showToast("Member removed")
        } catch (error) {
          console.error("Error deleting member:", error)
          showToast("Failed to delete member")
        }
      },

      // ... rest of functions
    }
  }, [currentUser, messName, members, expenses, deposits, toast])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
```

### C. Update Image Upload Handler

In `components/expenses-page.tsx`:

```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    try {
      const url = await uploadReceiptImage(file)
      setImageUrl(url)
      showToast("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      showToast("Failed to upload image")
    }
  }
}
```

---

## Step 6: Deploy to Netlify

### A. Push Code to GitHub

```bash
git add .
git commit -m "Integrate Firebase for data persistence"
git push origin feature/new-features
```

### B. Create Pull Request

1. Go to your GitHub repo
2. Click **Pull requests**
3. Click **New pull request**
4. Select `main` as base, `feature/new-features` as compare
5. Click **Create pull request**
6. Click **Merge pull request** → **Confirm merge**

### C. Push to Main

```bash
git checkout main
git pull origin main
```

### D. Netlify Auto-deploys

1. Netlify automatically builds and deploys
2. Check progress in Netlify dashboard
3. Live in 2-3 minutes!

---

## Verification Checklist

- [ ] App deploys successfully on Netlify
- [ ] Live URL is accessible
- [ ] Add expense → saves to Firebase
- [ ] Add member → saves to Firebase
- [ ] Refresh page → data still there ✅
- [ ] Upload receipt image → appears in list
- [ ] Delete member → removed from Firebase

---

## Free Plan Limits (Netlify + Firebase)

### Netlify Free Tier:
- Bandwidth: 100 GB/month ✅
- Build minutes: 300/month ✅
- Deployments: Unlimited ✅
- Custom domain: Optional

### Firebase Free Tier:
- Firestore reads: 50,000/day ✅
- Firestore writes: 20,000/day ✅
- Storage: 5 GB ✅
- Auth: Unlimited ✅

**Perfect for your mess app!**

---

## Troubleshooting

### Issue: Firebase config not loading
**Solution**: Check environment variables in Netlify settings

### Issue: Images not uploading
**Solution**: Check Firebase Storage rules (should be test mode)

### Issue: Data not persisting
**Solution**: Check Firestore is enabled and test mode is on

### Issue: Slow loading
**Solution**: Add loading state (see code above)

---

## Next Steps (Future)

1. **Add user authentication** - Firebase Auth
2. **Multiple messes** - Support different messes
3. **User registration** - Self-signup
4. **Backup** - Export data as CSV
5. **Mobile app** - React Native version

---

## Support & Docs

- **Netlify Docs**: https://docs.netlify.com
- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Firestore**: https://firebase.google.com/docs/firestore

---

## Summary

```
┌─────────────────────────────────────┐
│  Your Mess Management App           │
├─────────────────────────────────────┤
│                                     │
│  Frontend (React/Next.js)           │
│  ↓ Deployed on NETLIFY (Free)      │
│  ↓ Live URL: your-app.netlify.app  │
│                                     │
│  Backend (Firebase)                 │
│  ↓ Database: Firestore (Free)      │
│  ↓ Storage: Firebase Storage (Free) │
│  ↓ Auth: Firebase Auth (Free)      │
│                                     │
│  Total Cost: $0 / month             │
│                                     │
└─────────────────────────────────────┘
```

**You're ready to go live! 🚀**
