"use client";

interface PlayerNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  error?: string | null;
  className?: string;
}

export function PlayerNameInput({
  value,
  onChange,
  onSubmit,
  error,
  className = "",
}: PlayerNameInputProps) {
  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor="player-name"
        className="mb-2.5 mt-3 block text-center text-[0.9375rem] font-extrabold text-game-ink sm:text-base"
      >
        اسمك يا بطل؟
      </label>
      <input
        id="player-name"
        data-qa="start-input"
        type="text"
        dir="rtl"
        value={value}
        maxLength={20}
        placeholder="اسم اللاعب"
        autoComplete="nickname"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !e.nativeEvent.isComposing &&
            onSubmit
          ) {
            e.preventDefault();
            onSubmit();
          }
        }}
        className={`game-input ${error ? "ring-4 ring-game-red/30" : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "player-name-error" : undefined}
      />
      {error && (
        <p
          id="player-name-error"
          className="mt-2 text-center text-sm font-bold text-game-red"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
