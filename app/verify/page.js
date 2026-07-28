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
		<div className="min-h-screen bg-white px-6 py-4">
			<button onClick={handleBack} className="mb-4 text-black">
				<ArrowLeft size={28} />
			</button>

			<h1 className="text-2xl font-bold mb-1 text-black">Verify OTP</h1>

			<p className="text-sm text-gray-700 mb-6">
				{phone ? (
					<>
						We sent an OTP to <span className="font-semibold text-black">{phone}</span>.
					</>
				) : (
					"An OTP has been sent to your mobile."
				)}{" "}
				To resend OTP, please wait for {formatTime(seconds)}.
			</p>

			<div className="flex justify-between gap-2 mb-6">
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
						className="w-12 h-12 border border-black rounded-md text-center text-lg font-semibold text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
					/>
				))}
			</div>

			<div className="flex justify-between items-center text-sm mt-2">
				<span className="text-gray-700">
					Did not get OTP?{" "}
					<button
						disabled={!resendEnabled || resending}
						onClick={handleResend}
						className={`font-medium ${resendEnabled ? "text-blue-600 underline" : "text-gray-400 cursor-not-allowed"
							}`}
					>
						{resending ? "Resending…" : "Resend"}
					</button>
				</span>

				<span className="font-mono text-black">{formatTime(seconds)}</span>
			</div>

			<button
				onClick={handleVerify}
				disabled={loading}
				className={`w-full mt-6 bg-yellow-400 text-black font-semibold py-3 rounded-xl ${loading ? "opacity-70 cursor-not-allowed bg-gray-200" : "hover:bg-yellow-500"
					}`}
			>
				{loading ? "Verifying…" : "Verify"}
			</button>
		</div>
	);
}

export default function VerifyOtpPage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-black">Loading...</div>}>
			<VerifyOtpClient />
		</Suspense>
	);
}
