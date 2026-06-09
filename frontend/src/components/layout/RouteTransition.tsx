"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      key={pathname} 
      className={mounted ? "animate-fade-in" : "opacity-0"}
    >
      {children}
    </div>
  );
}
