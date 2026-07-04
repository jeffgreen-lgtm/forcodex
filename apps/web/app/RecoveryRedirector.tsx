"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RecoveryRedirector() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) {
      return;
    }

    const params = new URLSearchParams(hash);
    if (params.get("type") !== "recovery" || !params.get("access_token")) {
      return;
    }

    window.sessionStorage.setItem("cosmoscope-recovery-hash", hash);

    if (pathname === "/reset") {
      return;
    }

    window.location.replace(`/reset#${hash}`);
  }, [pathname]);

  return null;
}
