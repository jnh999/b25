"use client";

import { useState } from "react";

import { copyToClipboard, truncateBtcAddress } from "./utils";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons";

import { toast } from "sonner";
import "./styles.css";

interface ExpandableFullPageTextProps {
  text: string;
  label: string;
  type: "text" | "address" | "invoice";
  showCopyButton?: boolean;
  hasBorder?: boolean;
}

export const ExpandableTextFullPage = ({
  text,
  label,
  type = "text",
  showCopyButton = true,
  hasBorder = true,
}: ExpandableFullPageTextProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Create a deterministic hash from the text content
  const uniqueId = text
    .split("")
    .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    .toString(36);

  async function copy() {
    const success = await copyToClipboard(text);

    if (success) {
      setIsCopied(true);
      toast.success(`${label} copied to clipboard`);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }

  const ariaDescriptionLabel = label.toLowerCase().replace(" ", "-");
  const isShortText = text.length <= 15;

  return (
    <div
      className={`bg-white rounded-lg p-4 flex items-start justify-between ${
        hasBorder ? "border border-gray-200" : ""
      }`}
      role="group"
      aria-label={label}
    >
      <div className="min-w-0 flex-1">
        <p
          className="bitcoin-address font-mono"
          aria-describedby={`expandable-description-${ariaDescriptionLabel}-${uniqueId}`}
        >
          {isShortText ? (
            text
          ) : (
            <>
              <span>{text.slice(0, 6)}</span>
              {(isExpanded ? text : truncateBtcAddress(text)).slice(6, -6)}
              <span>{text.slice(-6)}</span>
            </>
          )}
        </p>
        <span
          id={`expandable-description-${ariaDescriptionLabel}-${uniqueId}`}
          className="sr-only"
        >
          {`${label}: ${isExpanded ? text : truncateBtcAddress(text)}`}
        </span>
        {!isShortText && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-sm text-orange-base hover:text-orange-darker focus-ring"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Hide full ${type}` : `View full ${type}`}
          >
            {isExpanded ? `Hide full ${type}` : `View full ${type}`}
          </button>
        )}
      </div>
      {showCopyButton && (
        <div className="ml-4 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            className="h-15 w-15 focus-ring"
            onClick={copy}
            aria-label={`Copy ${label}`}
          >
            {isCopied ? (
              <CheckIcon data-testid="check-icon" />
            ) : (
              <CopyIcon data-testid="copy-icon" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
