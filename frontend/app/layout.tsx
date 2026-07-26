import "./globals.css";

export const metadata = {
  title: "Confidential Safe Payroll",
  description: "Privacy layer on top of Gnosis Safe, powered by iExec Nox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header style={{ marginBottom: "2rem" }}>
            <div className="brand">[ Confidential Safe Payroll ]</div>
            <nav className="nav">
              <a href="/">Home</a>
              <a href="/admin">Admin</a>
              <a href="/employee">Employee</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
