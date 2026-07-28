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
        role: "worker", // role is worker
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
    <div className="min-h-screen px-6 py-8 flex flex-col items-center">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="hover:opacity-70 transition-opacity">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tight">Worker Profile</h1>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold uppercase tracking-wider mb-2">
            Phone Number
          </label>
          <div className="flex items-center border-2 border-gray-300 px-4 py-3 cursor-not-allowed opacity-70">
            <span className="font-black mr-3">+91</span>
            <input
              type="tel"
              value={phoneNo}
              readOnly
              className="w-full bg-transparent font-bold focus:outline-none cursor-not-allowed"
            />
          </div>
          {!/^\d{10}$/.test(phoneNo) && (
            <p className="text-xs font-bold mt-2 uppercase">
              Phone number missing. Go back.
            </p>
          )}
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold uppercase tracking-wider mb-2">
            Full Name *
          </label>
          <div className={`border-2 px-4 py-3 transition-colors ${
            touched.name && !name.trim() ? "border-red-500" : "border-foreground"
          }`}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="YOUR FULL NAME"
              className="w-full bg-transparent font-bold text-lg focus:outline-none placeholder-gray-400"
            />
          </div>
          {touched.name && !name.trim() && (
            <p className="text-xs text-red-500 font-bold mt-2 uppercase">Name is required</p>
          )}
        </div>

        <button
          onClick={handleCreateAccount}
          disabled={!canSubmit || loading}
          className={`w-full font-bold py-4 uppercase tracking-wider transition-all border-2 border-transparent ${
            !canSubmit || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
              : "bg-foreground text-background hover:bg-background hover:text-foreground hover:border-foreground"
          }`}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold uppercase">Loading...</div>}>
      <CreateAccountClient />
    </Suspense>
  );
}
