"use client";

import { useState } from "react";

// Text input for the auth modals — same focus treatment as UserProfile's
// fields: a black gradient bar grows in along the bottom edge on focus.
// `rightSlot` is for things like the show/hide-password toggle.
export default function AuthInput({ hasError, rightSlot, onFocus, onBlur, inputRef, wrapperClassName = "", className = "", ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        {...props}
        ref={inputRef}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        className={`w-full px-4 py-3.5 ${rightSlot ? "pr-12" : ""} border text-[14px] text-[#0b0b0a] outline-none placeholder:text-[#8a8880] transition-colors duration-200 ${
          hasError ? "border-red-400" : focused ? "border-black/40" : "border-black/10"
        } ${className}`}
      />
      {rightSlot}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a] transition-all duration-300 ${
          focused ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
}
