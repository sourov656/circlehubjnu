"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDeleting = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onCancel}
      />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-card rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-center text-foreground mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-muted transition-colors duration-200 font-medium disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
