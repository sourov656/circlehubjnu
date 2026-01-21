"use client";

import { AlertTriangle, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface AuthWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthWarningModal({
  isOpen,
  onClose,
  message = "You need to be logged in to perform this action.",
}: AuthWarningModalProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    // Store current URL to return after login
    const returnUrl = encodeURIComponent(pathname);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  return (
    <div className="fixed inset-0 z-10000 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
          {/* Header with warning color */}
          <div className="bg-warning/10 dark:bg-warning/20 border-b border-warning/20 dark:border-warning/30 p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-warning/20 dark:bg-warning/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Authentication Required
                </h3>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-foreground leading-relaxed">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please log in to continue. You will be redirected back to this
              page after successful login.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 pt-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLoginRedirect}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-sm"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
