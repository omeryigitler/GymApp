export function ProductShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="product-shell">
      <div className="mobile-frame">{children}</div>
    </div>
  );
}
