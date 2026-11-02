'use client'

import { AdminProvider } from '@/components/admin/admin-provider'
import { AdminShell } from '@/components/admin/admin-shell'
import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  )
}
