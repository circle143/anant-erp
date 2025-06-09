"use client";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "./page.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import { useRouter } from "next/navigation";
import {
  clearSaleReceipt,
  getAllSocietyBanks,
  markReceiptAsFailed,
} from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import Spinner from "react-bootstrap/Spinner";
import ReceiptDocModal from "@/components/ReceiptDocModal/page";
const ReceiptContent = ({
  id,
  rera,
  towerId,
  handleClose,
  fetchData,
}: {
  id: string;
  rera: string;
  towerId?: string;
  handleClose: () => void;
  fetchData: () => void;
}) => {
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    null
  );
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [banks, setBanks] = useState<
    { id: string; name: string; accountNumber: string }[]
  >([]);

  const units = useSelector((state: RootState) =>
    towerId ? state.TowerFlats.units : state.Society.units
  );

  const matchingUnit = units.find((unit) => unit.saleDetail?.id === id);
  const receipts = matchingUnit?.saleDetail?.receipts || [];
  const router = useRouter();

  useEffect(() => {
    console.log("matchingUnit", matchingUnit);
    setPageLoading(false); // simulate async page preparation if needed
  }, []);

  const fetchAllBanks = async (
    cursor: string | null = null,
    accumulated: any[] = []
  ): Promise<any[]> => {
    const response = await getAllSocietyBanks(rera, cursor);
    if (response?.error) return accumulated;

    const items = response?.data?.items || [];
    const newData = [...accumulated, ...items];
    const hasNext = response?.data?.pageInfo?.nextPage;
    const nextCursor = response?.data?.pageInfo?.cursor;

    if (hasNext && nextCursor) {
      return await fetchAllBanks(nextCursor, newData);
    }

    return newData;
  };

  const handleClearClick = async (receiptId: string) => {
    setSelectedReceiptId(receiptId);
    setClearModalOpen(true);
    setSelectedBankId("");
    setErrorMsg("");

    const fetchedBanks = await fetchAllBanks();
    setBanks(fetchedBanks);
  };
  const handleMarkAsFailed = async (receiptId: string) => {
    setLoading(true);
    try {
      const response = await markReceiptAsFailed(rera, receiptId);
      if (response?.error) {
        toast.error(response.message || "Failed to mark as failed.");
      } else {
        toast.success("Receipt marked as failed.");
        fetchData();
      }
    } catch (error) {
      toast.error("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async () => {
    if (!selectedBankId || !selectedReceiptId) {
      setErrorMsg("Please select a bank.");
      return;
    }

    setLoading(true);
    const response = await clearSaleReceipt(
      rera,
      selectedReceiptId,
      selectedBankId
    );
    if (response?.error) {
      setErrorMsg(response.message || "Failed to clear receipt.");
    } else {
      setClearModalOpen(false);
      toast.success("Receipt cleared successfully.");
      fetchData();
    }
    setLoading(false);
  };

  if (pageLoading) {
    return (
      <div className={styles.loader}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Receipts</h1>
      <button
        className={styles.createButton}
        onClick={() =>
          router.push(
            towerId
              ? `/org-admin/society/towers/flats/create-receipt?rera=${rera}&saleId=${id}&towerId=${towerId}`
              : `/org-admin/society/flats/create-receipt?rera=${rera}&saleId=${id}`
          )
        }
      >
        Create Receipt
      </button>
      <button className={styles.closeButton} onClick={handleClose}>
        ✕
      </button>

      {receipts.length === 0 ? (
        <p>No receipts available.</p>
      ) : (
        <div className={styles.grid}>
          {receipts.map((receipt) => (
            <div key={receipt.id} className={styles.card}>
              <p>
                <strong>Receipt Number:</strong> {receipt.id}
              </p>
              <p>
                <strong>Date Issued:</strong>{" "}
                {new Date(receipt.dateIssued).toLocaleDateString()}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {formatIndianCurrencyWithDecimals(receipt.amount)}
              </p>
              <p>
                <strong>Mode:</strong> {receipt.mode}
              </p>
              <p>
                <strong>Transaction Number:</strong>{" "}
                {receipt.transactionNumber || "N/A"}
              </p>
              <p>
                <strong>Bank Name:</strong> {receipt.bankName || "N/A"}
              </p>
              <p>
                <strong>CGST:</strong>{" "}
                {formatIndianCurrencyWithDecimals(receipt.cgst)}
              </p>
              <p>
                <strong>SGST:</strong>{" "}
                {formatIndianCurrencyWithDecimals(receipt.sgst)}
              </p>
              <p>
                <strong>Total Amount:</strong>{" "}
                {formatIndianCurrencyWithDecimals(receipt.totalAmount)}
              </p>
              {receipt.failed && (
                <>
                  <strong>Status:</strong>
                  <p className={styles.failed}>Receipt Marked as Failed</p>
                </>
              )}
              {!receipt.cleared && !receipt.failed && (
                <>
                  <strong>Status:</strong>
                  <p className={styles.pending}>Receipt Pending</p>
                </>
              )}

              {receipt.cleared && (
                <div className={styles.clearedInfo}>
                  <p>
                    <strong>Cleared via:</strong>
                  </p>
                  <div>
                    <p>
                      <strong>Bank Name:</strong> {receipt.cleared.bank.name}
                    </p>
                    <p>
                      <strong>Account Number:</strong>{" "}
                      {receipt.cleared.bank.accountNumber}
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.button_group}>
                <div>
                  <ReceiptDocModal
                    receiptData={{
                      receiptNo: receipt.id,
                      customerId: "N/A",
                      name: "Customer Name",
                      address: "N/A",
                      phone: "N/A",
                      date: new Date(receipt.dateIssued).toLocaleDateString(),
                      amount: Number(receipt.amount),
                      cgst: Number(receipt.cgst),
                      sgst: Number(receipt.sgst),
                      total: Number(receipt.totalAmount),
                      superArea: Number(matchingUnit?.flatType?.superArea) || 0,
                      balconyArea:
                        Number(matchingUnit?.flatType?.balconyArea) || 0,
                      reraCarpetArea:
                        Number(matchingUnit?.flatType?.reraCarpetArea) || 0,
                      area: Number(matchingUnit?.flatType?.builtUpArea) || 0,
                      floor:
                        matchingUnit?.floorNumber !== undefined &&
                        matchingUnit?.floorNumber !== null
                          ? String(matchingUnit.floorNumber)
                          : "N/A",
                      tower: matchingUnit?.name
                        ? matchingUnit.name.charAt(0)
                        : "N/A",
                      project: "N/A",
                      plotNo: matchingUnit?.name || "N/A",
                      bankName: receipt.bankName || "N/A",
                      instrumentDate: new Date(
                        receipt.dateIssued
                      ).toLocaleDateString(),
                      status: receipt.failed
                        ? "Failed"
                        : receipt.cleared
                        ? "Paid"
                        : "Pending",
                      mode: receipt.mode,
                    }}
                  />
                </div>
                {!receipt.cleared && receipt.failed === false && (
                  <>
                    <button
                      className={styles.clearButton}
                      onClick={() => handleClearClick(receipt.id)}
                    >
                      Clear Receipt
                    </button>
                    <button
                      onClick={() => handleMarkAsFailed(receipt.id)}
                      className={styles.failedButton}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Mark as Failed"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={clearModalOpen} onClose={() => setClearModalOpen(false)}>
        <Box className={styles.modal2}>
          <h3>Select Bank to Clear Receipt</h3>
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className={styles.select}
          >
            <option value="">Select a bank</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name} {bank.accountNumber}
              </option>
            ))}
          </select>
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          <div className={styles.buttonGroup}>
            <button
              onClick={() => setClearModalOpen(false)}
              className={styles.closeButton}
            >
              ✕
            </button>
            <button
              onClick={handleDone}
              className={styles.paidButton}
              disabled={loading}
            >
              {loading ? "Clearing..." : "Done"}
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

interface ReceiptModalProps {
  id: string;
  rera: string;
  towerId?: string;
  fetchData: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  id,
  rera,
  towerId,
  fetchData,
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <button onClick={handleOpen} className={styles.button}>
        View Receipts
      </button>
      <Modal open={open} onClose={handleClose}>
        <Box className={styles.modal}>
          <ReceiptContent
            id={id}
            rera={rera}
            towerId={towerId}
            handleClose={handleClose}
            fetchData={fetchData}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default ReceiptModal;
