"use client";

import { useEffect, useRef } from "react";
import { Toaster as SonnerToaster } from "sonner";

export function ToasterShell() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
  }, []);

  return (
    <div ref={containerRef}>
      <SonnerToaster
        position="bottom-left"
        richColors
        className="md:bottom-4 md:left-4 bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0"
      />
    </div>
  );
}
