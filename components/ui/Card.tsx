import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[1.75rem] border-2 border-gold/30 p-6 shadow-2xl ${className}`}
      style={{
        background:
          "linear-gradient(165deg, rgba(45,99,71,0.95) 0%, rgba(22,61,44,0.96) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,247,230,0.12), 0 16px 36px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </div>
  );
}
