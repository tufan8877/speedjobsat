// components/ui/star-rating.tsx
import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type StarRatingProps = {
  /** Aktueller Wert (0–max) */
  value: number;
  /** Max Sterne */
  max?: number;
  /** Größe der Icons in px */
  size?: number;
  /** Optional: callback wenn klickbar */
  onChange?: (value: number) => void;
  /** Optional: erlaubt halbe Sterne */
  allowHalf?: boolean;
  /** Optional: deaktiviert Interaktion */
  disabled?: boolean;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function StarRating({
  value,
  max = 5,
  size = 18,
  onChange,
  allowHalf = false,
  disabled = false,
  className,
}: StarRatingProps) {
  const safeValue = clamp(value ?? 0, 0, max);

  const interactive = !!onChange && !disabled;

  const handleClick = (idx: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const next = allowHalf && x < rect.width / 2 ? idx - 0.5 : idx;
    onChange?.(clamp(next, 0, max));
  };

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`Bewertung ${safeValue} von ${max}`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starIndex = i + 1;

        const full = safeValue >= starIndex;
        const half = !full && allowHalf && safeValue >= starIndex - 0.5;

        const icon = (
          <span className="relative inline-flex">
            {/* Outline */}
            <Star
              style={{ width: size, height: size }}
              className={cn("opacity-60")}
            />
            {/* Fill overlay */}
            {(full || half) ? (
              <span
                className="absolute left-0 top-0 overflow-hidden"
                style={{
                  width: full ? "100%" : "50%",
                  height: "100%",
                }}
                aria-hidden="true"
              >
                <Star
                  style={{ width: size, height: size }}
                  className={cn("opacity-100")}
                  fill="currentColor"
                />
              </span>
            ) : null}
          </span>
        );

        if (!interactive) {
          return <span key={starIndex}>{icon}</span>;
        }

        return (
          <button
            key={starIndex}
            type="button"
            className={cn(
              "cursor-pointer rounded-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              disabled && "cursor-not-allowed opacity-50",
            )}
            onClick={(e) => handleClick(starIndex, e)}
            aria-label={`${starIndex} Sterne`}
            aria-checked={safeValue === starIndex}
            role="radio"
            disabled={disabled}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
