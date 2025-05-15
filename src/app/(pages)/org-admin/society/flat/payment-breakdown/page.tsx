"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { getSalePaymentBreakDown } from "@/redux/action/org-admin";
import { addPaymentInstallmentToSale } from "@/redux/action/org-admin"; // Import your API function
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import toast from "react-hot-toast";
import debounce from "lodash/debounce"; // Correct import for debounce

const Page = () => {
  const searchParams = useSearchParams();
  const [response, setResponse] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const id = searchParams.get("id");
  const rera = searchParams.get("rera");

  const fetchData = useCallback(async () => {
    if (id && rera) {
      try {
        setLoading(true);
        const data = await getSalePaymentBreakDown(rera, id);
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
  }, [id, rera]);

  const debouncedFetch = useCallback(debounce(fetchData, 1000), [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkAsPaid = async (index: number, paymentId: string) => {
    if (!rera || !id) return;

    try {
      const res = await addPaymentInstallmentToSale(rera, paymentId, id);
      if (res?.error) {
        toast.error(res.message || "Failed to mark as paid");
      } else {
        toast.success("Installment marked as paid");
        debouncedFetch(); // Re-fetch with debounce
      }
    } catch (err: any) {
      toast.error(err.message || "Error processing request");
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>Sale Payment Breakdown</h1>
      <div className={styles.grid}>
        {response.map((item, index) => (
          <div className={styles.card} key={index}>
            <div>
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
                <strong>Amount:</strong> {item.amount}%
              </p>
              <p>
                <strong>Amount Paid:</strong> ₹
                {parseFloat(item.amountPaid).toLocaleString()}
              </p>
              <p>
                <strong>Paid:</strong> {item.paid ? "Yes" : "No"}
              </p>
            </div>
            <div>
              {!item.paid && (
                <button
                  onClick={() => handleMarkAsPaid(index, item.id)}
                  className={styles.paidButton}
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
