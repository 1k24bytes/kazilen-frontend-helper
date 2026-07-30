"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { ArrowLeft } from "lucide-react";

function VerifyOtpClient() {
	const router = useRouter();
	const params = useSearchParams();
	const phone = params.get("phone");

	const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
	const [seconds, setSeconds] = useState(30);
	const [resendEnabled, setResendEnabled] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);
	const inputRefs = useRef([]);

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

		if (fullOtp.length !== 6) {
			alert("Enter a valid 6-digit OTP");
			return;
		}

		try {
			setLoading(true);

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone_number: `91${phone}`,
					otp: fullOtp,
					role: "worker"
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				alert(data.detail || "Verification failed");
				return;
			}

			if (data.status === "needs_registration") {
				router.push(`/register?phone=${encodeURIComponent(phone || "")}`);
			} else if (data.status === "success" && data.access_token) {
				localStorage.setItem("access_token", data.access_token);
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

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-otp`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phone_number: `91${phone}` }),
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
		<div className="min-h-screen bg-zinc-50/50 flex flex-col justify-center items-center px-4 py-8">
			<div className="w-full max-w-sm bg-white rounded-lg border border-zinc-200/80 p-6 shadow-2xs space-y-5">
				<div className="flex items-center gap-2">
					<button
						onClick={handleBack}
						className="w-8 h-8 rounded-md hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition cursor-pointer"
					>
						<ArrowLeft size={18} />
					</button>
					<div>
						<h1 className="text-lg font-bold tracking-tight text-zinc-900">Partner Verification</h1>
						<p className="text-xs text-zinc-500">
							Sent to <span className="font-medium text-zinc-800">+91 {phone}</span>
						</p>
					</div>
				</div>

				<div className="flex justify-between gap-1.5 py-2">
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
							className="w-10 h-12 border border-zinc-300 rounded-md text-center text-base font-semibold text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
						/>
					))}
				</div>

				<div className="flex justify-between items-center text-xs text-zinc-500 pt-1">
					<span>
						Didn't receive code?{" "}
						<button
							disabled={!resendEnabled || resending}
							onClick={handleResend}
							className={`font-semibold ${
								resendEnabled ? "text-zinc-900 underline cursor-pointer" : "text-zinc-400 cursor-not-allowed"
							}`}
						>
							{resending ? "Sending…" : "Resend"}
						</button>
					</span>

					<span className="font-mono text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
						{formatTime(seconds)}
					</span>
				</div>

				<button
					onClick={handleVerify}
					disabled={loading}
					className={`w-full text-white font-medium py-2.5 rounded-md text-sm shadow-xs transition cursor-pointer ${
						loading ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" : "bg-zinc-900 hover:bg-zinc-800"
					}`}
				>
					{loading ? "Verifying Code…" : "Verify & Sign In"}
				</button>
			</div>
		</div>
	);
}

export default function VerifyOtpPage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500 text-sm">Loading verification…</div>}>
			<VerifyOtpClient />
		</Suspense>
	);
}
