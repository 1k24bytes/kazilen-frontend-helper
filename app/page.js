"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import MyProgress from "./components/MyProgress";
import OrderPlanCard from "./components/OrderPlanCard";
import PlansCard from "./components/PlansCard";

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
    plan: { completed: 0, totalLabel: "0", price: 0, timeLeft: "0 hours left" },
    recharge: { price: 0, validityDays: 0, orderType: "None" }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 flex flex-col justify-center items-center text-zinc-500 text-sm font-medium">
        <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
        Loading Dashboard…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50/50 text-zinc-900 pb-16">
      <div className="max-w-xl mx-auto px-4 py-4 space-y-6">
        {/* Header Bar */}
        <Header imageSrc={null} />

        {/* Progress Module */}
        <MyProgress progressData={data?.progress} />

        {/* Order & Plan Overview */}
        <OrderPlanCard 
          completed={data?.plan?.completed} 
          totalLabel={data?.plan?.totalLabel}
          price={data?.plan?.price}
          timeLeft={data?.plan?.timeLeft}
        />

        {/* Recharge Subscription Module */}
        <PlansCard 
          price={data?.recharge?.price}
          validityDays={data?.recharge?.validityDays}
          orderType={data?.recharge?.orderType}
          onRecharge={() => {
            alert('Recharge functionality not connected to backend yet.');
          }} 
        />
      </div>
    </main>
  );
}
