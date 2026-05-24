"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

/* ─── Branch options keyed by grad year ─── */
const branchOptions: Record<string, string[]> = {
  "2025": ["Computer Engineering", "Information Technology", "Electronics", "Mechanical", "Electronics And Telecommunications"],
  "2026": ["Computer Engineering", "Information Technology", "Mechanical", "Electronics And Telecommunications", "Electronics And Computers"],
  "2027": ["Computer Engineering", "Computer And Communication", "Information Technology", "Artificial Intelligence And Data Science", "Mechanical", "Electronics And Telecommunications", "Electronics And Computers", "Robotics And Artificial Intelligence"],
  "2028": ["Computer Engineering", "Computer And Communication", "Computer Science And Business Systems", "Information Technology", "Artificial Intelligence And Data Science", "Mechanical", "Electronics And Telecommunications", "Electronics And Computers", "Electronics VLSI", "Robotics And Artificial Intelligence"],
  "2029": ["Computer Engineering", "Computer And Communication", "Computer Science And Business Systems", "Information Technology", "Artificial Intelligence And Data Science", "Mechanical", "Electronics And Telecommunications", "Electronics And Computers", "Electronics VLSI", "Robotics And Artificial Intelligence", "Other"],
};

const interestChips = [
  "Web Development", "Cybersecurity", "AI/ML",
  "Competitive Programming", "Data Science", "Data Analytics",
  "WEB3", "Networking", "App Development", "Robotics",
];

/* ─── Shared field wrapper ─── */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-poppins font-medium text-mute uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs font-poppins">{error}</p>}
    </div>
  );
}

/* ─── Input style ─── */
const inputCls =
  "w-full h-12 rounded-2xl px-4 bg-card border border-border text-foreground font-poppins text-sm outline-none focus:border-primary transition-colors placeholder:text-mute/50";

const selectCls = `${inputCls} pr-10 appearance-none cursor-pointer`;

/* ─── Select wrapper with chevron ─── */
function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-mute">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Quote ─── */
function Quote() {
  return (
    <div className="text-center text-mute font-fira text-sm px-4">
      <p className="italic">"Genius is one percent inspiration and ninety-nine percent perspiration."</p>
      <p className="mt-1">~ Thomas Edison</p>
    </div>
  );
}

/* ─── Progress bar ─── */
function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < step ? "bg-primary" : "bg-surface"}`}
        />
      ))}
    </div>
  );
}

/* ─── Step 1: Personal Details ─── */
function PersonalDetails({
  data, onChange, onNext,
}: {
  data: { phone: string; gender: string };
  onChange: (k: string, v: string) => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^\d{10}$/.test(data.phone)) e.phone = "Mobile number must be 10 digits";
    if (!data.gender) e.gender = "Please select a gender";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="flex flex-col justify-between min-h-screen px-6 pt-6 pb-10">
      <div>
        <Progress step={1} total={3} />
        <h1 className="mt-6 mb-1 text-2xl font-bold font-fira text-foreground">Personal Details</h1>
        <p className="mb-8 text-base font-fira text-mute">Fill out your personal details</p>

        <div className="flex flex-col gap-5">
          <Field label="Mobile Number" error={errors.phone}>
            <input
              className={inputCls}
              placeholder="10-digit mobile number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={data.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </Field>

          <Field label="Gender" error={errors.gender}>
            <SelectWrapper>
              <select
                className={selectCls}
                value={data.gender}
                onChange={(e) => onChange("gender", e.target.value)}
              >
                <option value="" disabled>Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Prefer not to say</option>
              </select>
            </SelectWrapper>
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Quote />
        <div className="flex justify-end">
          <button
            onClick={() => { if (validate()) onNext(); }}
            className="px-8 py-3 rounded-full border-2 border-primary text-primary font-poppins font-medium text-sm active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Educational Details ─── */
function EducationalDetails({
  data, onChange, onNext, onBack,
}: {
  data: { year: string; branch: string };
  onChange: (k: string, v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const branches = branchOptions[data.year] ?? [];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.year) e.year = "Please select a graduation year";
    if (!data.branch) e.branch = "Please select a branch";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="flex flex-col justify-between min-h-screen px-6 pt-6 pb-10">
      <div>
        <Progress step={2} total={3} />
        <h1 className="mt-6 mb-1 text-2xl font-bold font-fira text-foreground">Educational Details</h1>
        <p className="mb-8 text-base font-fira text-mute">Fill out your educational details</p>

        <div className="flex flex-col gap-5">
          <Field label="Graduation Year" error={errors.year}>
            <SelectWrapper>
              <select
                className={selectCls}
                value={data.year}
                onChange={(e) => {
                  onChange("year", e.target.value);
                  onChange("branch", "");
                }}
              >
                <option value="" disabled>Select Graduation Year</option>
                {["2025", "2026", "2027", "2028", "2029"].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>

          <Field label="Branch" error={errors.branch}>
            <SelectWrapper>
              <select
                className={selectCls}
                value={data.branch}
                disabled={!data.year}
                onChange={(e) => onChange("branch", e.target.value)}
              >
                <option value="" disabled>Select Branch</option>
                {branches.map((b) => (
                  <option key={b} value={b.replace(/ /g, "_")}>{b}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Quote />
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full bg-surface text-mute font-poppins font-medium text-sm active:scale-95 transition-all"
          >
            Back
          </button>
          <button
            onClick={() => { if (validate()) onNext(); }}
            className="px-8 py-3 rounded-full border-2 border-primary text-primary font-poppins font-medium text-sm active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Career Interests ─── */
function Interests({
  selected, onToggle, onSubmit, onBack, loading,
}: {
  selected: string[];
  onToggle: (chip: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col justify-between min-h-screen px-6 pt-6 pb-10">
      <div>
        <Progress step={3} total={3} />
        <h1 className="mt-6 mb-1 text-2xl font-bold font-fira text-foreground">Career Interest</h1>
        <p className="mb-8 text-base font-fira text-mute">Choose your points of interest</p>

        <div className="flex flex-wrap gap-2">
          {interestChips.map((chip) => {
            const active = selected.includes(chip);
            return (
              <button
                key={chip}
                onClick={() => onToggle(chip)}
                className={`px-4 py-2.5 rounded-full font-poppins text-sm font-medium transition-all active:scale-95 ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-surface text-foreground"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Quote />
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full bg-surface text-mute font-poppins font-medium text-sm active:scale-95 transition-all"
          >
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-full border-2 border-primary text-primary font-poppins font-medium text-sm disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading && <Spinner />}
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 4: All Done ─── */
function AllDone({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center gap-6">
      <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center">
        <span className="text-5xl">🎉</span>
      </div>
      <div>
        <h1 className="text-vitality font-marcellus text-4xl mb-3">You are all done</h1>
        <p className="text-lg font-fira text-mute">Start your new journey and experience now</p>
      </div>
      <button
        onClick={onGoHome}
        className="mt-4 w-56 px-4 py-3 rounded-full border-2 border-primary font-poppins text-foreground text-sm active:scale-95 transition-all"
      >
        Start Exploring →
      </button>
    </div>
  );
}

/* ─── Root component ─── */
type Step = "PersonalDetails" | "EducationalDetails" | "Interest" | "AllDone";

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("PersonalDetails");
  const [loading, setLoading] = useState(false);

  const [personal, setPersonal] = useState({ phone: "", gender: "" });
  const [education, setEducation] = useState({ year: "", branch: "" });
  const [interests, setInterests] = useState<string[]>([]);

  const updatePersonal = (k: string, v: string) => setPersonal((p) => ({ ...p, [k]: v }));
  const updateEducation = (k: string, v: string) => setEducation((p) => ({ ...p, [k]: v }));
  const toggleInterest = (chip: string) =>
    setInterests((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { submitOnboarding } = await import("@/lib/api");
      await submitOnboarding({
        phone_number: personal.phone,
        gender: personal.gender,
        year: education.year,
        branch: education.branch,
        degree: "B.E.",
        college: "KJSCE",
        roll_number: "",
        interests,
      });
    } catch {
      // Proceed even if the API call fails — user can update later
    } finally {
      localStorage.setItem("eventio-onboarded", "true");
      setLoading(false);
      setStep("AllDone");
    }
  };

  const handleGoHome = () => {
    router.replace("/");
  };

  return (
    <div className="bg-background">
      {step === "PersonalDetails" && (
        <PersonalDetails data={personal} onChange={updatePersonal} onNext={() => setStep("EducationalDetails")} />
      )}
      {step === "EducationalDetails" && (
        <EducationalDetails data={education} onChange={updateEducation} onNext={() => setStep("Interest")} onBack={() => setStep("PersonalDetails")} />
      )}
      {step === "Interest" && (
        <Interests selected={interests} onToggle={toggleInterest} onSubmit={handleSubmit} onBack={() => setStep("EducationalDetails")} loading={loading} />
      )}
      {step === "AllDone" && <AllDone onGoHome={handleGoHome} />}
    </div>
  );
}
