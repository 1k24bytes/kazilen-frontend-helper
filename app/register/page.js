"use client";

import { useState, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function CreateAccountClient() {
  const router = useRouter();
  const params = useSearchParams();
  const phoneFromQuery = params.get("phone");

  const [phoneNo] = useState(phoneFromQuery || "");
  const [name, setName] = useState("");
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
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Registration failed");
        return;
      }

      if (data.status === "success" && data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        alert("Worker account created!");
        router.replace("/");
      }
    } catch (err) {
      alert(`Create failed: ${err?.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-lg border border-zinc-200/80 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-md hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">Partner Profile</h1>
            <p className="text-xs text-zinc-500">Provide your full name for worker registration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-md px-3 py-2.5 cursor-not-allowed">
              <span className="text-zinc-500 text-xs font-medium mr-1.5">+91</span>
              <input
                type="tel"
                value={phoneNo}
                readOnly
                className="w-full bg-transparent text-zinc-600 text-sm font-medium focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="e.g. Ramesh Verma"
              className={`w-full px-3 py-2.5 border rounded-md text-sm text-zinc-900 focus:outline-none transition ${
                touched.name && !name.trim()
                  ? "border-red-400 focus:ring-1 focus:ring-red-400"
                  : "border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              }`}
            />
            {touched.name && !name.trim() && (
              <p className="text-xs text-red-500 mt-1 font-medium">Full name is required</p>
            )}
          </div>

          <button
            onClick={handleCreateAccount}
            disabled={!canSubmit || loading}
            className={`w-full text-white font-medium py-2.5 rounded-md text-sm shadow-xs transition cursor-pointer ${
              !canSubmit || loading
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            {loading ? "Creating Profile…" : "Register Partner Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500 text-sm">Loading registration…</div>}>
      <CreateAccountClient />
    </Suspense>
  );
}
