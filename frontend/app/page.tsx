export default function HomePage() {
  return (
    <main>
      <div className="tag">A privacy layer for onchain payroll</div>
      <h1>
        Pay your team.
        <br />
        <span className="muted">Keep the numbers private.</span>
      </h1>
      <p>
        Salary amounts and recipient lists stay confidential — encrypted via iExec Nox —
        while the company Safe keeps full custody and every transaction remains
        verifiable onchain, on Sepolia.
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Admin</h2>
        <p>Encrypt salaries client-side and run a payroll batch through the Safe.</p>
        <a href="/admin" className="btn btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
          Open admin →
        </a>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Employee</h2>
        <p>Connect your wallet and decrypt your own confidential balance.</p>
        <a href="/employee" className="btn btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
          Check balance →
        </a>
      </div>
    </main>
  );
}
