"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TermsOfCondition from "./TermsOfCondition";

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

		try {
			setLoading(true);

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-otp`, {
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

			router.push(`/verify?phone=${encodeURIComponent(phone)}`);
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
		<div className="min-h-screen bg-zinc-50/50 flex flex-col justify-center items-center px-4 py-8">
			<div className="w-full max-w-sm bg-white rounded-lg border border-zinc-200/80 p-6 shadow-2xs space-y-5">
				<div className="text-center space-y-1">
					<h1 className="text-2xl font-bold tracking-tight text-zinc-900">Kazilen Partner</h1>
					<p className="text-xs text-zinc-500">Sign in to manage jobs and track daily earnings</p>
				</div>

				<div className="space-y-4 pt-2">
					<div>
						<label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
							Mobile Number
						</label>

						<div className="relative">
							<span className="absolute left-3 top-2.5 text-sm font-medium text-zinc-400">
								+91
							</span>
							<input
								type="tel"
								inputMode="numeric"
								pattern="\d*"
								placeholder="9876543210"
								value={phone}
								onChange={handlePhoneInput}
								className="w-full pl-12 pr-4 py-2.5 border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-sm text-zinc-900 placeholder:text-zinc-400 transition"
							/>
						</div>
					</div>

					<button
						onClick={handleContinue}
						disabled={loading || phone.length !== 10}
						className={`w-full text-white font-medium py-2.5 rounded-md text-sm shadow-xs transition cursor-pointer ${
							loading || phone.length !== 10
								? "cursor-not-allowed bg-zinc-200 text-zinc-400"
								: "bg-zinc-900 hover:bg-zinc-800"
						}`}
					>
						{loading ? "Sending OTP…" : "Continue as Partner"}
					</button>
				</div>

				{/* Terms checkbox */}
				<div className="flex items-start gap-2 pt-2 border-t border-zinc-100">
					<input
						type="checkbox"
						id="terms"
						checked={acceptedTerms}
						onChange={(e) => setAcceptedTerms(e.target.checked)}
						className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer accent-zinc-900"
					/>

					<label
						htmlFor="terms"
						className="text-[11px] text-zinc-500 leading-snug"
					>
						I agree to the Partner{" "}
						<button
							type="button"
							onClick={() => setShowModal(true)}
							className="text-zinc-900 underline font-medium hover:text-black cursor-pointer"
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
