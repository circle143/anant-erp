"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Society from "@/components/Forms/Society";
import { useEffect, useState } from "react";

const EditSocietyPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [initialData, setInitialData] = useState<{
    name: string;
    Rera: string;
    address: string;
    logo?: string;
  } | null>(null);

  useEffect(() => {
    const name = searchParams.get("name") || "";
    const Rera = searchParams.get("rera") || "";
    const address = searchParams.get("address") || "";
    const logo = searchParams.get("image") || "";

    if (name && Rera && address) {
      setInitialData({ name, Rera, address, logo });
    } else {
      router.push("/org-admin/society"); // redirect if data is incomplete
    }
  }, [searchParams, router]);

  if (!initialData) return null; // or a loading indicator

  return (
    <Society
      mode="edit"
      initialData={initialData}
      onSuccess={() => router.push("/org-admin/society")}
    />
  );
};

export default EditSocietyPage;
