import type { Metadata } from 'next';
import ThemeShell from './ThemeShell';
import './admin.css';

// Never index the admin portal.
export const metadata: Metadata = {
  title: "S'QB Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ThemeShell>{children}</ThemeShell>;
}
