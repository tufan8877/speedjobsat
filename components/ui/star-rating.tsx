import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type StarRatingProps = {
  value?: number;
  rating?: number;
  max?: number;
  size?: number | "sm" | "md" | "lg";
  onChange?: (value: number) => void;
  onRatingChange?: (value: number) => void;
  interactive?: boolean;
  allowHalf?: boolean;
  disabled?: boolean;
  showText?: boolean;
  reviewCount?: number;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function resolveSize(size: StarRatingProps["size"]) {
  if (typeof size === "number") return size;
  if (size === "sm") return 16;
  if (size === "lg") return 24;
  return 20;
}

export function StarRating({
  value,
  rating,
  max = 5,
  size = "md",
  onChange,
  onRatingChange,
  interactive = false,
  allowHalf = false,
  disabled = false,
  showText = true,
  reviewCount,
  className,
}: StarRatingProps) {
  const currentValue = value ?? rating ?? 0;
  const safeValue = clamp(Number(currentValue) || 0, 0, max);
  const iconSize = resolveSize(size);
  const handleRatingChange = onChange || onRatingChange;
  const isInteractive = (interactive || !!handleRatingChange) && !disabled;

  const handleClick = (idx: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isInteractive || !handleRatingChange) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const next = allowHalf && x < rect.width / 2 ? idx - 0.5 : idx;
    handleRatingChange(clamp(next, 1, max));
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className="inline-flex items-center gap-1"
        role={isInteractive ? "radiogroup" : "img"}
        aria-label={`Bewertung ${safeValue} von ${max}`}
      >
        {Array.from({ length: max }).map((_, i) => {
          const starIndex = i + 1;
          const full = safeValue >= starIndex;
          const half = !full && allowHalf && safeValue >= starIndex - 0.5;

          const icon = (
            <span className="relative inline-flex text-yellow-500">
              <Star
                style={{ width: iconSize, height: iconSize }}
                className="opacity-60"
              />
              {(full || half) && (
                <span
                  className="absolute left-0 top-0 overflow-hidden"
                  style={{ width: full ? "100%" : "50%", height: "100%" }}
                  aria-hidden="true"
                >
                  <Star
                    style={{ width: iconSize, height: iconSize }}
                    fill="currentColor"
                    className="opacity-100"
                  />
                </span>
              )}
            </span>
          );

          if (!isInteractive) {
            return <span key={starIndex}>{icon}</span>;
          }

          return (
            <button
              key={starIndex}
              type="button"
              className="cursor-pointer rounded-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={(event) => handleClick(starIndex, event)}
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

      {showText && (
        <span className="text-sm text-muted-foreground">
          {reviewCount !== undefined
            ? `${safeValue.toFixed(1)} (${reviewCount})`
            : safeValue > 0
              ? `${safeValue.toFixed(1)} von ${max}`
              : "Noch keine Bewertung"}
        </span>
      )}
    </div>
  );
}
