"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
    getSalePaymentBreakDown,
    addPaymentInstallmentToSale,
} from "@/redux/action/org-admin";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import Spinner from "react-bootstrap/Spinner";
const PaymentBreakdownContent = ({
    id,
    rera,
}: {
    id: string;
    rera: string;
}) => {
    const [response, setResponse] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
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
    }, [id, rera]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMarkAsPaid = async (index: number, paymentId: string) => {
      const confirm = window.confirm(
        "Are you sure you want to mark this installment as paid?"
      );
      if (!confirm) return;

      try {
        const res = await addPaymentInstallmentToSale(rera, paymentId, id);
        if (res?.error) {
          toast.error(res.message || "Failed to mark as paid");
        } else {
          toast.success("Installment marked as paid");
          fetchData();
        }
      } catch (err: any) {
        toast.error(err.message || "Error processing request");
      }
    };


    if (loading)
        return (
            <div className={styles.loader}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
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
                                <strong>Condition Type:</strong>{" "}
                                {item.conditionType}
                            </p>
                            {item.conditionValue && (
                                <p>
                                    <strong>Condition Value:</strong>{" "}
                                    {item.conditionValue}
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
                                <strong>Paid:</strong>{" "}
                                {item.paid ? "Yes" : "No"}
                            </p>
                        </div>
                        <div>
                            {!item.paid && (
                                <button
                                    onClick={() =>
                                        handleMarkAsPaid(index, item.id)
                                    }
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
interface PaymentBreakdownModalProps {
    id: string;
    rera: string;
}
const PaymentBreakdownModal: React.FC<PaymentBreakdownModalProps> = ({
    id,
    rera,
}) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    return (
        <div>
            <button onClick={handleOpen} className={styles.button}>
                Payment Breakdown{" "}
            </button>
            <Modal open={open} onClose={handleClose}>
                <Box className={styles.modal}>
                    <PaymentBreakdownContent id={id} rera={rera} />
                </Box>
            </Modal>
        </div>
    );
};

export default PaymentBreakdownModal;
