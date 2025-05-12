"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import { getSocietySaleReport } from "@/redux/action/org-admin";

const Page = () => {
  const searchParams = useSearchParams();
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    const rera = searchParams.get("rera");

    const fetchData = async () => {
      if (id && rera) {
        try {
          const data = await getSocietySaleReport(rera, id);
          console.log("Society Sale Report Response:", data);
          if (data?.error) {
            setError(data.message || "Unknown error occurred");
          } else {
            setResponse(data);
          }
        } catch (err: any) {
          setError(err.message || "Error fetching data");
        } finally {
          setLoading(false);
        }
      } else {
        setError("Missing query parameters");
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

return (
  <div className={styles.container}>
    <h1 className={styles.title}>Society Sale Report</h1>
    <div className={styles.cardWrapper}>
      <div className={styles.card}>
        <h3>Total Amount</h3>
        <p>₹ {Number(response?.data?.total).toLocaleString("en-IN")}</p>
      </div>
      <div className={styles.card}>
        <h3>Paid Amount</h3>
        <p>₹ {Number(response?.data?.paid).toLocaleString("en-IN")}</p>
      </div>
      <div className={styles.card}>
        <h3>Pending Amount</h3>
        <p>₹ {Number(response?.data?.pending).toLocaleString("en-IN")}</p>
      </div>
    </div>
  </div>
);

};

export default Page;
