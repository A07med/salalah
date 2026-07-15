interface EventBannerProps {
  className?: string;
}

export function EventBanner({ className = "" }: EventBannerProps) {
  return (
    <div
      className={`inline-block max-w-full rotate-[-1.5deg] rounded-[22px] border-[5px] border-game-ink bg-game-ink px-5 py-3 shadow-[7px_8px_0_rgba(45,28,21,0.38)] sm:px-7 sm:py-3.5 ${className}`}
      role="banner"
    >
      <p className="text-center font-display text-[0.95rem] font-extrabold tracking-wide text-game-bg sm:text-lg">
        خريف ظفار · تحدي المشلي
      </p>
    </div>
  );
}
