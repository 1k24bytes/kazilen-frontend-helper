"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL, apiFetch } from "@/lib/api";

function VerifyOtpClient() {
	const router = useRouter();
	const params = useSearchParams();
	const rawPhone = params.get("phone");
	const phone = rawPhone ? rawPhone.replace(/\D/g, "") : "";
	const referralCode = params.get("ref");

	const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
	const [seconds, setSeconds] = useState(30);
	const [resendEnabled, setResendEnabled] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);
	const inputRefs = useRef([]);

	useEffect(() => {
		if (phone && typeof window !== "undefined") {
			localStorage.setItem("user_phone", phone);
		}
	}, [phone]);

	const handleBack = () => router.back();

	const handleChange = (value, index) => {
		if (!/^\d?$/.test(value)) return;

		const updated = [...otpDigits];
		updated[index] = value;
		setOtpDigits(updated);

		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (e, index) => {
		if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleVerify = async () => {
		const fullOtp = otpDigits.join("");
		const cleanPhone = phone.replace(/\D/g, "");

		if (fullOtp.length !== 6) {
			alert("Enter a valid 6-digit OTP");
			return;
		}

		try {
			setLoading(true);

			const response = await apiFetch(`${API_BASE_URL}/auth/verify-otp`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone_number: `91${cleanPhone}`,
					otp: fullOtp,
					role: "worker"
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				alert(data.detail || "Verification failed");
				return;
			}

			if (cleanPhone && typeof window !== "undefined") {
				localStorage.setItem("user_phone", cleanPhone);
			}

			if (data.status === "needs_registration") {
				const referralQuery = referralCode ? `&ref=${encodeURIComponent(referralCode)}` : "";
				router.push(`/register?phone=${encodeURIComponent(cleanPhone)}${referralQuery}`);
			} else if (data.status === "success") {
				router.push("/");
			}
		} catch (e) {
			alert(`OTP verification failed: ${e.message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleResend = async () => {
		if (!resendEnabled) return;

		try {
			setResending(true);
			const cleanPhone = phone.replace(/\D/g, "");

			const response = await apiFetch(`${API_BASE_URL}/auth/send-otp`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phone_number: `91${cleanPhone}` }),
			});

			if (!response.ok) {
				throw new Error("Failed to resend OTP");
			}

			setSeconds(30);
			setResendEnabled(false);
			setOtpDigits(["", "", "", "", "", ""]);
			inputRefs.current[0]?.focus();
		} catch (e) {
			alert(`Failed to resend OTP: ${e.message}`);
		} finally {
			setResending(false);
		}
	};

	useEffect(() => {
		if (seconds <= 0) {
			setResendEnabled(true);
			return;
		}

		const timer = setInterval(() => {
			setSeconds((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [seconds]);

	const formatTime = (sec) => {
		const min = Math.floor(sec / 60);
		const rem = sec % 60;
		return `${min.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
	};

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 font-sans">
			<div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xl space-y-6">
				
				<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
					<button
						onClick={handleBack}
						className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
					>
						<ArrowLeft size={20} />
					</button>
					<div>
						<h1 className="text-xl font-bold tracking-tight text-slate-900">Partner Security Verification</h1>
						<p className="text-xs text-slate-500">
							Sent to <span className="font-semibold text-slate-800">+91 {phone}</span>
						</p>
					</div>
				</div>

				<div className="flex justify-center gap-2 py-2">
					{otpDigits.map((digit, idx) => (
						<input
							key={idx}
							ref={(el) => (inputRefs.current[idx] = el)}
							type="text"
							inputMode="numeric"
							maxLength={1}
							value={digit}
							onChange={(e) => handleChange(e.target.value, idx)}
							onKeyDown={(e) => handleKeyDown(e, idx)}
							className="w-11 h-14 border border-slate-300 rounded-xl text-center text-lg font-bold text-slate-900 focus:outline-none focus:border-[#ff8a4c] focus:ring-2 focus:ring-[#ff8a4c]/20 transition shadow-2xs"
						/>
					))}
				</div>

				<div className="flex justify-between items-center text-xs text-slate-500 pt-1">
					<span>
						Didn't receive code?{" "}
						<button
							disabled={!resendEnabled || resending}
							onClick={handleResend}
							className={`font-semibold ${
								resendEnabled ? "text-[#ff8a4c] underline cursor-pointer hover:text-[#f07432]" : "text-slate-400 cursor-not-allowed"
							}`}
						>
							{resending ? "Resending…" : "Resend OTP"}
						</button>
					</span>

					<span className="font-mono text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
						{formatTime(seconds)}
					</span>
				</div>

				<button
					onClick={handleVerify}
					disabled={loading}
					className={`w-full font-bold py-3.5 rounded-xl text-sm shadow-md transition cursor-pointer ${
						loading ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-[#ff8a4c] hover:bg-[#f07432] text-white shadow-orange-500/20 active:scale-98"
					}`}
				>
					{loading ? "Verifying Code…" : "Verify & Open Console"}
				</button>
			</div>
		</div>
	);
}

export default function VerifyOtpPage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">Loading verification…</div>}>
			<VerifyOtpClient />
		</Suspense>
	);
}
