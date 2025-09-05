import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Guide de Lyon',
  description: 'Espace administration Guide de Lyon',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}