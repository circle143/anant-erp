"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getSalePaymentBreakDown } from "@/redux/action/org-admin";
import styles from "./page.module.scss";

const Page = () => {
  const searchParams = useSearchParams();
  const [response, setResponse] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    const rera = searchParams.get("rera");

    const fetchData = async () => {
      if (id && rera) {
        try {
          const data = await getSalePaymentBreakDown(rera, id);
          // console.log("API Response:", data);
          if (data?.error) {
            setError(data.message || "Unknown error occurred");
          } else {
            setResponse(data.data || []);
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
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>Sale Payment Breakdown</h1>
      <div className={styles.grid}>
        {response.map((item, index) => (
          <div className={styles.card} key={index}>
            <p>
              <strong>Scope:</strong> {item.scope}
            </p>
            <p>
              <strong>Summary:</strong> {item.summary}
            </p>
            <p>
              <strong>Condition Type:</strong> {item.conditionType}
            </p>
            {item.conditionValue && (
              <p>
                <strong>Condition Value:</strong> {item.conditionValue}
              </p>
            )}
            <p>
              <strong>Amount:</strong> ₹{item.amount}
            </p>
            <p>
              <strong>Amount Paid:</strong> ₹
              {parseFloat(item.amountPaid).toLocaleString()}
            </p>
            <p>
              <strong>Paid:</strong> {item.paid ? "Yes" : "No"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
