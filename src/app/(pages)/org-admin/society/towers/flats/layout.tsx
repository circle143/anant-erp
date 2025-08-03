"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";

import { getTowerById } from "@/redux/action/org-admin";
import { updateTowerFlats } from "@/redux/slice/flatSlice";

export default function Layout({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const rera = searchParams.get("rera");
    const towerId = searchParams.get("towerId");
    useEffect(() => {
        const fetchSocietyData = async () => {
            if (!rera || !towerId) return;

            try {
                const data = await getTowerById(rera, towerId);
                console.log("tower data:", data);
                if (data && !data.error) {
                    dispatch(
                        updateTowerFlats({
                            towerId: data.data.id,
                            data: {
                                name: data.data.name,
                                totalFlats: data.data.totalFlats,
                                totalSoldFlats: data.data.soldFlats,
                                totalUnsoldFlats: data.data.unsoldFlats,
                            },
                        })
                    );
                } else {
                    console.error(
                        "Failed to fetch society data:",
                        data.message
                    );
                }
            } catch (error) {
                console.error("API Error:", error);
            }
        };

        fetchSocietyData();
    }, [rera, dispatch]);

    return <div>{children}</div>;
}
