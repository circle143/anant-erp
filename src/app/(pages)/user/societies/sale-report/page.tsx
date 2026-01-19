"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import { getSocietySaleReport } from "@/redux/action/org-admin";
import Loader from "@/components/Loader/Loader";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { society_sales_report } from "@/utils/breadcrumbs";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";

const Page = () => {
  const searchParams = useSearchParams();
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rera = searchParams.get("rera");

    const fetchData = async () => {
      if (rera) {
        try {
          const data = await getSocietySaleReport(rera);
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

  if (loading) return <Loader />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
        <CustomBreadcrumbs items={society_sales_report} />
      </div>
      <div className={styles.container}>
        <h1 className={styles.title}>Society Sale Report</h1>
        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            <h3>Total Amount</h3>
            <p>{formatIndianCurrencyWithDecimals(response?.data?.total)}</p>
          </div>
          <div className={styles.card}>
            <h3>Paid Amount</h3>
            <p>{formatIndianCurrencyWithDecimals(response?.data?.paid)}</p>
          </div>
          <div className={styles.card}>
            <h3>Pending Amount</h3>
            <p>{formatIndianCurrencyWithDecimals(response?.data?.pending)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
