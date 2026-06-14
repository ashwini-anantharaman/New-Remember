"use client";

export default function ViewerShell({ children, className = "" }) {
  return (
    <div className={`min-h-screen w-full bg-r-bg text-r-text ${className}`}>
      {children}
    </div>
  );
}
