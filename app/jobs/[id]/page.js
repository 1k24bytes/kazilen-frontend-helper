'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Smartphone,
  Zap,
} from 'lucide-react';
import { API_BASE_URL, apiFetch } from '@/lib/api';
import CompletionReviewModal from '@/app/components/CompletionReviewModal';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span className="text-xs font-bold text-slate-800 text-right max-w-[60%]">{value || '—'}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OTP Entry Input — worker types the OTP the customer reads aloud
// ---------------------------------------------------------------------------

function OTPVerifyInput({ label, hint, onVerify, loading }) {
  const [input, setInput] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (input.length !== 6) { setErr('OTP must be 6 digits.'); return; }
    setErr('');
    const result = await onVerify(input);
    if (!result.ok) setErr(result.error || 'Invalid OTP. Try again.');
  };

  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-4 space-y-3">
      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</p>
      {hint && <p className="text-xs text-slate-500 leading-relaxed">{hint}</p>}
      <div className="flex gap-2">
        <input
          type="number"
          maxLength={6}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 6))}
          placeholder="Enter 6-digit OTP"
          className="flex-1 bg-white border border-slate-300 text-base font-mono font-bold tracking-widest text-slate-900 rounded-sm px-3 py-2.5 focus:border-[#ff8a4c] outline-none text-center"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || input.length !== 6}
          className="px-4 py-2.5 bg-[#ff8a4c] text-white text-xs font-bold rounded-sm hover:bg-[#f07432] transition disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
          Verify
        </button>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tracks whether an OTP has been dispatched to the customer
  const [startOtpReady, setStartOtpReady] = useState(false);
  const [endOtpReady, setEndOtpReady] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resendStartFlash, setResendStartFlash] = useState(false);
  const [resendEndFlash, setResendEndFlash] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(null);
  const [reviewClosed, setReviewClosed] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/bookings/${bookingId}`, {
              });
      if (res.ok) {
        const data = await res.json();
        setBooking(data);
        // Survive page refresh: if OTP already generated, jump to verify step
        if (data.start_otp && data.status === 'accepted') setStartOtpReady(true);
        if (data.end_otp && data.status === 'in_progress') setEndOtpReady(true);
        setError('');
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load job details.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (bookingId) fetchBooking(); }, [bookingId]);

  useEffect(() => {
    if (!bookingId || booking?.status !== 'completed') return;
    apiFetch(`${API_BASE_URL}/reviews/bookings/${bookingId}/status`, {
          })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => data && setReviewStatus(data))
      .catch(() => {});
  }, [bookingId, booking?.status]);

  // Generate Start OTP → customer's app shows it, worker never sees it
  const handleGenerateStartOtp = async () => {
    setError('');
    setActionLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/bookings/${bookingId}/generate-start-otp`, {
        method: 'POST',
              });
      if (res.ok) {
        setStartOtpReady(true);
        // Flash "Sent!" confirmation for 2s
        setResendStartFlash(true);
        setTimeout(() => setResendStartFlash(false), 2000);
      } else {
        const d = await res.json();
        setError(d.detail || 'Could not send OTP.');
      }
    } catch { setError('Network error.'); }
    finally { setActionLoading(false); }
  };

  // Worker enters the OTP the customer tells them → job starts
  const handleVerifyStartOtp = async (otp) => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/bookings/${bookingId}/verify-start-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const d = await res.json();
      if (res.ok) { setStartOtpReady(false); await fetchBooking(); return { ok: true }; }
      return { ok: false, error: d.detail || 'Invalid OTP.' };
    } catch { return { ok: false, error: 'Network error.' }; }
    finally { setActionLoading(false); }
  };

  // Generate End OTP → customer's app shows it, worker never sees it
  const handleGenerateEndOtp = async () => {
    setError('');
    setActionLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/bookings/${bookingId}/generate-end-otp`, {
        method: 'POST',
              });
      if (res.ok) {
        setEndOtpReady(true);
        setResendEndFlash(true);
        setTimeout(() => setResendEndFlash(false), 2000);
      } else {
        const d = await res.json();
        setError(d.detail || 'Could not send OTP.');
      }
    } catch { setError('Network error.'); }
    finally { setActionLoading(false); }
  };

  // Worker enters the OTP the customer tells them → job completed
  const handleVerifyEndOtp = async (otp) => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/bookings/${bookingId}/verify-end-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const d = await res.json();
      if (res.ok) { setEndOtpReady(false); await fetchBooking(); return { ok: true }; }
      return { ok: false, error: d.detail || 'Invalid OTP.' };
    } catch { return { ok: false, error: 'Network error.' }; }
    finally { setActionLoading(false); }
  };

  const serviceLabel = (id) =>
    (id || booking?.service_id || '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Service';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="w-8 h-8 flex items-center justify-center rounded-sm bg-slate-100 hover:bg-slate-200 transition"
        >
          <ChevronRight size={16} className="rotate-180 text-slate-600" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-slate-900">Job #{bookingId}</h1>
          <p className="text-xs text-slate-500">Manage your active job</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading job…</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {booking && (
          <>
            {/* Job Details */}
            <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-4">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Job Details</p>
              <InfoRow label="Service" value={serviceLabel(booking.service_id)} />
              {(booking.time_slot?.toUpperCase().includes('ASAP') || booking.time_slot?.toUpperCase().includes('INSTANT')) && (
                <InfoRow label="Dispatch Mode" value="Reach ASAP (Immediate Callout)" />
              )}
              <InfoRow label="Date" value={booking.date} />
              <InfoRow label="Time" value={booking.time_slot} />
              <InfoRow label="Address" value={booking.address} />
              {booking.amount && <InfoRow label="Rate" value={`₹${booking.amount}`} />}
            </div>

            {/* ----------------------------------------------------------------
                ACCEPTED → worker arrives, generates OTP in customer portal, enters it
            ---------------------------------------------------------------- */}
            {booking.status === 'accepted' && (
              <div className="space-y-3">
                <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={16} className="text-[#ff8a4c]" />
                    <p className="text-sm font-bold text-slate-900">Start Job Verification</p>
                  </div>

                  {!startOtpReady ? (
                    <>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Arrived at the customer&apos;s location? Tap below to generate the 6-digit Start OTP in the customer&apos;s Kazilen portal.
                        Ask the customer for the code from their profile, then enter it here to officially start the job.
                      </p>
                      <button
                        onClick={handleGenerateStartOtp}
                        disabled={actionLoading}
                        className="w-full py-3 bg-[#ff8a4c] hover:bg-[#f07432] text-white text-sm font-bold rounded-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Smartphone size={15} />}
                        I&apos;m at the location — Generate Start OTP in Customer Portal
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                        <Smartphone size={15} className="text-[#ff8a4c] shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Start OTP generated in the customer&apos;s portal. Ask the customer to check their Kazilen profile / booking page and share the 6-digit code.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateStartOtp}
                        disabled={actionLoading}
                        className={`w-full py-2 border text-xs font-semibold rounded-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                          resendStartFlash
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {actionLoading
                          ? <Loader2 size={12} className="animate-spin" />
                          : resendStartFlash
                          ? <CheckCircle2 size={12} className="text-emerald-600" />
                          : <Smartphone size={12} />}
                        {resendStartFlash ? 'OTP Generated in Customer Portal!' : 'Regenerate OTP in Customer Portal'}
                      </button>
                    </div>
                  )}
                </div>

                {startOtpReady && (
                  <OTPVerifyInput
                    label="Enter OTP from Customer"
                    hint="Type the 6-digit code the customer reads from their Kazilen profile to start the job."
                    onVerify={handleVerifyStartOtp}
                    loading={actionLoading}
                  />
                )}
              </div>
            )}

            {/* ----------------------------------------------------------------
                IN PROGRESS → worker finishes, generates end OTP in customer portal
            ---------------------------------------------------------------- */}
            {booking.status === 'in_progress' && (
              <div className="space-y-3">
                <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <p className="text-sm font-bold text-amber-700">Job In Progress</p>
                  </div>

                  {!endOtpReady ? (
                    <>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Finished the work? Tap below to generate the 6-digit Completion OTP in the customer&apos;s Kazilen portal.
                        Ask the customer for the code from their profile, then enter it here to close the job.
                      </p>
                      <button
                        onClick={handleGenerateEndOtp}
                        disabled={actionLoading}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Smartphone size={15} />}
                        Job Done — Generate Completion OTP in Customer Portal
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                        <Smartphone size={15} className="text-[#ff8a4c] shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Completion OTP generated in customer&apos;s portal. Ask the customer to check their Kazilen profile / booking page and share the 6-digit code.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateEndOtp}
                        disabled={actionLoading}
                        className={`w-full py-2 border text-xs font-semibold rounded-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                          resendEndFlash
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {actionLoading
                          ? <Loader2 size={12} className="animate-spin" />
                          : resendEndFlash
                          ? <CheckCircle2 size={12} className="text-emerald-600" />
                          : <Smartphone size={12} />}
                        {resendEndFlash ? 'OTP Generated in Customer Portal!' : 'Regenerate Completion OTP'}
                      </button>
                    </div>
                  )}
                </div>

                {endOtpReady && (
                  <OTPVerifyInput
                    label="Enter Completion OTP from Customer"
                    hint="Type the 6-digit code the customer reads from their Kazilen profile to complete the job."
                    onVerify={handleVerifyEndOtp}
                    loading={actionLoading}
                  />
                )}
              </div>
            )}

            {/* ----------------------------------------------------------------
                COMPLETED
            ---------------------------------------------------------------- */}
            {booking.status === 'completed' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-5 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">Job Completed!</p>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    This job has been completed successfully. Collect payment offline from the customer.
                    Thank you for your service!
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 transition"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

            {booking.status === 'completed' && reviewStatus && !reviewClosed &&
              !reviewStatus.participant_review_submitted && (
                <CompletionReviewModal
                  bookingId={bookingId}
                  onComplete={() => setReviewClosed(true)}
                />
              )}
          </>
        )}

      </div>
    </div>
  );
}
