"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";

import { getSocietyById } from "@/redux/action/org-admin";
import { updateSocietyFlats } from "@/redux/slice/flatSlice";

export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");

  useEffect(() => {
    const fetchSocietyData = async () => {
      if (!rera) return;

      try {
        const data = await getSocietyById(rera);
        console.log("Society data:", data);
        if (data && !data.error) {
          dispatch(
            updateSocietyFlats({
              reraNumber: data.data.reraNumber,
              data: {
                totalFlats: data.data.totalFlats,
                totalSoldFlats: data.data.soldFlats,
                totalUnsoldFlats: data.data.unsoldFlats,
              },
            })
          );
        } else {
          console.error("Failed to fetch society data:", data.message);
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchSocietyData();
  }, [rera, dispatch]);

  return <div>{children}</div>;
}
