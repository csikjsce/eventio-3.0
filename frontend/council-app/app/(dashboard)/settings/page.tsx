"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { fetchCouncilProfile, updateCouncilProfile, type CouncilProfile } from "@/lib/api";
import { useData } from "@/contexts/DataContext";
import {
  Settings, Users, Upload, Plus, X, Edit2, Trash2,
  Mail, Link2, ChevronDown, CheckCircle2, Save, AtSign, Phone, Globe,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FacultyAdvisor {
  id: string;
  name: string;
  email: string;
  dept: string;
  designation: string;
}

interface CouncilSettings {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  logo_url: string;
  banner_url: string;
  instagram: string;
  linkedin: string;
  website: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  is_head: boolean;
  photo_url: string;
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL_SETTINGS: CouncilSettings = {
  name: "CSI KJSCE",
  tagline: "Computer Society of India — K.J. Somaiya College of Engineering",
  description: "CSI KJSCE is the student chapter of the Computer Society of India at KJSCE, Vidyavihar. We organise technical workshops, hackathons, speaker sessions, and competitions to empower students with industry-relevant skills.",
  email: "csi@somaiya.edu",
  phone: "9876543200",
  logo_url: "/EventioLogo.svg",
  banner_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
  instagram: "csi_kjsce",
  linkedin: "https://linkedin.com/company/csi-kjsce",
  website: "https://csikjsce.org",
};

const INITIAL_ADVISORS: FacultyAdvisor[] = [
  { id: "fa1", name: "Prof. Anita Desai",   email: "anita.desai@somaiya.edu",   dept: "Computer Engineering",     designation: "Faculty Advisor"        },
  { id: "fa2", name: "Prof. Suresh Nair",   email: "suresh.nair@somaiya.edu",   dept: "Information Technology",   designation: "Co-Faculty Advisor"     },
];

const ROLES = [
  "President", "Vice President", "General Secretary", "Joint Secretary",
  "Treasurer", "Technical Head", "Design Head", "Marketing Head",
  "PR Head", "Operations Head", "Content Head", "Event Head", "Member",
];

const TEAMS = [
  "Core", "Technical", "Design", "Marketing", "Public Relations",
  "Operations", "Content", "Finance",
];

const INITIAL_MEMBERS: Member[] = [
  { id: "m1", name: "Arnab Sen",       email: "arnab@somaiya.edu",  role: "President",       team: "Core",      is_head: true,  photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=b61f2d&textColor=ffffff" },
  { id: "m2", name: "Priya Sharma",    email: "priya@somaiya.edu",  role: "Vice President",  team: "Core",      is_head: true,  photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=PS&backgroundColor=3b82f6&textColor=ffffff" },
  { id: "m3", name: "Rohan Mehta",     email: "rohan@somaiya.edu",  role: "Technical Head",  team: "Technical", is_head: true,  photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=RM&backgroundColor=8b5cf6&textColor=ffffff" },
  { id: "m4", name: "Sneha Kulkarni",  email: "sneha@somaiya.edu",  role: "Design Head",     team: "Design",    is_head: true,  photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=SK&backgroundColor=ec4899&textColor=ffffff" },
  { id: "m5", name: "Dev Patel",       email: "dev@somaiya.edu",    role: "Member",          team: "Technical", is_head: false, photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=DP&backgroundColor=10b981&textColor=ffffff" },
  { id: "m6", name: "Tanvi Patil",     email: "tanvi@somaiya.edu",  role: "Member",          team: "Design",    is_head: false, photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=TP&backgroundColor=f59e0b&textColor=ffffff" },
  { id: "m7", name: "Karan Verma",     email: "karan@somaiya.edu",  role: "Marketing Head",  team: "Marketing", is_head: true,  photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=KV&backgroundColor=06b6d4&textColor=ffffff" },
  { id: "m8", name: "Meera Joshi",     email: "meera@somaiya.edu",  role: "Member",          team: "Marketing", is_head: false, photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=MJ&backgroundColor=f97316&textColor=ffffff" },
];

// ─── Phone mockup ─────────────────────────────────────────────────────────────

function PhoneMockup({ settings, previewEvents, className }: { settings: CouncilSettings; previewEvents: { name: string; date: string; venue: string; img: string }[]; className?: string }) {
  const MOCK_EVENTS = previewEvents;

  return (
    <div className={`hidden lg:flex flex-col items-center justify-center sticky top-0 self-start h-[calc(100vh-4rem)] ${className ?? ""}`}>
      <p className="text-subtle-tx text-[11px] font-fira uppercase tracking-widest mb-5">Student App Preview</p>

      {/* Phone frame */}
      <div className="relative w-[320px] rounded-[2.5rem] border-[10px] border-zinc-800 dark:border-zinc-700 bg-zinc-800 dark:bg-zinc-700 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-800 dark:bg-zinc-700 rounded-b-2xl z-20" />

        {/* Screen */}
        <div className="bg-white dark:bg-zinc-900 rounded-[1.8rem] overflow-hidden h-[640px] overflow-y-auto scrollbar-hide">

          {/* Banner */}
          <div className="relative h-44 shrink-0">
            {settings.banner_url
              ? <img src={settings.banner_url} alt="banner" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                  <span className="text-zinc-400 text-xs font-fira">No banner</span>
                </div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Logo + socials row */}
          <div className="flex items-end justify-between px-4 -mt-10 relative z-10 mb-2">
            <div className="w-20 h-20 rounded-2xl border-2 border-white bg-white shadow-lg overflow-hidden shrink-0">
              {settings.logo_url
                ? <img src={settings.logo_url} alt="logo" className="w-full h-full object-contain p-1.5" />
                : <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-lg font-bold">{settings.name[0]}</div>
              }
            </div>
            <div className="flex items-center gap-2 pb-1">
              {settings.instagram && (
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <AtSign size={14} className="text-zinc-500" />
                </div>
              )}
              {settings.website && (
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Globe size={14} className="text-zinc-500" />
                </div>
              )}
              {settings.email && (
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Mail size={14} className="text-zinc-500" />
                </div>
              )}
              {settings.phone && (
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Phone size={14} className="text-zinc-500" />
                </div>
              )}
            </div>
          </div>

          {/* Name + tagline */}
          <div className="px-4 mb-3">
            <p className="text-zinc-900 dark:text-zinc-100 text-lg font-bold leading-tight">{settings.name || "Council Name"}</p>
            <p className="text-red-500 text-xs font-medium mt-0.5 leading-snug line-clamp-2">{settings.tagline || "Tagline goes here"}</p>
          </div>

          {/* About */}
          <div className="mx-4 mb-3 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-1.5">About</p>
            <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed line-clamp-4">{settings.description || "Description goes here…"}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mx-4 mb-3">
            {[{ label: "Total Events", value: MOCK_EVENTS.length }, { label: "Upcoming", value: MOCK_EVENTS.filter(e => e.date > new Date().toLocaleDateString("en-IN")).length || 0 }].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-center">
                <p className="text-zinc-900 dark:text-zinc-100 text-xl font-bold">{s.value}</p>
                <p className="text-zinc-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Events */}
          <div className="px-4 mb-4">
            <div className="flex gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-3">
              {["Upcoming", "Past Events"].map((t, i) => (
                <div key={t} className={`flex-1 text-center text-[10px] font-semibold py-1.5 rounded-md ${i === 0 ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-800 dark:text-zinc-100" : "text-zinc-400"}`}>{t}</div>
              ))}
            </div>
            <div className="space-y-2">
              {MOCK_EVENTS.map(ev => (
                <div key={ev.name} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/50">
                  <img src={ev.img} alt={ev.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-zinc-800 dark:text-zinc-100 text-xs font-semibold truncate">{ev.name}</p>
                    <p className="text-zinc-400 text-[11px] mt-0.5">{ev.date}</p>
                    <p className="text-zinc-400 text-[11px] truncate">{ev.venue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Home indicator */}
        <div className="flex justify-center py-2 bg-zinc-800 dark:bg-zinc-700">
          <div className="w-20 h-1 bg-zinc-600 dark:bg-zinc-500 rounded-full" />
        </div>
      </div>

      <p className="text-subtle-tx text-[10px] font-fira mt-5 text-center leading-relaxed">Live preview · updates as you type</p>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT = "bg-surface2 border border-border-c focus:border-red-500/40 rounded-xl px-4 py-2.5 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors w-full";
const LABEL = "block text-tx text-xs font-fira font-semibold uppercase tracking-wide mb-1.5";
const SELECT = INPUT + " appearance-none pr-8 cursor-pointer";

// ─── Faculty Advisor modal ────────────────────────────────────────────────────

function FacultyModal({ advisor, onSave, onClose }: {
  advisor: Partial<FacultyAdvisor> | null;
  onSave: (a: FacultyAdvisor) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name:        advisor?.name        ?? "",
    email:       advisor?.email       ?? "",
    dept:        advisor?.dept        ?? "",
    designation: advisor?.designation ?? "Faculty Advisor",
  });
  function f(k: keyof typeof form, v: string) { setForm(p => ({ ...p, [k]: v })); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border-c rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-c">
          <h2 className="text-tx font-fira font-semibold">{advisor?.id ? "Edit Faculty Advisor" : "Add Faculty Advisor"}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-surface2 hover:bg-red-500/10 text-muted-tx hover:text-red-500 flex items-center justify-center transition-all">
            <X size={15} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={LABEL}>Full Name *</label>
            <input type="text" placeholder="Prof. Full Name" value={form.name} onChange={e => f("name", e.target.value)} className={INPUT} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Designation</label>
              <input type="text" placeholder="e.g. Faculty Advisor" value={form.designation} onChange={e => f("designation", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Department</label>
              <input type="text" placeholder="e.g. Computer Engineering" value={form.dept} onChange={e => f("dept", e.target.value)} className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Email *</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
              <input type="email" placeholder="faculty@somaiya.edu" value={form.email} onChange={e => f("email", e.target.value)} className={INPUT + " pl-9"} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border-c rounded-xl text-sm font-fira text-muted-tx hover:text-tx hover:border-red-500/30 transition-all">
              Cancel
            </button>
            <button type="button" disabled={!form.name.trim() || !form.email.trim()}
              onClick={() => onSave({ id: advisor?.id ?? `fa${Date.now()}`, ...form })}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-fira font-semibold rounded-xl transition-all">
              <Save size={14} /> {advisor?.id ? "Save Changes" : "Add Advisor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Member form modal ────────────────────────────────────────────────────────

function MemberModal({ member, onSave, onClose }: {
  member: Partial<Member> | null;
  onSave: (m: Member) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Member, "id">>({
    name:      member?.name      ?? "",
    email:     member?.email     ?? "",
    role:      member?.role      ?? "Member",
    team:      member?.team      ?? "Technical",
    is_head:   member?.is_head   ?? false,
    photo_url: member?.photo_url ?? "",
  });

  function set(k: keyof typeof form, v: string | boolean) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return;
    const auto = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.name)}&backgroundColor=b61f2d&textColor=ffffff`;
    onSave({ id: member?.id ?? `m${Date.now()}`, ...form, photo_url: form.photo_url || auto });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border-c rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-c">
          <h2 className="text-tx font-fira font-semibold">{member?.id ? "Edit Member" : "Add Member"}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-surface2 hover:bg-red-500/10 text-muted-tx hover:text-red-500 flex items-center justify-center transition-all">
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Name *</label>
              <input type="text" placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Email *</label>
              <input type="email" placeholder="name@somaiya.edu" value={form.email} onChange={e => set("email", e.target.value)} className={INPUT} />
            </div>
          </div>

          {/* Role + Team */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className={LABEL}>Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value)} className={SELECT}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 bottom-3 text-subtle-tx pointer-events-none" />
            </div>
            <div className="relative">
              <label className={LABEL}>Team</label>
              <select value={form.team} onChange={e => set("team", e.target.value)} className={SELECT}>
                {TEAMS.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 bottom-3 text-subtle-tx pointer-events-none" />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className={LABEL}>Photo URL <span className="text-subtle-tx font-normal normal-case tracking-normal">(optional — auto-generated if empty)</span></label>
            <input type="url" placeholder="https://…" value={form.photo_url} onChange={e => set("photo_url", e.target.value)} className={INPUT} />
          </div>

          {/* Is head toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set("is_head", !form.is_head)}
              className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${form.is_head ? "bg-red-500" : "bg-zinc-300 dark:bg-zinc-600"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_head ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-tx text-sm font-fira">Mark as Head / Core Team</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border-c rounded-xl text-sm font-fira text-muted-tx hover:text-tx hover:border-red-500/30 transition-all">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={!form.name.trim() || !form.email.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-fira font-semibold rounded-xl transition-all">
              <Save size={14} /> {member?.id ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Member card ──────────────────────────────────────────────────────────────

const TEAM_COLOR: Record<string, string> = {
  Core:              "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  Technical:         "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  Design:            "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  Marketing:         "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  "Public Relations":"bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  Operations:        "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  Content:           "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  Finance:           "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
};

function MemberCard({ member, onEdit, onDelete }: { member: Member; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="group bg-surface border border-border-c hover:border-red-500/20 rounded-2xl p-4 flex items-center gap-3 transition-all">
      <div className="relative shrink-0">
        <img src={member.photo_url} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-border-c" />
        {member.is_head && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px]">★</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-tx text-sm font-fira font-semibold truncate">{member.name}</p>
          {member.is_head && <span className="text-[10px] font-fira text-red-500">Head</span>}
        </div>
        <p className="text-muted-tx text-xs font-fira">{member.role}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-[10px] font-fira px-2 py-0.5 rounded-full ${TEAM_COLOR[member.team] ?? "bg-surface2 text-subtle-tx"}`}>{member.team}</span>
          <span className="text-[10px] font-fira text-subtle-tx truncate hidden sm:inline">{member.email}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button type="button" onClick={onEdit}
          className="w-8 h-8 rounded-lg bg-surface2 hover:bg-surface border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx flex items-center justify-center transition-all">
          <Edit2 size={13} />
        </button>
        <button type="button" onClick={onDelete}
          className="w-8 h-8 rounded-lg bg-surface2 hover:bg-red-50 dark:hover:bg-red-500/10 border border-border-c hover:border-red-500/30 text-muted-tx hover:text-red-500 flex items-center justify-center transition-all">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "general" | "members";

export default function SettingsPage() {
  const { events } = useData();
  const [tab, setTab]             = useState<Tab>("general");
  const [settings, setSettings]   = useState<CouncilSettings>(INITIAL_SETTINGS);
  const [advisors, setAdvisors]   = useState<FacultyAdvisor[]>(INITIAL_ADVISORS);
  const [members, setMembers]     = useState<Member[]>(INITIAL_MEMBERS);
  const [modal, setModal]         = useState<Partial<Member> | null | "new">(null);
  const [advModal, setAdvModal]   = useState<Partial<FacultyAdvisor> | null | "new">(null);
  const [toast, setToast]         = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [saving, setSaving]       = useState(false);
  const logoRef   = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  // Load real council profile on mount
  useEffect(() => {
    fetchCouncilProfile().then((profile: CouncilProfile) => {
      const p = profile.profile ?? {};
      setSettings(prev => ({
        ...prev,
        name:        profile.name        ?? prev.name,
        email:       profile.email       ?? prev.email,
        logo_url:    profile.photo_url   ?? prev.logo_url,
        tagline:     p.tagline           ?? prev.tagline,
        description: p.about            ?? prev.description,
        banner_url:  p.banner_url        ?? prev.banner_url,
        instagram:   p.instagram         ?? prev.instagram,
        website:     p.website           ?? prev.website,
      }));
      if (Array.isArray(p.faculty_advisors) && p.faculty_advisors.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAdvisors((p.faculty_advisors as any[]).map((fa: any, i: number) => ({
          id:          fa.id          ?? `fa${i}`,
          name:        fa.name        ?? "",
          email:       fa.email       ?? "",
          dept:        fa.dept        ?? "",
          designation: fa.designation ?? "Faculty Advisor",
        })));
      }
      if (Array.isArray(p.members) && p.members.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMembers((p.members as any[]).map((m: any, i: number) => ({
          id:        m.id        ?? `m${i}`,
          name:      m.name      ?? "",
          email:     m.email     ?? "",
          role:      m.role      ?? "Member",
          team:      m.team      ?? "Technical",
          is_head:   m.is_head   ?? false,
          photo_url: m.photo_url ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name ?? "M")}&backgroundColor=b61f2d&textColor=ffffff`,
        })));
      }
    }).catch(() => {}); // keep defaults on failure
  }, []);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      await updateCouncilProfile({
        name:  settings.name,
        email: settings.email,
        photo_url: settings.logo_url,
        tagline:     settings.tagline,
        about:       settings.description,
        banner_url:  settings.banner_url,
        instagram:   settings.instagram,
        website:     settings.website,
        faculty_advisors: advisors,
        members,
      });
      showToast("Settings saved!");
    } catch {
      showToast("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }
  function set(k: keyof CouncilSettings, v: string) { setSettings(prev => ({ ...prev, [k]: v })); }

  const previewEvents = useMemo(() =>
    events.slice(0, 3).map(e => ({
      name:  e.name,
      date:  e.dates?.[0] ? new Date(e.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—",
      venue: e.venue ?? "—",
      img:   e.banner_url ?? "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400",
    })),
    [events]
  );

  function saveAdvisor(a: FacultyAdvisor) {
    setAdvisors(prev => prev.find(x => x.id === a.id) ? prev.map(x => x.id === a.id ? a : x) : [...prev, a]);
    setAdvModal(null);
    showToast(advisors.find(x => x.id === a.id) ? "Advisor updated!" : "Advisor added!");
  }

  function saveMember(m: Member) {
    setMembers(prev => prev.find(x => x.id === m.id) ? prev.map(x => x.id === m.id ? m : x) : [...prev, m]);
    setModal(null);
    showToast(m.id.startsWith("m") && members.find(x => x.id === m.id) ? "Member updated!" : "Member added!");
  }

  const allTeams = ["All", ...TEAMS.filter(t => members.some(m => m.team === t))];
  const heads    = members.filter(m => m.is_head);
  const filtered = members.filter(m => teamFilter === "All" || m.team === teamFilter);

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-surface border border-border-c shadow-xl rounded-xl px-4 py-3 text-tx text-sm font-fira flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-500" /> {toast}
        </div>
      )}

      {/* Faculty advisor modal */}
      {advModal !== null && (
        <FacultyModal
          advisor={advModal === "new" ? {} : advModal}
          onSave={saveAdvisor}
          onClose={() => setAdvModal(null)}
        />
      )}

      {/* Member modal */}
      {modal !== null && (
        <MemberModal
          member={modal === "new" ? {} : modal}
          onSave={saveMember}
          onClose={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-tx font-marcellus text-xl sm:text-2xl mb-1">Council Settings</h1>
        <p className="text-muted-tx text-sm font-fira">Manage your council profile, faculty advisor, and team members.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface border border-border-c rounded-xl w-fit mb-8">
        {([
          { id: "general", label: "General",     icon: <Settings size={13} /> },
          { id: "members", label: `Team (${members.length})`, icon: <Users size={13} /> },
        ] as const).map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-fira transition-all ${t.id === tab ? "bg-red-500 text-white font-semibold" : "text-muted-tx hover:text-tx"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── GENERAL TAB ── */}
      {tab === "general" && (
        <div className="flex gap-6 items-start">
        <div className="flex-shrink-0 w-full max-w-xl space-y-6">

          {/* Logo */}
          <div className="bg-surface border border-border-c rounded-2xl p-5 sm:p-6">
            <h2 className="text-tx font-fira font-semibold text-sm mb-4">Council Logo</h2>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl border-2 border-border-c bg-surface2 flex items-center justify-center overflow-hidden shrink-0">
                {settings.logo_url
                  ? <img src={settings.logo_url} alt="logo" className="w-full h-full object-contain p-2" />
                  : <span className="text-subtle-tx text-xs font-fira">No logo</span>
                }
              </div>
              <div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { set("logo_url", URL.createObjectURL(f)); showToast("Logo updated!"); }
                  }} />
                <button type="button" onClick={() => logoRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-surface2 border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-sm font-fira rounded-xl transition-all mb-2">
                  <Upload size={14} /> Upload Logo
                </button>
                <p className="text-subtle-tx text-[11px] font-fira">PNG, SVG or JPG. Recommended: 256×256px</p>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="bg-surface border border-border-c rounded-2xl p-5 sm:p-6">
            <h2 className="text-tx font-fira font-semibold text-sm mb-4">Council Banner</h2>
            <div className="relative h-32 rounded-xl overflow-hidden bg-surface2 border border-border-c mb-3">
              {settings.banner_url
                ? <img src={settings.banner_url} alt="banner" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-subtle-tx">
                    <Upload size={20} />
                    <span className="text-xs font-fira">No banner uploaded</span>
                  </div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { set("banner_url", URL.createObjectURL(f)); showToast("Banner updated!"); }
              }} />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => bannerRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-surface2 border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-sm font-fira rounded-xl transition-all">
                <Upload size={14} /> Upload Banner
              </button>
              {settings.banner_url && (
                <button type="button" onClick={() => set("banner_url", "")}
                  className="flex items-center gap-1.5 px-3 py-2 text-muted-tx hover:text-red-500 text-xs font-fira transition-colors">
                  <X size={13} /> Remove
                </button>
              )}
              <p className="text-subtle-tx text-[11px] font-fira ml-auto">Recommended: 1200×400px</p>
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-surface border border-border-c rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-tx font-fira font-semibold text-sm">Council Info</h2>
            <div>
              <label className={LABEL}>Council Name</label>
              <input type="text" value={settings.name} onChange={e => set("name", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Tagline</label>
              <input type="text" value={settings.tagline} onChange={e => set("tagline", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Description</label>
              <textarea rows={4} value={settings.description} onChange={e => set("description", e.target.value)}
                className={INPUT + " resize-none leading-relaxed"} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Official Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
                  <input type="email" value={settings.email} onChange={e => set("email", e.target.value)} className={INPUT + " pl-9"} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
                  <input type="tel" placeholder="98765 43210" value={settings.phone} onChange={e => set("phone", e.target.value)} className={INPUT + " pl-9"} />
                </div>
              </div>
            </div>
          </div>

          {/* Faculty Advisors */}
          <div className="bg-surface border border-border-c rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-tx font-fira font-semibold text-sm">Faculty Advisors</h2>
                <p className="text-subtle-tx text-[11px] font-fira mt-0.5">{advisors.length} advisor{advisors.length !== 1 ? "s" : ""} configured</p>
              </div>
              <button type="button" onClick={() => setAdvModal("new")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface2 border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
                <Plus size={13} /> Add Advisor
              </button>
            </div>
            <div className="space-y-2">
              {advisors.map(a => (
                <div key={a.id} className="group flex items-center gap-3 p-3 bg-surface2 border border-border-c hover:border-red-500/20 rounded-xl transition-all">
                  <div className="w-9 h-9 rounded-full bg-surface border border-border-c flex items-center justify-center text-muted-tx text-xs font-fira font-bold shrink-0">
                    {a.name.split(" ").filter(w => /^[A-Z]/.test(w)).slice(0,2).map(w => w[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-tx text-sm font-fira font-semibold truncate">{a.name}</p>
                    <p className="text-subtle-tx text-[11px] font-fira">{a.designation} · {a.dept}</p>
                    <a href={`mailto:${a.email}`} className="text-muted-tx text-[11px] font-fira hover:text-red-500 transition-colors flex items-center gap-1 mt-0.5">
                      <Mail size={10} /> {a.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button type="button" onClick={() => setAdvModal(a)}
                      className="w-7 h-7 rounded-lg bg-surface border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx flex items-center justify-center transition-all">
                      <Edit2 size={12} />
                    </button>
                    <button type="button" onClick={() => { setAdvisors(p => p.filter(x => x.id !== a.id)); showToast("Advisor removed."); }}
                      className="w-7 h-7 rounded-lg bg-surface border border-border-c hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500/30 text-muted-tx hover:text-red-500 flex items-center justify-center transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {advisors.length === 0 && (
                <button type="button" onClick={() => setAdvModal("new")}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border-c hover:border-red-500/40 rounded-xl text-subtle-tx hover:text-red-500 text-sm font-fira transition-all">
                  <Plus size={15} /> Add your first faculty advisor
                </button>
              )}
            </div>
          </div>

          {/* Social / Links */}
          <div className="bg-surface border border-border-c rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-tx font-fira font-semibold text-sm">Links</h2>
            {[
              { k: "instagram" as const, icon: <AtSign size={14} />, label: "Instagram", placeholder: "https://instagram.com/…" },
              { k: "linkedin"  as const, icon: <AtSign size={14} />, label: "LinkedIn",  placeholder: "https://linkedin.com/company/…" },
              { k: "website"   as const, icon: <Link2  size={14} />, label: "Website",   placeholder: "https://…" },
            ].map(({ k, icon, label, placeholder }) => (
              <div key={k}>
                <label className={LABEL}>{label}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none">{icon}</span>
                  <input type="url" placeholder={placeholder} value={settings[k]}
                    onChange={e => set(k, e.target.value)} className={INPUT + " pl-9"} />
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <button type="button" onClick={handleSaveSettings} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-fira font-semibold rounded-xl transition-colors">
            <Save size={15} /> {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>

        {/* Phone mockup — right column fills remaining space */}
        <PhoneMockup settings={settings} previewEvents={previewEvents} className="flex-1 min-w-0" />
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab === "members" && (
        <div className="space-y-8">

          {/* Heads section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-tx font-fira font-semibold">Heads & Core Team</h2>
                <p className="text-subtle-tx text-xs font-fira mt-0.5">{heads.length} members marked as heads</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {heads.map(m => (
                <MemberCard key={m.id} member={m}
                  onEdit={() => setModal(m)}
                  onDelete={() => { setMembers(prev => prev.filter(x => x.id !== m.id)); showToast("Member removed."); }}
                />
              ))}
            </div>
          </div>

          {/* All members */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-tx font-fira font-semibold">All Members</h2>
                <p className="text-subtle-tx text-xs font-fira mt-0.5">{members.length} total members</p>
              </div>
              <button type="button" onClick={() => setModal("new")}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-fira font-semibold rounded-xl transition-colors">
                <Plus size={15} /> Add Member
              </button>
            </div>

            {/* Team filter */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {allTeams.map(t => (
                <button key={t} type="button" onClick={() => setTeamFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-fira border transition-all ${teamFilter === t ? "bg-red-500 border-red-500 text-white" : "bg-surface border-border-c text-muted-tx hover:text-tx"}`}>
                  {t}
                  {t !== "All" && <span className="ml-1 text-[10px] opacity-60">({members.filter(m => m.team === t).length})</span>}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(m => (
                <MemberCard key={m.id} member={m}
                  onEdit={() => setModal(m)}
                  onDelete={() => { setMembers(prev => prev.filter(x => x.id !== m.id)); showToast("Member removed."); }}
                />
              ))}

              {/* Add button card */}
              <button type="button" onClick={() => setModal("new")}
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border-c hover:border-red-500/40 rounded-2xl p-4 min-h-[80px] text-subtle-tx hover:text-red-500 transition-all group">
                <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                  <Plus size={16} />
                </div>
                <span className="text-xs font-fira">Add Member</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
