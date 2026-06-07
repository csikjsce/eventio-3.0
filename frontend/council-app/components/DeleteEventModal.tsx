"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  deleteEvent,
  fetchEventDeletePreview,
  type EventDeletePreview,
} from "@/lib/api";

interface DeleteEventModalProps {
  eventId: number | string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteEventModal({
  eventId,
  onClose,
  onDeleted,
}: DeleteEventModalProps) {
  const [preview, setPreview] = useState<EventDeletePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadingPreview(true);
    fetchEventDeletePreview(eventId)
      .then(setPreview)
      .catch(() => setError("Could not load event details."))
      .finally(() => setLoadingPreview(false));
  }, [eventId]);

  const nameMatches =
    preview != null && confirmName.trim() === preview.name.trim();

  async function handleDelete() {
    if (!preview || !nameMatches || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await deleteEvent(eventId, confirmName.trim());
      onDeleted();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      setError(msg ?? "Failed to delete event. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-surface border border-border-c rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
        role="dialog"
        aria-labelledby="delete-event-title"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h2
              id="delete-event-title"
              className="text-tx font-fira font-semibold text-base"
            >
              Delete event permanently?
            </h2>
            <p className="text-muted-tx text-sm font-fira mt-1">
              This action cannot be undone. The following data will be removed
              along with the event:
            </p>
          </div>
        </div>

        {loadingPreview ? (
          <div className="flex items-center justify-center py-6 text-muted-tx text-sm font-fira gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading impact summary…
          </div>
        ) : preview ? (
          <ul className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 space-y-1.5 text-sm font-fira text-tx">
            <li>
              <span className="font-semibold">{preview.participants}</span>{" "}
              participant registration
              {preview.participants === 1 ? "" : "s"}
            </li>
            <li>
              <span className="font-semibold">{preview.attended}</span>{" "}
              attendance record{preview.attended === 1 ? "" : "s"}
            </li>
            <li>
              <span className="font-semibold">{preview.teams}</span> team
              {preview.teams === 1 ? "" : "s"} (including submissions)
            </li>
            <li>
              <span className="font-semibold">{preview.documents}</span> uploaded
              document{preview.documents === 1 ? "" : "s"}
            </li>
            <li>
              <span className="font-semibold">{preview.budgetItems}</span> budget
              line item{preview.budgetItems === 1 ? "" : "s"}
            </li>
            <li>
              <span className="font-semibold">{preview.announcements}</span>{" "}
              announcement{preview.announcements === 1 ? "" : "s"}
            </li>
            {preview.childEvents > 0 && (
              <li>
                <span className="font-semibold">{preview.childEvents}</span>{" "}
                linked sub-event{preview.childEvents === 1 ? "" : "s"} (and their
                data)
              </li>
            )}
          </ul>
        ) : null}

        {preview && (
          <div>
            <label className="block text-muted-tx text-xs font-fira mb-1.5">
              Type{" "}
              <span className="text-tx font-semibold">&quot;{preview.name}&quot;</span>{" "}
              to confirm
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={preview.name}
              className="w-full bg-bg border border-border-c rounded-xl px-3 py-2.5 text-sm font-fira text-tx outline-none focus:border-red-500/50"
              autoComplete="off"
            />
          </div>
        )}

        {error && (
          <p className="text-red-400 text-xs font-fira">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-fira bg-surface2 hover:bg-border-c text-tx border border-border-c transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!nameMatches || deleting || loadingPreview || !preview}
            className="flex-1 py-2.5 rounded-xl text-sm font-fira bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
