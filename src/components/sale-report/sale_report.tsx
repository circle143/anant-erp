"use client";
import React, { useState, useCallback, useEffect } from "react";
import { getSocietySaleReport } from "@/redux/action/org-admin";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "./page.module.scss";
import Spinner from "react-bootstrap/Spinner";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";

const SaleReportContent = ({ rera }: { rera: string }) => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSocietySaleReport(rera); 
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
  }, [rera]);

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

  return (
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
  );
};

interface SaleReportModalProps {
  rera: string;
}

const SaleReportModal: React.FC<SaleReportModalProps> = ({ rera }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <button onClick={handleOpen} >
        Sale Report
      </button>

      <Modal open={open} onClose={handleClose}>
        <Box className={styles.modal}>
          <SaleReportContent rera={rera} />
        </Box>
      </Modal>
    </div>
  );
};

export default SaleReportModal;
