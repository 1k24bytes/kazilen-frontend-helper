"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Wrench,
  ChevronRight,
  ShieldCheck,
  Zap,
  User,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { API_BASE_URL, apiFetch } from "@/lib/api";
import Header from "./components/Header";
import MyProgress from "./components/MyProgress";
import OrderPlanCard from "./components/OrderPlanCard";
import PlansCard from "./components/PlansCard";
import LiveDispatchFeed from "./components/LiveDispatchFeed";
import BottomNav from "./components/BottomNav";
import plansConfig from "./data/plans.json";
import AuthGuard from "./components/AuthGuard";

export default function WorkerDashboard() {
  return (
    <AuthGuard>
      <WorkerDashboardContent />
    </AuthGuard>
  );
}

function WorkerDashboardContent() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const defaultPlan = plansConfig.defaultPlan;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("isOnline");
      if (saved !== null) setIsOnline(saved === "true");

      const handleStatusChange = (e) => {
        if (e.detail && e.detail.is_online !== undefined) {
          setIsOnline(Boolean(e.detail.is_online));
        }
      };
      window.addEventListener("worker_online_status_changed", handleStatusChange);
      return () => window.removeEventListener("worker_online_status_changed", handleStatusChange);
    }
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/workers/dashboard`, {
                  });

        if (response.ok) {
          const json = await response.json();
          setData(json);
        } else {
          setData(getEmptyState());
        }
      } catch {
        setData(getEmptyState());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const getEmptyState = () => ({
    progress: {
      today: { earnings: 0, hours: "0:00 hrs", orders: 0 },
      week: { earnings: 0, hours: "0:00 hrs", orders: 0 },
    },
    rating: null,
    reviews_count: 0,
    recent_reviews: [],
    active_services_count: 0,
    plan: {
      completed: 0,
      totalLabel: String(defaultPlan.totalJobs),
      price: defaultPlan.price,
      timeLeft: defaultPlan.timeLeft,
    },
    recharge: {
      price: defaultPlan.price,
      validityDays: defaultPlan.validityDays,
      orderType: defaultPlan.orderType,
    },
  });

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-slate-500 text-sm font-medium">
        <div className="w-6 h-6 border-2 border-[#ff8a4c] border-t-transparent rounded-full animate-spin mb-3" />
        Loading Partner Console…
      </div>
    );
  }

  const todayEarnings = data?.progress?.today?.earnings || 0;
  const todayOrders = data?.progress?.today?.orders || 0;
  const todayHours = data?.progress?.today?.hours || "0:00 hrs";
  const workerRating = data?.rating;
  const totalReviews = data?.reviews_count || 0;
  const recentReviews = data?.recent_reviews || [];
  const activeServicesCount = data?.active_services_count || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Top Header Bar */}
        <Header />

        {/* Quick KPI Stat Cards Grid */}
        <section aria-label="Dashboard Metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* 1. Today's Earnings */}
          <div className="bg-white rounded-md border border-slate-200 p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Today's Earnings</span>
              <div className="p-1 rounded-sm bg-emerald-50 text-emerald-600">
                <TrendingUp size={14} />
              </div>
            </div>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatINR(todayEarnings)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {todayOrders} job{todayOrders === 1 ? "" : "s"} completed
            </p>
          </div>

          {/* 2. Logged Hours */}
          <div className="bg-white rounded-md border border-slate-200 p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Hours Worked</span>
              <div className="p-1 rounded-sm bg-blue-50 text-blue-600">
                <Clock size={14} />
              </div>
            </div>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">
              {todayHours}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Active on platform
            </p>
          </div>

          {/* 3. Customer Rating */}
          <button
            type="button"
            onClick={() => router.push("/profile/rating")}
            className="bg-white rounded-md border border-slate-200 p-4 shadow-2xs space-y-1 text-left hover:border-amber-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                Customer Rating
              </span>
              <div className="p-1 rounded-sm bg-amber-50 text-amber-500">
                <Star size={14} fill="currentColor" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                {workerRating ? workerRating.toFixed(1) : "—"}
              </span>
              {workerRating && <span className="text-xs text-slate-400 font-semibold">★</span>}
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-0.5">
              <span>{totalReviews > 0 ? `${totalReviews} reviews` : "No reviews yet"}</span>
              <ChevronRight size={12} className="text-slate-400 group-hover:text-amber-600 transition" />
            </p>
          </button>

          {/* 4. Active Skills / Rate Cards */}
          <button
            type="button"
            onClick={() => router.push("/my-services")}
            className="bg-white rounded-md border border-slate-200 p-4 shadow-2xs space-y-1 text-left hover:border-[#ff8a4c] transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-[#ff8a4c] transition-colors">
                My Rate Cards
              </span>
              <div className="p-1 rounded-sm bg-orange-50 text-[#ff8a4c]">
                <Wrench size={14} />
              </div>
            </div>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">
              {activeServicesCount} <span className="text-xs font-normal text-slate-400">Skills</span>
            </p>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-0.5">
              <span>Edit hourly rates</span>
              <ChevronRight size={12} className="text-slate-400 group-hover:text-[#ff8a4c] transition" />
            </p>
          </button>

        </section>

        {/* Offline Status Alert Banner */}
        {!isOnline && (
          <div className="bg-slate-900 text-white rounded-md p-4 shadow-sm flex items-center justify-between gap-3 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-100">You are currently OFFLINE</p>
                <p className="text-[11px] text-slate-400">
                  You are hidden from customer marketplace searches and will not receive new dispatch requests. Toggle to ONLINE above to resume.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Dispatch Feed Module */}
        <LiveDispatchFeed />

        {/* Work Progress & Earnings Summary */}
        <MyProgress progressData={data?.progress} />

        {/* Customer Reviews & Feedback Snapshot Card */}
        <section className="bg-white rounded-md border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-sm bg-amber-50 text-amber-500">
                <Star size={16} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Customer Ratings & Feedback
                </h3>
                <p className="text-[11px] text-slate-500">
                  {totalReviews > 0
                    ? `Rated ${workerRating ? workerRating.toFixed(1) : "5.0"} out of 5 stars based on ${totalReviews} verified reviews`
                    : "Complete customer bookings to earn ratings"}
                </p>
              </div>
            </div>

            <Link
              href="/profile/rating"
              className="text-xs font-bold text-[#ff8a4c] hover:text-[#f07432] inline-flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {recentReviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-sm border border-slate-200 bg-slate-50/60 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {review.reviewer_name}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    "{review.description}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Verified Booking #{review.booking_id}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-slate-100 bg-slate-50/60 p-4 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">No customer reviews yet</p>
              <p className="text-[11px] text-slate-500">
                Customer feedback will appear here as soon as you complete service orders.
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Want to see all reviews or edit submitted ones?</span>
            <Link
              href="/profile/rating"
              className="font-bold text-slate-800 hover:text-[#ff8a4c] flex items-center gap-1 transition"
            >
              <span>Open Feedback Hub</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* Quick Management Hub */}
        <section className="bg-white rounded-md border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Partner Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/my-services"
              className="flex items-center gap-3 p-3.5 rounded-sm border border-slate-200 bg-slate-50/50 hover:bg-[#fff4ed]/60 hover:border-[#ff8a4c] transition group cursor-pointer"
            >
              <div className="p-2 rounded-sm bg-orange-100 text-[#ff8a4c] group-hover:scale-105 transition-transform">
                <Wrench size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#ff8a4c] transition-colors">
                  My Rate Cards
                </p>
                <p className="text-[10px] text-slate-500 truncate">Set /hr or /day pricing</p>
              </div>
            </Link>

            <Link
              href="/profile/rating"
              className="flex items-center gap-3 p-3.5 rounded-sm border border-slate-200 bg-slate-50/50 hover:bg-amber-50/60 hover:border-amber-400 transition group cursor-pointer"
            >
              <div className="p-2 rounded-sm bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
                <Star size={16} fill="currentColor" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Ratings & Reviews
                </p>
                <p className="text-[10px] text-slate-500 truncate">Customer feedback score</p>
              </div>
            </Link>

            <Link
              href="/profile/user"
              className="flex items-center gap-3 p-3.5 rounded-sm border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition group cursor-pointer"
            >
              <div className="p-2 rounded-sm bg-slate-200 text-slate-800 group-hover:scale-105 transition-transform">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 transition-colors">
                  Partner Profile
                </p>
                <p className="text-[10px] text-slate-500 truncate">Personal & contact info</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Active Order Quota & Plan Status */}
        <OrderPlanCard
          completed={data?.plan?.completed || 0}
          totalLabel={data?.plan?.totalLabel || String(defaultPlan.totalJobs)}
          price={data?.plan?.price || defaultPlan.price}
          timeLeft={data?.plan?.timeLeft || defaultPlan.timeLeft}
        />

        {/* Recharge Subscription Module */}
        <PlansCard
          price={data?.recharge?.price || defaultPlan.price}
          validityDays={data?.recharge?.validityDays || defaultPlan.validityDays}
          orderType={data?.recharge?.orderType || defaultPlan.orderType}
          onRecharge={() => {
            alert(`Recharge payment window opening for ₹${defaultPlan.price} plan... Select UPI/Card to extend 10 job dispatches.`);
          }}
        />

      </main>

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
