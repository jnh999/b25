"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EyeOpenIcon,
  EyeNoneIcon,
  CopyIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";
import { copyToClipboard } from "./utils";
import "./styles.css";

interface SecretProps {
  secret: string;
  label?: string;
  maskCharacter?: string;
  hasBorder?: boolean;
}

export const Secret = ({
  secret,
  label = "Secret",
  maskCharacter = "•",
  hasBorder = true,
}: SecretProps) => {
  const [revealed, setRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const value = revealed ? secret : maskCharacter.repeat(21);

  async function copy() {
    const success = await copyToClipboard(secret);

    if (success) {
      setIsCopied(true);
      toast.success(`${label} copied to clipboard`);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }
  const ariaDescriptionLabel = label.toLowerCase().replace(" ", "-");

  return (
    <div
      className={`bg-white rounded-lg p-4 pr-8 flex items-center secret-field ${
        hasBorder ? "border border-gray-200" : ""
      }`}
      style={{ overflow: "visible" }}
      role="group"
      aria-label={`${label} field`}
    >
      <div className="min-w-0 flex flex-row items-center gap-2 max-w-full">
        <p
          className="font-mono break-words"
          aria-describedby={`secret-description-${ariaDescriptionLabel}`}
          data-testid="secret-text"
        >
          {value}
        </p>
        <span
          id={`secret-description-${ariaDescriptionLabel}`}
          className="sr-only"
        >
          {revealed ? `${label}: ${secret}` : `${label} (hidden)`}
        </span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setRevealed((r) => !r)}
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
        <Button
          type="button"
          variant="ghost"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="focus-ring"
          role="button"
        >
          {isCopied ? (
            <CheckIcon data-testid="check-icon" />
          ) : (
            <CopyIcon data-testid="copy-icon" />
          )}
        </Button>
      </div>
    </div>
  );
};
