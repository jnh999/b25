"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";

import "./styles.css";

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    label?: string;
  }
>(
  (
    {
      className,
      type = "text",
      onChange,
      value,
      defaultValue,
      placeholder,
      label,
      autoFocus = true,
      ...props
    },
    ref
  ) => {
    const [revealed, setRevealed] = React.useState(false);

    const ariaDescriptionLabel = label?.toLowerCase().replace(" ", "-");

    return (
      <div
        className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between min-h-[2.5rem] secret-field"
        role="group"
        aria-label={`${label} field`}
      >
        <div className="min-w-0 flex-1 max-w-full overflow-x-auto">
          <input
            ref={ref}
            inputMode="text"
            type={revealed ? "text" : "password"}
            style={{ wordBreak: "normal" }}
            aria-describedby={`secret-description-${ariaDescriptionLabel}`}
            data-testid="secret-text"
            value={value}
            defaultValue={defaultValue}
            className={
              "text-4xl font-bold flex-1 bg-transparent border-none outline-none focus:outline-none"
            }
            onChange={onChange}
            {...props}
          />
          <span
            id={`secret-description-${ariaDescriptionLabel}`}
            className="sr-only"
          >
            {revealed ? `${label}: ${value}` : `${label} (hidden)`}
          </span>
        </div>
        <div className="ml-4 flex-shrink-0 flex items-center h-full gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setRevealed((r: boolean) => !r)}
            aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
            role="button"
            aria-pressed={revealed}
            className="focus-ring"
          >
            {revealed ? (
              <EyeNoneIcon width={22} height={22} aria-hidden="true" />
            ) : (
              <EyeOpenIcon width={22} height={22} aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
