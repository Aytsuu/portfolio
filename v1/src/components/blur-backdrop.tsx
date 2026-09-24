import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const TRANSITION_MS = 320;

export interface BlurBackdropProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** When true, children render on the scrim with no glass panel wrapper. */
  bare?: boolean;
  showCloseButton?: boolean;
  closeLabel?: string;
  panelClassName?: string;
  labelledBy?: string;
  describedBy?: string;
}

export function BlurBackdrop({
  open,
  onClose,
  children,
  className,
  bare = false,
  showCloseButton = false,
  closeLabel = "Close",
  panelClassName,
  labelledBy,
  describedBy,
}: BlurBackdropProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mounted, open, onClose]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "blur-backdrop",
        bare && "blur-backdrop--bare",
        showCloseButton && "blur-backdrop--has-close",
        visible && "blur-backdrop--visible",
        className,
      )}
    >
      <button
        type="button"
        className="blur-backdrop-scrim"
        aria-label="Close overlay"
        onClick={onClose}
      />

      {showCloseButton && (
        <button
          type="button"
          className="blur-backdrop-close"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      <div className="blur-backdrop-scroll">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className={cn(
            bare ? "blur-backdrop-content" : "blur-backdrop-panel",
            panelClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
