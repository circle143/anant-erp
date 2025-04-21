"use client";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import React, { useEffect, useState } from "react";
import Loader from "@/components/Loader/Loader";
export default function Providers({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate any async setup if needed (e.g., hydration, auth, etc.)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // adjust timing if needed or hook into actual setup

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return <Provider store={store}>{children}</Provider>;
}
