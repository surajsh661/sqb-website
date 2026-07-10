// Dark-only shell: the S'QB logo above the console. (No light mode — the flat
// comic theme is designed for dark.)
export default function ThemeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-root">
      <div className="adm-stack">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="adm-logo" src="/logo-admin-dark.png" alt="S'QB Pictures" />
        {children}
      </div>
    </div>
  );
}
