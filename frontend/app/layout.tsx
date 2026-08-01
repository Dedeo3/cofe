import "./globals.css";
import { WalletProvider } from "../lib/WalletContext";
import WalletButton from "../components/WalletButton";

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
        <WalletProvider>
          <header className="site-header">
            <a className="brand" href="/">
              Confidential Safe Payroll
            </a>
            <nav className="nav">
              <a href="/">Home</a>
              <a href="/admin">Admin</a>
              <a href="/employee">Employee</a>
            </nav>
            <WalletButton />
          </header>
          <div className="shell">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
}
