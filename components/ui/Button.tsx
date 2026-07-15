import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "game";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

const variants = {
  primary: "arcade-btn",
  game: "game-btn-primary",
  secondary:
    "bg-gradient-to-b from-khareef-green to-[#2d5a3a] text-khareef-cream border-2 border-khareef-mist/30 shadow-lg active:translate-y-0.5",
  ghost:
    "bg-white/10 text-khareef-cream border border-white/15 backdrop-blur-sm active:scale-95",
};

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}: ButtonProps) {
  const isGame = variant === "game";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${isGame ? "" : "rounded-2xl"} px-8 py-4 text-lg font-bold transition-transform duration-100 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
