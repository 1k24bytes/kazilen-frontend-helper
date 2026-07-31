"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import MyProgress from "./components/MyProgress";
import OrderPlanCard from "./components/OrderPlanCard";
import PlansCard from "./components/PlansCard";
import LiveDispatchFeed from "./components/LiveDispatchFeed";

export default function WorkerDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/worker/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const json = await response.json();
          setData(json);
        } else {
          setData(getEmptyState());
        }
      } catch (err) {
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
      week: { earnings: 0, hours: "0:00 hrs", orders: 0 }
    },
    plan: { completed: 0, totalLabel: "10", price: 199, timeLeft: "14 days remaining" },
    recharge: { price: 199, validityDays: 30, orderType: "Electrician & Instant Repair" }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-slate-500 text-sm font-medium">
        <div className="w-6 h-6 border-2 border-[#ff8a4c] border-t-transparent rounded-full animate-spin mb-3" />
        Loading Partner Console…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Header Bar */}
        <Header imageSrc={null} />

        {/* Live Dispatch Feed Module */}
        <LiveDispatchFeed />

        {/* Work Progress & Earnings Summary */}
        <MyProgress progressData={data?.progress} />

        {/* Active Order Quota & Plan Status */}
        <OrderPlanCard 
          completed={data?.plan?.completed} 
          totalLabel={data?.plan?.totalLabel || "10"}
          price={data?.plan?.price || 199}
          timeLeft={data?.plan?.timeLeft || "14 days remaining"}
        />

        {/* Recharge Subscription Module */}
        <PlansCard 
          price={data?.recharge?.price || 199}
          validityDays={data?.recharge?.validityDays || 30}
          orderType={data?.recharge?.orderType || "Electrician & Instant Repair"}
          onRecharge={() => {
            alert('Recharge payment window opening... Select UPI/Card to extend 10 job dispatches.');
          }} 
        />
      </div>
    </main>
  );
}
