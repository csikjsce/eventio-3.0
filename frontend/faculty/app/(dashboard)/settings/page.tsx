"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Save, Upload } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import { useData } from "@/contexts/DataContext";
import { updateProfile } from "@/lib/api";
import { buildSignaturePayload, getSignaturePngUrl } from "@/lib/signature";
import { uploadFile } from "@/lib/upload";

const INPUT =
  "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-red-500/40 placeholder:text-muted-foreground transition-colors";
const LABEL = "block text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1.5";

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

export default function SettingsPage() {
  const { user, refresh } = useData();
  const photoRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureDraft, setSignatureDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setPhone(user.phone_number ? String(user.phone_number) : "");
    setAbout(user.about ?? "");
    setPhotoUrl(user.photo_url ?? "");
    setSignatureUrl(getSignaturePngUrl(user.signature));
  }, [user]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    try {
      const url = await uploadFile(file, "eventio-council-images");
      setPhotoUrl(url);
      showToast("Photo uploaded — save to apply.");
    } catch {
      showToast("Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      showToast("Name is required.");
      return;
    }
    setSaving(true);
    try {
      let signaturePayload: unknown | undefined;
      if (signatureDraft) {
        const file = dataUrlToFile(signatureDraft, `signature-${user?.id ?? "faculty"}.png`);
        const pngUrl = await uploadFile(file, "eventio-council-images");
        signaturePayload = buildSignaturePayload(pngUrl);
        setSignatureUrl(pngUrl);
        setSignatureDraft(null);
      }

      await updateProfile({
        name: name.trim(),
        phone_number: phone.trim() || null,
        about: about.trim() || null,
        photo_url: photoUrl || undefined,
        ...(signaturePayload !== undefined ? { signature: signaturePayload } : {}),
      });
      await refresh();
      showToast("Profile saved.");
    } catch {
      showToast("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSignature() {
    setSignatureUrl(null);
    setSignatureDraft(null);
    try {
      await updateProfile({ signature: null });
      await refresh();
      showToast("Signature removed.");
    } catch {
      showToast("Could not remove signature.");
    }
  }

  if (!user) return null;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-2xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-card border border-border shadow-xl rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-foreground font-marcellus text-xl sm:text-2xl mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Update your profile and digital signature for document approval.</p>
      </div>

      {/* Profile photo */}
      <section className="bg-card border border-border rounded-2xl p-5 mb-5">
        <p className="text-foreground text-sm font-semibold mb-4">Profile photo</p>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted border border-border shrink-0">
            {photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-semibold">
                {name.charAt(0) || "?"}
              </div>
            )}
          </div>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:border-red-500/30 cursor-pointer transition-colors">
            <Camera size={15} className="text-red-500" />
            {uploadingPhoto ? "Uploading…" : "Change photo"}
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingPhoto}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </section>

      {/* Basic info */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4 mb-5">
        <p className="text-foreground text-sm font-semibold">Profile</p>
        <div>
          <label className={LABEL}>Full name</label>
          <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className={LABEL}>Email</label>
          <input className={`${INPUT} opacity-70 cursor-not-allowed`} value={user.email} readOnly />
        </div>
        <div>
          <label className={LABEL}>Phone</label>
          <input
            className={INPUT}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
          />
        </div>
        <div>
          <label className={LABEL}>Bio / designation (optional)</label>
          <textarea
            className={`${INPUT} resize-y min-h-[80px]`}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="e.g. Faculty Advisor — Computer Engineering"
            rows={3}
          />
        </div>
      </section>

      {/* Digital signature */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4 mb-6">
        <div>
          <p className="text-foreground text-sm font-semibold">Digital signature</p>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
            Draw your signature once. It is saved as a PNG and can be applied when signing documents in the portal.
          </p>
        </div>

        {signatureUrl && !signatureDraft && (
          <div className="rounded-xl border border-border bg-white p-4 flex items-center justify-between gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signatureUrl} alt="Saved signature" className="h-14 max-w-[220px] object-contain" />
            <button
              type="button"
              onClick={removeSignature}
              className="text-xs text-muted-foreground hover:text-red-500 shrink-0"
            >
              Remove
            </button>
          </div>
        )}

        <SignaturePad
          initialUrl={signatureUrl}
          onChange={setSignatureDraft}
        />

        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-red-500/30 cursor-pointer">
          <Upload size={14} className="text-red-500" />
          Upload signature PNG
          <input
            type="file"
            accept="image/png,image/webp,image/jpeg"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const url = await uploadFile(file, "eventio-council-images");
                await updateProfile({ signature: buildSignaturePayload(url) });
                setSignatureUrl(url);
                setSignatureDraft(null);
                await refresh();
                showToast("Signature saved.");
              } catch {
                showToast("Signature upload failed.");
              }
              e.target.value = "";
            }}
          />
        </label>
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50 transition-colors"
      >
        <Save size={15} />
        {saving ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
