"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import MyProgress from "./components/MyProgress";
import OrderPlanCard from "./components/OrderPlanCard";
import PlansCard from "./components/PlansCard";
import LiveDispatchFeed from "./components/LiveDispatchFeed";
import plansConfig from "./data/plans.json";

export default function WorkerDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultPlan = plansConfig.defaultPlan;

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
    plan: { completed: 0, totalLabel: String(defaultPlan.totalJobs), price: defaultPlan.price, timeLeft: defaultPlan.timeLeft },
    recharge: { price: defaultPlan.price, validityDays: defaultPlan.validityDays, orderType: defaultPlan.orderType }
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
      </div>
    </main>
  );
}
