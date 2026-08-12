export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "success" | "warning" | "neutral" | "danger" }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}
