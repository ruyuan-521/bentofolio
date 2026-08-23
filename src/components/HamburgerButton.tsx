"use client";

import { cn } from "@/lib/utils/cn";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export default function HamburgerButton({ isOpen, onToggle }: Props) {
  return (
    <button
      aria-label="展开/收起导航菜单"
      onClick={onToggle}
      className={cn(
        "md:hidden relative w-10 h-10 rounded-full",
        "flex items-center justify-center",
        "bg-card border border-border hover:border-white/20 transition-colors"
      )}
    >
      <span className="sr-only">菜单</span>
      <div className="relative w-4 h-3">
        <span
          className={cn(
            "absolute left-0 top-0 w-full h-0.5 bg-text rounded-full",
            "transition-transform duration-300 origin-left",
            isOpen && "translate-x-[1px] rotate-[45deg]"
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-text rounded-full",
            "transition-opacity duration-200",
            isOpen && "opacity-0"
          )}
        />
        <span
          className={cn(
            "absolute left-0 bottom-0 w-full h-0.5 bg-text rounded-full",
            "transition-transform duration-300 origin-left",
            isOpen && "translate-x-[1px] -rotate-[45deg]"
          )}
        />
      </div>
    </button>
  );
}
