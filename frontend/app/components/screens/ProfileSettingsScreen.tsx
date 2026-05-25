"use client";

import { useContext, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, TickCircle } from "iconsax-react";
import { UserDataContext } from "@/contexts/userContext";
import { updateProfile } from "@/lib/api";
import { uploadFile } from "@/lib/upload";
import type { User } from "@/types/eventio";

const INTEREST_SUGGESTIONS = [
  "Web Dev", "AI/ML", "Hackathons", "Design", "Data Science",
  "Robotics", "Cybersecurity", "Gaming", "Music", "Sports",
  "Photography", "Entrepreneurship", "Finance", "Arts",
];

const GENDER_OPTIONS = [
  { value: "MALE",   label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER",  label: "Prefer not to say" },
];
const DEGREE_OPTIONS = ["B.Tech", "M.Tech", "MCA", "MBA", "B.Sc"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-poppins font-semibold text-mute uppercase tracking-widest px-1 mb-2 mt-5">
      {children}
    </p>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-poppins text-mute pl-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm font-poppins text-foreground placeholder:text-mute/50 focus:outline-none focus:border-primary transition-colors";

const selectCls =
  "w-full bg-card border border-border rounded-2xl px-4 py-3 pr-10 text-sm font-poppins text-foreground focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer";

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {/* Custom dropdown chevron */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-mute">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { userData, setUserData } = useContext(UserDataContext);
  const [saved, setSaved]               = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [customInterest, setCustomInterest] = useState("");
  const customRef  = useRef<HTMLInputElement>(null);
  const photoRef   = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Partial<User>>({
    name:         userData?.name         ?? "",
    phone_number: userData?.phone_number ? String(userData.phone_number) : "",
    branch:       userData?.branch       ?? "",
    degree:       userData?.degree       ?? "",
    year:         userData?.year         ?? new Date().getFullYear(),
    gender:       userData?.gender       ?? "",
    college:      userData?.college      ?? "",
    about:        userData?.about        ?? "",
    interests:    userData?.interests    ?? [],
    photo_url:    userData?.photo_url    ?? "",
  });

  const set = (key: keyof User, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleInterest = (tag: string) => {
    const cur = (form.interests as string[]) ?? [];
    set(
      "interests",
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    );
  };

  const addCustomInterest = () => {
    const tag = customInterest.trim();
    if (!tag) return;
    const cur = (form.interests as string[]) ?? [];
    if (!cur.includes(tag)) set("interests", [...cur, tag]);
    setCustomInterest("");
    customRef.current?.focus();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadFile(file, "eventio-council-images");
      set("photo_url", url);
    } catch { /* keep existing */ }
    finally { setUploadingPhoto(false); e.target.value = ""; }
  };

  const handleSave = async () => {
    if (!setUserData || !userData) return;
    setSaving(true);
    setError("");
    try {
      await updateProfile({
        name:         form.name         as string,
        phone_number: String(form.phone_number ?? "").trim(),
        gender:       form.gender       as string,
        year:         Number(form.year),
        branch:       form.branch       as string,
        degree:       form.degree       as string,
        college:      form.college      as string,
        about:        form.about        as string,
        interests:    form.interests    as string[],
        photo_url:    form.photo_url    as string,
      });
      // Update local context immediately so UI reflects changes
      setUserData({ ...userData, ...form } as User);
      setSaved(true);
      setTimeout(() => { setSaved(false); router.back(); }, 1500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || "Failed to save. Please try again.";
      setError(msg);
      setTimeout(() => setError(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  const interests = (form.interests as string[]) ?? [];

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm px-4 pt-12 pb-3 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft size={18} color="#8a8a8a" />
        </button>
        <h1 className="font-poppins font-bold text-lg text-foreground flex-1">
          Edit Profile
        </h1>
        <button
          onClick={handleSave}
          disabled={saving || uploadingPhoto}
          className="bg-primary text-white text-sm font-poppins font-semibold px-5 py-2 rounded-full shadow-md shadow-primary/30 transition-all active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="px-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-6">
          <div className="relative">
            <img
              src={(form.photo_url as string) || userData?.photo_url}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/30"
            />
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg disabled:opacity-60"
            >
              <Camera size={15} color="white" variant="Bold" />
            </button>
          </div>
          <p className="text-xs text-mute font-poppins mt-2">
            {uploadingPhoto ? "Uploading…" : "Tap to change photo"}
          </p>
        </div>

        {/* Personal */}
        <SectionLabel>Personal</SectionLabel>
        <div className="flex flex-col gap-3">
          <Field label="Full Name">
            <input
              className={inputCls}
              value={form.name as string}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your full name"
            />
          </Field>
          <Field label="Phone Number">
            <input
              className={inputCls}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={(form.phone_number as string) || ""}
              onChange={(e) => set("phone_number", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
            />
          </Field>
          <Field label="Gender">
            <SelectWrapper>
              <select
                className={selectCls}
                value={form.gender as string}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="" disabled>Select gender</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>
        </div>

        {/* Academic */}
        <SectionLabel>Academic</SectionLabel>
        <div className="flex flex-col gap-3">
          <Field label="College">
            <input
              className={inputCls}
              value={form.college as string}
              onChange={(e) => set("college", e.target.value)}
              placeholder="College name"
            />
          </Field>
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="Degree">
                <SelectWrapper>
                  <select
                    className={selectCls}
                    value={form.degree as string}
                    onChange={(e) => set("degree", e.target.value)}
                  >
                    <option value="" disabled>Degree</option>
                    {DEGREE_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </SelectWrapper>
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Grad Year">
                <input
                  className={inputCls}
                  type="number"
                  value={(form.year as number) || ""}
                  onChange={(e) => set("year", Number(e.target.value))}
                  placeholder="e.g. 2027"
                />
              </Field>
            </div>
          </div>
          <Field label="Branch">
            <input
              className={inputCls}
              value={form.branch as string}
              onChange={(e) => set("branch", e.target.value)}
              placeholder="e.g. Computer Engineering"
            />
          </Field>
        </div>

        {/* About */}
        <SectionLabel>About</SectionLabel>
        <Field label="Bio">
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={form.about as string}
            onChange={(e) => set("about", e.target.value)}
            placeholder="Tell people a bit about yourself…"
          />
        </Field>

        {/* Interests */}
        <SectionLabel>Interests</SectionLabel>
        <div className="flex flex-wrap gap-2 mb-3">
          {INTEREST_SUGGESTIONS.map((tag) => {
            const active = interests.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleInterest(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-poppins font-medium border transition-all ${
                  active
                    ? "bg-primary border-primary text-white"
                    : "bg-card border-border text-mute"
                }`}
              >
                {tag}
              </button>
            );
          })}
          {/* Custom interests not in suggestions */}
          {interests
            .filter((t) => !INTEREST_SUGGESTIONS.includes(t))
            .map((tag) => (
              <button
                key={tag}
                onClick={() => toggleInterest(tag)}
                className="px-3 py-1.5 rounded-full text-xs font-poppins font-medium border bg-primary border-primary text-white"
              >
                {tag} ×
              </button>
            ))}
        </div>
        {/* Add custom interest */}
        <div className="flex gap-2">
          <input
            ref={customRef}
            className={`${inputCls} flex-1`}
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
            placeholder="Add a custom interest…"
          />
          <button
            onClick={addCustomInterest}
            className="px-4 py-3 bg-card border border-border rounded-2xl text-sm font-poppins text-foreground font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Success snackbar */}
      {saved && (
        <div className="fixed bottom-8 left-4 right-4 bg-green-600 text-white p-4 rounded-2xl z-50 flex items-center gap-3 shadow-xl">
          <TickCircle size={22} color="white" variant="Bold" />
          <span className="font-poppins text-sm font-medium">
            Profile updated successfully!
          </span>
        </div>
      )}

      {/* Error snackbar */}
      {error && (
        <div className="fixed bottom-8 left-4 right-4 bg-red-600 text-white p-4 rounded-2xl z-50 flex items-center gap-3 shadow-xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="font-poppins text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
