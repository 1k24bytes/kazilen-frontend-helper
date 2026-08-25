'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, ChevronRight, CheckCircle2, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, apiFetch } from '@/lib/api';

const STATUS_CONFIG = {
  pending:     { label: 'Awaiting Action',  className: 'bg-slate-100 text-slate-600 border-slate-200' },
  accepted:    { label: 'Accepted',          className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'In Progress',       className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed:   { label: 'Completed',          className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-sm border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default function LiveDispatchFeed() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(null); // booking id being accepted

  // Fetch bookings — called on mount and on an interval
  const fetchBookings = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/bookings/worker/pending`, {
              });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setError('');
      } else if (res.status === 401) {
        // Token expired — let the parent page handle redirect
      } else {
        setError('Could not load bookings.');
      }
    } catch {
      setError('Network error loading bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => fetchBookings(), 5000);
    return () => clearInterval(interval);
  }, []);

  // Accept a pending booking
  const handleAccept = async (bookingId) => {
    setAccepting(bookingId);
    try {
      const res = await apiFetch(`${API_BASE_URL}/bookings/${bookingId}/accept`, {
        method: 'POST',
              });
      const data = await res.json();
      if (res.ok && data.status === 'accepted') {
        // Navigate to the job detail page to manage OTPs
        router.push(`/jobs/${bookingId}`);
      } else {
        alert(data.detail || 'Could not accept booking.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setAccepting(null);
    }
  };

  const serviceLabel = (id) =>
    id?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Service';

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const activeBookings = bookings.filter((b) => ['accepted', 'in_progress'].includes(b.status));

  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-2xs">

      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Live Job Requests</h3>
        <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      <div className="p-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs">Checking for jobs…</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 p-3 rounded-sm bg-red-50 border border-red-200 text-red-600 text-xs">
            <AlertCircle size={13} />
            {error}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Active jobs (accepted / in_progress) — shown at top              */}
        {/* ---------------------------------------------------------------- */}
        {activeBookings.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Jobs</p>
            {activeBookings.map((b) => (
              <div key={b.id} className="border border-emerald-200 bg-emerald-50/30 rounded-sm p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-900 truncate">{serviceLabel(b.service_id)}</p>
                      <StatusBadge status={b.status} />
                      {(b.time_slot?.toUpperCase().includes('ASAP') || b.time_slot?.toUpperCase().includes('INSTANT')) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-sm">
                          <Zap size={10} className="fill-amber-600 text-amber-700" /> Reach ASAP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={11} className="shrink-0" /> {b.date} · {b.time_slot}
                    </p>
                    {b.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <MapPin size={11} className="shrink-0" /> {b.address}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/jobs/${b.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-[#ff8a4c] text-white text-xs font-bold hover:bg-[#f07432] transition shrink-0"
                  >
                    Manage <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Pending jobs — new bookings to accept or decline                 */}
        {/* ---------------------------------------------------------------- */}
        {!loading && pendingBookings.length === 0 && activeBookings.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center">
            No pending bookings right now. Check back soon.
          </p>
        )}

        {pendingBookings.length > 0 && (
          <div className="space-y-2">
            {activeBookings.length > 0 && (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Requests</p>
            )}
            {pendingBookings.map((b) => (
              <div key={b.id} className="border border-slate-200 rounded-sm p-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-sm bg-slate-100 flex-shrink-0 flex items-center justify-center">
                    <MapPin size={16} className="text-slate-400" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 truncate">{serviceLabel(b.service_id)}</p>
                      {(b.time_slot?.toUpperCase().includes('ASAP') || b.time_slot?.toUpperCase().includes('INSTANT')) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-sm">
                          <Zap size={10} className="fill-amber-600 text-amber-700" /> Reach ASAP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={11} className="shrink-0" /> {b.date} · {b.time_slot}
                    </p>
                    {b.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <MapPin size={11} className="shrink-0" /> {b.address}
                      </p>
                    )}
                    {b.amount && (
                      <p className="text-xs font-bold text-slate-900">₹{b.amount}</p>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(b.id)}
                        disabled={accepting === b.id}
                        className="flex-1 py-2 text-xs font-bold bg-[#ff8a4c] text-white rounded-sm hover:bg-[#f07432] transition disabled:opacity-60 flex items-center justify-center gap-1"
                      >
                        {accepting === b.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        Accept Job
                      </button>
                      <button
                        onClick={() => setBookings((prev) => prev.filter((bb) => bb.id !== b.id))}
                        className="flex-1 py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-sm hover:bg-slate-200 transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
