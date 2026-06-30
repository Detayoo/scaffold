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
        position="bottom-right"
        richColors
        className="md:bottom-4 md:right-4 bottom-4 right-4"
      />
    </div>
  );
}
