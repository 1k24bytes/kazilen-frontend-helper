"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, apiFetch } from "@/lib/api";
import TermsOfCondition from "./TermsOfCondition";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
	const router = useRouter();
	const [phone, setPhone] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [acceptedTerms, setAcceptedTerms] = useState(true);

	const handleContinue = async () => {
		if (!acceptedTerms) {
			alert("Please accept Terms of Condition");
			return;
		}

		if (!/^\d{10}$/.test(phone)) {
			alert("Please enter a valid 10-digit mobile number");
			return;
		}

		if (typeof window !== "undefined") {
			localStorage.setItem("user_phone", phone);
		}

		try {
			setLoading(true);

			const response = await apiFetch(`${API_BASE_URL}/auth/send-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ phone_number: `91${phone}` }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				alert(`Failed to send OTP: ${errorData.detail || "Server error"}`);
				return;
			}

			const referralCode = typeof window !== "undefined"
				? new URLSearchParams(window.location.search).get("ref")
				: null;
			const referralQuery = referralCode ? `&ref=${encodeURIComponent(referralCode)}` : "";
			router.push(`/verify?phone=${encodeURIComponent(phone)}${referralQuery}`);
		} catch (e) {
			alert(`Failed to check phone: ${e?.message ?? e}`);
		} finally {
			setLoading(false);
		}
	};

	const handlePhoneInput = (e) => {
		const digitsOnly = e.target.value.replace(/\D/g, "");
		if (digitsOnly.length <= 10) setPhone(digitsOnly);
	};

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 font-sans">
			<div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xl space-y-6">
				
				<div className="text-center space-y-2">
					<div className="w-12 h-12 rounded-2xl bg-[#ff8a4c] flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md shadow-orange-500/20">
						K
					</div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
						Kazilen Partner Console
					</h1>
					<p className="text-xs sm:text-sm text-slate-500">
						Sign in to accept customer dispatches & track daily earnings
					</p>
				</div>

				<div className="space-y-4 pt-2">
					<div>
						<label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
							Partner Registered Mobile
						</label>

						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
								+91
							</span>
							<input
								type="tel"
								inputMode="numeric"
								pattern="\d*"
								placeholder="9876543210"
								value={phone}
								onChange={handlePhoneInput}
								className="w-full pl-14 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-[#ff8a4c] focus:ring-2 focus:ring-[#ff8a4c]/20 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition"
							/>
						</div>
					</div>

					<button
						onClick={handleContinue}
						disabled={loading || phone.length !== 10}
						className={`w-full font-bold py-3.5 rounded-xl text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${
							loading || phone.length !== 10
								? "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
								: "bg-[#ff8a4c] hover:bg-[#f07432] text-white shadow-orange-500/20 active:scale-98"
						}`}
					>
						<span>{loading ? "Sending OTP…" : "Continue as Partner"}</span>
						{!loading && <ArrowRight size={16} />}
					</button>
				</div>

				<div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
					<ShieldCheck size={18} className="text-[#ff8a4c] shrink-0" />
					<span>Instant SMS OTP verification for registered service partners.</span>
				</div>

				<div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
					<input
						type="checkbox"
						id="terms"
						checked={acceptedTerms}
						onChange={(e) => setAcceptedTerms(e.target.checked)}
						className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#ff8a4c] focus:ring-[#ff8a4c] cursor-pointer accent-[#ff8a4c]"
					/>

					<label
						htmlFor="terms"
						className="text-xs text-slate-500 leading-relaxed"
					>
						I agree to the Partner{" "}
						<button
							type="button"
							onClick={() => setShowModal(true)}
							className="text-[#ff8a4c] underline font-semibold hover:text-[#f07432] cursor-pointer"
						>
							Terms of Conditions.
						</button>
					</label>
				</div>
			</div>

			<TermsOfCondition open={showModal} onClose={() => setShowModal(false)} />
		</div>
	);
}
