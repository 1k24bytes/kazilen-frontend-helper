"use client";

import { useState } from "react";
import { Loader2, Star, X } from "lucide-react";
import { API_BASE_URL, apiFetch } from "@/lib/api";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

export default function CompletionReviewModal({ bookingId, onComplete }) {
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submitReview = async () => {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a short description.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await apiFetch(`${API_BASE_URL}/reviews/bookings/${bookingId}/participant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, description: description.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || "Could not save your review.");
        return;
      }
      onComplete();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-sm border border-amber-200">
              Customer Feedback
            </span>
            <h2 className="mt-2 text-base font-bold tracking-tight text-slate-900">
              Rate your customer
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              How was your service experience with this customer?
            </p>
          </div>
          <button
            type="button"
            onClick={onComplete}
            aria-label="Close review"
            className="rounded-sm p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 flex justify-center gap-2" role="radiogroup" aria-label="Rating">
          {RATING_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              aria-pressed={rating === value}
              className={`rounded-sm border p-2 transition-colors cursor-pointer ${
                rating >= value
                  ? "border-amber-200 bg-amber-50 text-amber-600"
                  : "border-slate-200 bg-white text-slate-300 hover:border-slate-300"
              }`}
            >
              <Star size={20} fill="currentColor" />
            </button>
          ))}
        </div>

        <label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="review-description">
          Review details
        </label>
        <textarea
          id="review-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Write a short review about customer cooperation and site experience..."
          className="mt-2 w-full resize-none rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#ff8a4c]"
        />
        {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

        <button
          type="button"
          onClick={submitReview}
          disabled={saving}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-[#ff8a4c] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#f07432] disabled:opacity-50 cursor-pointer"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          <span>Submit Review</span>
        </button>
      </div>
    </div>
  );
}
