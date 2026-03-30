import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

export function OnboardingLogo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative p-8">
      {/* Background radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]" />
      
      {/* Logo Image with Fade and Scale In */}
      <div 
        className={cn(
          "relative z-10 transition-all duration-1000 ease-out transform",
          mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        )}
      >
        <img 
          src="/assets/alwys_sirius_logo.png" 
          alt="ALWYS SIRIUS" 
          className="max-w-[320px] h-auto drop-shadow-[0_20px_50px_rgba(212,175,55,0.3)]"
        />
      </div>

      {/* Subtle branding tagline */}
      <div 
        className={cn(
          "mt-12 text-center transition-all duration-1000 delay-500 ease-out relative z-10",
          mounted ? "opacity-40 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <p className="text-[10px] tracking-[0.4em] uppercase font-light text-[#D4AF37]">
          Siriusly Ecosystem &middot; Orchestrated Zero-Human Business
        </p>
      </div>

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[#D4AF37]/20" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[#D4AF37]/20" />
    </div>
  );
}
