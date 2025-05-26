"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  getSalePaymentBreakDown,
//   addPaymentInstallmentToSale,
} from "@/redux/action/org-admin";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import Spinner from "react-bootstrap/Spinner";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setUnits, updatePaymentInUnit } from "@/redux/slice/TowerFlat";
const ReceiptContent = ({
  id,
  rera,

  handleClose,
}: {
  id: string;
  rera: string;

  handleClose: () => void;
}) => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const units = useSelector((state: RootState) => state.TowerFlats.units);
  const matchingUnit = units.find((unit) => unit.saleDetail?.id === id);
  const paid = matchingUnit?.saleDetail?.paid || "0";
  const remaining = matchingUnit?.saleDetail?.remaining || "0";
  const totalPrice = matchingUnit?.saleDetail?.totalPrice || "0";
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSalePaymentBreakDown(rera, id);
      console.log("Fetched payment breakdown data:", data);

      if (data?.error) {
        setError(data.message || "Unknown error occurred");
      } else if (data?.data && data?.data.details) {
        setResponse(data.data);
      } else {
        setError("Invalid data format received");
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




  if (loading)
    return (
      <div className={styles.loader}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );

  if (error) return <p className={styles.error}>{error}</p>;

  const {
    totalAmount,
    paidAmount,
    remaining: breakdownRemaining,
    details,
  } = response;

  return (
    <div className={styles.container}>
      <h1>Sale Payment Breakdown</h1>
      <button className={styles.closeButton} onClick={handleClose}>
        ✕
      </button>
      <div className={styles.overallSummary}>
        <h3>Overall Summary</h3>
        <p>
          <strong>Total Price: </strong>
          {formatIndianCurrencyWithDecimals(totalPrice)}
        </p>
        <p>
          <strong>Paid: </strong>
          {formatIndianCurrencyWithDecimals(paid)}
        </p>
        <p>
          <strong>Remaining: </strong>
          {formatIndianCurrencyWithDecimals(remaining)}
        </p>
      </div>

      <div className={styles.summary}>
        <h3>Breakdown Summary</h3>
        <p>
          <strong>Total Amount: </strong>
          {formatIndianCurrencyWithDecimals(totalAmount)}
        </p>
        <p>
          <strong>Paid Amount: </strong>
          {formatIndianCurrencyWithDecimals(paidAmount)}
        </p>
        <p>
          <strong>Remaining: </strong>
          {formatIndianCurrencyWithDecimals(breakdownRemaining)}
        </p>
      </div>

      <div className={styles.grid}>
        {details.map((item: any, index: number) => (
          <div className={styles.card} key={item.id}>
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
        
              {item.due && (
                <p>
                  <strong>Due Date: </strong>{" "}
                  {new Date(item.due).toLocaleDateString()}
                </p>
              )}
              <p>
                <strong>Amount:</strong> {item.amount}%
              </p>
              <p>
                <strong>Amount Paid:</strong>{" "}
                {formatIndianCurrencyWithDecimals(item.amountPaid)}
              </p>
              <p>
                <strong>Paid:</strong> {item.paid ? "Yes" : "No"}
              </p>
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
  paid: string | number;
  remaining: string | number;
  totalPrice: string | number;
}

const ReceiptModal: React.FC<PaymentBreakdownModalProps> = ({
  id,
  rera,
  paid,
  remaining,
  totalPrice,
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <div>
      <button onClick={handleOpen} className={styles.button}>
        Payment Breakdown
      </button>
      <Modal open={open} onClose={handleClose}>
        <Box className={styles.modal}>
          <ReceiptContent id={id} rera={rera} handleClose={handleClose} />
        </Box>
      </Modal>
    </div>
  );
};

export default ReceiptModal;
