import { redirect } from 'next/navigation'

export default function AdminPage() {
  // 直接重定向到管理员仪表板
  redirect('/admin/dashboard')
}
