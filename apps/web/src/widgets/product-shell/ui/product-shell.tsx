import type { ReactNode } from "react";

export function ProductShell({ children }: { children: ReactNode }) {
  return (
    <div className="product-shell">
      <div className="mobile-frame">{children}</div>
    </div>
  );
}
