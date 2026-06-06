"use client";

import { useEffect, useState } from "react";
import MoreDetailsForm from "@/components/MoreDetailsForm";
import Spinner from "@/components/Spinner";
import {
  type RegistrationField,
  buildInitialAnswers,
  validateClientAnswers,
} from "@/lib/registration-fields";

interface Props {
  fields: RegistrationField[];
  title?: string;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  onClose: () => void;
}

export default function RegistrationDetailsModal({
  fields,
  title = "Additional details",
  onSubmit,
  onClose,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValues(buildInitialAnswers(fields));
  }, [fields]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateClientAnswers(fields, values);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(values);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 px-4 pb-6 sm:pb-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-card rounded-2xl p-5 border border-border max-h-[85vh] overflow-y-auto"
      >
        <h2 className="font-poppins font-semibold text-lg text-foreground mb-1">
          {title}
        </h2>
        <p className="text-mute text-sm font-fira mb-4">
          Please answer a few questions to complete your registration.
        </p>

        <MoreDetailsForm fields={fields} values={values} onChange={setValues} />

        {error && (
          <p className="text-red-400 text-sm font-fira mt-3">{error}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-full bg-card border border-border text-foreground font-poppins text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-12 rounded-full bg-primary text-white font-poppins text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Spinner /> : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
