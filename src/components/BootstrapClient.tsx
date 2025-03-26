"use client"; // ✅ This ensures it's a client component
import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min");
  }, []);

  return null; // No UI needed, just loads the script
}
