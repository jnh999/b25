"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { copyToClipboard } from "./utils";
import "./styles.css";

interface QRCodeProps {
  value: string;
  label: string;
  size?: number;
  className?: string;
  description?: string;
}

export const QRCode = ({
  value,
  label,
  size = 300,
  className = "",
  description,
}: QRCodeProps) => {
  const [isCopied, setIsCopied] = useState(false);

  // Reset isCopied when component mounts or value changes
  useEffect(() => {
    setIsCopied(false);
  }, [value]);

  async function copy() {
    const success = await copyToClipboard(value);

    if (success) {
      setIsCopied(true);
      toast.success(`${label} copied to clipboard`);

      // Reset the copied state after animation
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }

  return (
    <div
      className={`qr-container mb-10 ${className}`}
      role="group"
      aria-label={label}
    >
      {description && (
        <p className="text-sm text-gray-600 mb-2" id={`${label}-description`}>
          {description}
        </p>
      )}
      <div className="flex flex-col items-center">
        <div className="relative">
          <button
            type="button"
            onClick={copy}
            className="focus-ring rounded-lg overflow-hidden"
            aria-label={`Click to copy ${label}`}
            aria-describedby={description ? `${label}-description` : undefined}
          >
            <QRCodeSVG
              value={value}
              size={size}
              level="M"
              includeMargin={true}
              aria-hidden="true"
              className="bg-white"
            />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">
          {isCopied
            ? "Copied!"
            : `Click QR code to copy ${label.toLowerCase()}`}
        </p>
      </div>
    </div>
  );
};
