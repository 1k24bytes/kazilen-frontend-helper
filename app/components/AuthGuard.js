"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { API_BASE_URL, apiFetch } from "@/lib/api";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch(`${API_BASE_URL}/users/me`).then((res) => {
      if (!active) return;
      if (res.ok) {
        setAuthorized(true);
      } else {
        router.replace("/login");
      }
    }).catch(() => {
      if (active) router.replace("/login");
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-4 py-3 rounded-md border border-slate-200 shadow-2xs">
          <Loader2 className="w-4 h-4 animate-spin text-[#ff8a4c]" />
          Checking authorization…
        </div>
      </div>
    );
  }

  return children;
}
