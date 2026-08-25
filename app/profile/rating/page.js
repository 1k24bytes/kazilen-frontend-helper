"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Edit3,
  Loader2,
  Star,
  ShieldCheck,
  UserCheck,
  Clock,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";

import { API_BASE_URL, apiFetch } from "@/lib/api";
import servicesConfig from "@/app/data/services.json";
import BackHeader from "@/app/profile/components/BackHeader";
import BottomNav from "@/app/components/BottomNav";

function getServiceLabel(serviceId) {
  const service = servicesConfig.subCategories?.find((item) => item.id === serviceId);
  return (
    service?.label ||
    serviceId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Professional Service"
  );
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

function RatingStars({ rating, interactive = false, onSelect }) {
  return (
    <div
      className="flex items-center gap-1"
      role={interactive ? "radiogroup" : undefined}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => onSelect(value) : undefined}
          disabled={!interactive}
          aria-label={`${value} star${value === 1 ? "" : "s"}`}
          aria-pressed={interactive ? rating === value : undefined}
          className={`rounded-sm p-0.5 ${
            interactive ? "hover:bg-amber-50 cursor-pointer" : "cursor-default"
          } ${rating >= value ? "text-amber-500" : "text-slate-300"}`}
        >
          <Star size={interactive ? 20 : 15} fill="currentColor" />
        </button>
      ))}
    </div>
  );
}

function ReceivedReviewCard({ item }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 truncate">
              {item.reviewer_name || "Verified Customer"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-sm border border-emerald-200">
              <UserCheck size={11} /> Verified Customer
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <Clock size={11} className="shrink-0" />
            {getServiceLabel(item.service_id)} · Booking #{item.booking_id}
          </p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-sm bg-amber-50 border border-amber-200 shrink-0">
          <Star size={13} className="text-amber-500" fill="currentColor" />
          <span className="text-xs font-bold text-amber-800">{item.rating}.0</span>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-700">
        {item.description}
      </p>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span>Completed Service Review</span>
        <span>Submitted {formatDate(item.created_at)}</span>
      </div>
    </article>
  );
}

function SubmittedReviewCard({ item, now, onEdit }) {
  const canEdit = item.editable && now > 0 && new Date(item.editable_until).getTime() > now;

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">
            Review for {item.reviewee_name}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {getServiceLabel(item.service_id)} · Booking #{item.booking_id}
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 cursor-pointer"
          >
            <Edit3 size={13} />
            Edit
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <RatingStars rating={item.rating} />
        {!canEdit && <span className="text-[10px] font-semibold text-slate-400">Editing closed</span>}
      </div>

      <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-700">
        {item.description}
      </p>
      <p className="text-[10px] text-slate-400">Submitted {formatDate(item.created_at)}</p>
    </article>
  );
}

function EditReviewModal({ item, onClose, onSaved }) {
  const [rating, setRating] = useState(item.rating);
  const [description, setDescription] = useState(item.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a description.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await apiFetch(`${API_BASE_URL}/reviews/participant/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, description: description.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || "Could not update the review.");
        return;
      }
      onSaved({ ...item, rating, description: description.trim(), created_at: data.created_at });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-5 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Edit within 15 minutes</p>
        <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900">
          Edit review for {item.reviewee_name}
        </h2>

        <div className="mt-4 flex justify-center">
          <RatingStars rating={rating} interactive onSelect={setRating} />
        </div>

        <label htmlFor="edit-review-description" className="mt-4 block text-xs font-bold text-slate-700">
          Description
        </label>
        <textarea
          id="edit-review-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          rows={4}
          className="mt-2 w-full resize-none rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#ff8a4c]"
        />
        {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-sm border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#ff8a4c] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#f07432] disabled:opacity-50 cursor-pointer"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkerRatingPage() {
  const router = useRouter();
  const [data, setData] = useState({
    reviews: [],
    received_reviews: [],
    average_rating: null,
    total_reviews_count: 0,
  });
  const [activeTab, setActiveTab] = useState("received"); // 'received' | 'submitted'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const initialClock = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      clearTimeout(initialClock);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/reviews/my`, {
                  });
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        const resData = await response.json();
        if (!response.ok) {
          setError(resData.detail || "Could not load reviews.");
          return;
        }
        setData({
          reviews: resData.reviews || [],
          received_reviews: resData.received_reviews || [],
          average_rating: resData.average_rating,
          total_reviews_count: resData.total_reviews_count || (resData.received_reviews?.length || 0),
        });
      } catch {
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [router]);

  const saveEditedReview = (updated) => {
    setData((current) => ({
      ...current,
      reviews: current.reviews.map((item) => (item.id === updated.id ? updated : item)),
    }));
    setEditing(null);
  };

  const receivedList = data.received_reviews || [];
  const submittedList = data.reviews || [];

  // Calculate star breakdown from received reviews
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  receivedList.forEach((r) => {
    if (r.rating && starCounts[r.rating] !== undefined) {
      starCounts[r.rating] += 1;
    }
  });
  const totalCount = receivedList.length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <BackHeader title="Customer Ratings & Reviews" />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        
        {/* Rating Overview Scorecard */}
        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Overall Score */}
            <div className="md:col-span-5 text-center md:text-left md:border-r md:border-slate-100 md:pr-6 space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-sm border border-emerald-200">
                <ShieldCheck size={12} /> Verified Rating
              </span>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {data.average_rating ? data.average_rating.toFixed(1) : "—"}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
              </div>
              <div className="flex justify-center md:justify-start">
                <RatingStars rating={Math.round(data.average_rating || 0)} />
              </div>
              <p className="text-xs text-slate-500">
                {totalCount > 0
                  ? `Based on ${totalCount} customer review${totalCount > 1 ? "s" : ""}`
                  : "No customer reviews yet"}
              </p>
            </div>

            {/* Right: Star Distribution */}
            <div className="md:col-span-7 space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = starCounts[stars] || 0;
                const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-8 text-slate-600 font-semibold flex items-center gap-1">
                      {stars} <Star size={11} className="text-amber-500 fill-current" />
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-sm overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-amber-500 rounded-sm transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-[11px] text-slate-400 font-medium">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* Tab Toggle */}
        <div className="flex rounded-sm bg-slate-200/80 p-1 border border-slate-200 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("received")}
            className={`flex-1 py-2 text-xs font-bold rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "received"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ThumbsUp size={13} className={activeTab === "received" ? "text-[#ff8a4c]" : "text-slate-400"} />
            <span>Customer Feedback ({receivedList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("submitted")}
            className={`flex-1 py-2 text-xs font-bold rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "submitted"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare size={13} className={activeTab === "submitted" ? "text-[#ff8a4c]" : "text-slate-400"} />
            <span>Reviews You Wrote ({submittedList.length})</span>
          </button>
        </div>

        {/* Feedback List Body */}
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              Loading customer reviews…
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {!loading && !error && activeTab === "received" && (
            <>
              {receivedList.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-2xs space-y-2">
                  <Star size={24} className="mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-900">No customer reviews yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Complete service bookings and provide exceptional service to receive positive ratings and reviews from customers.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedList.map((item) => (
                    <ReceivedReviewCard key={`received-${item.id}`} item={item} />
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !error && activeTab === "submitted" && (
            <>
              {submittedList.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-2xs space-y-2">
                  <MessageSquare size={24} className="mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-900">No submitted reviews</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Reviews you submit for customers after completed jobs will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submittedList.map((item) => (
                    <SubmittedReviewCard
                      key={`submitted-${item.id}`}
                      item={item}
                      now={now}
                      onEdit={(review) => setEditing({ item: review })}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {editing && (
        <EditReviewModal
          item={editing.item}
          onClose={() => setEditing(null)}
          onSaved={saveEditedReview}
        />
      )}

      <BottomNav />
    </div>
  );
}
