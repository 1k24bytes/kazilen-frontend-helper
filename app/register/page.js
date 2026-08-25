"use client";

import { useState, Suspense } from "react";
import { ArrowLeft, User, Calendar, Users, CheckCircle2, Gift } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL, apiFetch } from "@/lib/api";

function CreateAccountClient() {
  const router = useRouter();
  const params = useSearchParams();
  const phoneFromQuery = params.get("phone");
  const referralCodeFromQuery = params.get("ref") || "";

  const [phoneNo] = useState(phoneFromQuery || "");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [referralCode, setReferralCode] = useState(referralCodeFromQuery.toUpperCase().slice(0, 6));
  const [touched, setTouched] = useState({ name: false });
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length > 0 && /^\d{10}$/.test(phoneNo);

  const handleCreateAccount = async () => {
    if (!canSubmit) {
      setTouched({ name: true });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        phone_number: `91${phoneNo}`,
        full_name: name.trim(),
        role: "worker",
        dob: dob || null,
        gender: gender || null,
        referral_code: referralCode.trim() || null,
      };

      const response = await apiFetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Registration failed");
        return;
      }

      if (data.status === "success") {
        alert("Worker account created successfully!");
        router.replace("/");
      }
    } catch (err) {
      alert(`Create failed: ${err?.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Partner Account Setup</h1>
            <p className="text-xs text-slate-500">Provide your personal details for worker registration</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Verified Partner Mobile
            </label>
            <div className="flex items-center bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2.5 cursor-not-allowed">
              <span className="text-slate-500 text-sm font-semibold mr-2">+91</span>
              <input
                type="tel"
                value={phoneNo}
                readOnly
                className="w-full bg-transparent text-slate-700 text-sm font-semibold focus:outline-none cursor-not-allowed"
              />
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="e.g. Ramesh Verma"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-medium text-slate-900 focus:outline-none transition ${
                  touched.name && !name.trim()
                    ? "border-red-400 focus:ring-1 focus:ring-red-400"
                    : "border-slate-300 focus:border-[#ff8a4c] focus:ring-1 focus:ring-[#ff8a4c]"
                }`}
              />
            </div>
            {touched.name && !name.trim() && (
              <p className="text-xs text-red-500 mt-1 font-medium">Full name is required</p>
            )}
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c] focus:ring-1 focus:ring-[#ff8a4c] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Gender
              </label>
              <div className="relative">
                <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c] focus:ring-1 focus:ring-[#ff8a4c] transition bg-white appearance-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Referral Code <span className="text-slate-400 normal-case tracking-normal font-medium">(optional)</span>
            </label>
            <div className="relative">
              <Gift size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase())}
                placeholder="e.g. A1B2C3"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold tracking-wider text-slate-900 uppercase focus:outline-none focus:border-[#ff8a4c] focus:ring-1 focus:ring-[#ff8a4c] transition placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Use a partner&apos;s code to support their referral points.</p>
          </div>

          <button
            onClick={handleCreateAccount}
            disabled={!canSubmit || loading}
            className={`w-full font-bold py-3 rounded-xl text-sm shadow-xs transition cursor-pointer ${
              !canSubmit || loading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-[#ff8a4c] hover:bg-[#f07432] text-white"
            }`}
          >
            {loading ? "Registering Profile..." : "Register Partner Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">Loading registration…</div>}>
      <CreateAccountClient />
    </Suspense>
  );
}
