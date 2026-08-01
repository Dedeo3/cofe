import "./globals.css";

export const metadata = {
  title: "Confidential Safe Payroll",
  description: "Privacy layer on top of Gnosis Safe, powered by iExec Nox",
};

export const viewport = {
  themeColor: "#0b1110",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <a className="brand" href="/">
            Confidential Safe Payroll
          </a>
          <nav className="nav">
            <a href="/">Home</a>
            <a href="/admin">Admin</a>
            <a href="/employee">Employee</a>
          </nav>
        </header>
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
