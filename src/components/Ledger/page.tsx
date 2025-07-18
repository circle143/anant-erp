"use client";
import React, { useRef } from "react";
import styles from "./page.module.scss";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { numberToWords } from "@/utils/numberToWords"; // Ensure this utility is available
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useSearchParams } from "next/navigation";
interface bank {
    accountNumber: string;
    createdAt: string;
    id: string;
    name: string;
    orgId: string;
    societyId: string;
}
interface cleared {
    bank: bank;
    bankId: string;
    receiptId: string;
}
interface SingleReceipt {
    amount: string;
    bankName?: string;
    cgst: string;
    cleared?: cleared;
    failed: boolean;
    createdAt: string;
    dateIssued: string;
    id: string;
    mode: string;
    saleId: string;
    sgst: string;
    totalAmount: string;
    transactionNumber: string;
}

interface LedgerProps {
    receipt: SingleReceipt[];
    customerId: string;
    name: string;
    phone: string;
    amount: number;
    amountRemaining: number;
    bookingDate: string;
    superArea: number;
    floor: string;
    tower: string;
    project: string;
    plotNo: string;
}

interface PageProps {
    receiptData: LedgerProps;
    onClose: () => void;
}

const Page: React.FC<PageProps> = ({ receiptData, onClose }) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const receiptElement = receiptRef.current;
        if (!receiptElement) return;

        // Clone receipt content
        const clonedContent = receiptElement.cloneNode(true) as HTMLElement;
        clonedContent.querySelectorAll(".noPrint").forEach((el) => el.remove());

        // Create and configure iframe
        const iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        iframe.style.width = "1px";
        iframe.style.height = "1px";
        iframe.style.left = "-9999px";
        iframe.style.top = "0";
        document.body.appendChild(iframe);

        const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        // Create base structure
        const html = document.createElement("html");
        const head = document.createElement("head");
        const body = document.createElement("body");

        // Copy existing stylesheets into the iframe
        const cssLinks = Array.from(
            document.querySelectorAll('link[rel="stylesheet"]')
        );
        cssLinks.forEach((link) => {
            head.appendChild(link.cloneNode(true));
        });

        // Optional: Add print-specific inline styles
        const style = document.createElement("style");
        style.textContent = `
    @page {
      size: A4 portrait;
      margin: 0mm;
    }
  `;
        head.appendChild(style);
        // Append cloned receipt content
        body.appendChild(clonedContent);

        // Build and inject HTML structure
        html.appendChild(head);
        html.appendChild(body);
        iframeDoc.replaceChild(html, iframeDoc.documentElement);

        // Wait for DOM render before printing
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500); // Adjust delay as needed
    };
    const handleDownloadPDF = async () => {
        const input = receiptRef.current;
        if (!input) return;

        // Hide noPrint elements
        const noPrintElements = input.querySelectorAll(".noPrint");
        noPrintElements.forEach(
            (el) => ((el as HTMLElement).style.display = "none")
        );

        // Add a temporary class to ensure proper rendering
        input.classList.add("pdf-export");

        // Wait for reflow
        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(input, {
            scale: 2, // Increased scale for better quality
            useCORS: true,
            backgroundColor: "#ffffff", // Explicit white background
            logging: false,
            allowTaint: true,
        });

        // Remove temporary class
        input.classList.remove("pdf-export");

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate aspect ratio
        const imgRatio = canvas.width / canvas.height;
        const pdfRatio = pdfWidth / pdfHeight;

        let imgWidth = pdfWidth;
        let imgHeight = pdfHeight;

        if (imgRatio > pdfRatio) {
            imgHeight = pdfWidth / imgRatio;
        } else {
            imgWidth = pdfHeight * imgRatio;
        }

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`receipt_${receiptData.customerId}.pdf`);

        // Restore .noPrint elements
        noPrintElements.forEach(
            (el) => ((el as HTMLElement).style.display = "")
        );
    };
    const searchParams = useSearchParams();
    const rera = searchParams.get("rera");
    const SocietyFlatData = useSelector((state: RootState) =>
        rera ? state.flats.societyFlats[rera] : null
    );
    return (
        <>
            <div className={styles.overlay}>
                <button className={styles.closeButton} onClick={onClose}>
                    ✕
                </button>
                <div
                    style={{ backgroundColor: "#ffffff" }}
                    id="receipt"
                    ref={receiptRef}
                    className={styles.receiptContainer}
                >
                    <div className={styles.header}>
                        <h1>DSD HOMES PVT. LTD.</h1>
                        <p>
                            Registered Office: CP-GH-5B, Tech Zone-IV, Greater
                            Noida (West) U.P
                        </p>
                        <p>Ph: 0120-4229777</p>
                        <p>
                            GSTIN: 09AAECD6248G2ZI | CIN No.:
                            U70109DL2013PTC251321
                        </p>
                        <p>
                            Web: www.novenagreen.com | Email:
                            info@novenagreen.com
                        </p>
                    </div>

                    <div className={styles.customerInfo}>
                        <p>
                            <strong>
                                {receiptData.customerId.includes(",")
                                    ? "Owner ID(s)"
                                    : "Customer ID"}
                                :
                            </strong>{" "}
                            {receiptData.customerId}
                        </p>
                        <p>
                            <strong>
                                {receiptData.customerId.includes(",")
                                    ? "Owner(s)"
                                    : "Customer Name"}
                                :
                            </strong>{" "}
                            {receiptData.name}
                        </p>
                        <p>
                            <strong>Mobile:</strong> {receiptData.phone}
                        </p>
                        <p>
                            <strong>Total Amount:</strong>{" "}
                            {formatIndianCurrencyWithDecimals(
                                Number(receiptData.amount)
                            )}
                        </p>
                        <p>
                            <strong>Remaining Amount:</strong>{" "}
                            {formatIndianCurrencyWithDecimals(
                                Number(receiptData.amountRemaining)
                            )}
                        </p>
                        <p>
                            <strong>Booking Date:</strong>{" "}
                            {receiptData.bookingDate}
                        </p>
                    </div>

                    <div className={styles.summary}>
                        <p>
                            Flat No. <strong>{receiptData.plotNo}</strong> with
                            a salable area of{" "}
                            <strong>{receiptData.superArea} Sq.Ft.</strong>,
                            located on the{" "}
                            <strong>
                                {receiptData.floor}
                                <sup>th</sup> floor
                            </strong>{" "}
                            of Tower <strong>{receiptData.tower}</strong>, in
                            the project <strong>{SocietyFlatData?.name}</strong>{" "}
                            located at{" "}
                            <strong>{SocietyFlatData?.address}</strong>.
                        </p>
                    </div>
                    <table className={styles.receiptTable}>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Mode</th>
                                <th>Instrument Date</th>
                                <th>Status</th>
                                <th>Bank</th>
                                <th>Amount</th>
                                <th>CGST</th>
                                <th>SGST</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receiptData.receipt.map((receipt, index) => {
                                const status = receipt.failed
                                    ? "Failed"
                                    : receipt.cleared
                                    ? "Paid"
                                    : "Pending";
                                const bankName =
                                    receipt.bankName ||
                                    receipt.cleared?.bank?.name ||
                                    "N/A";
                                const instrumentDate = new Date(
                                    receipt.dateIssued
                                ).toLocaleDateString();

                                return (
                                    <tr key={receipt.id}>
                                        <td>{index + 1}</td>
                                        <td>{receipt.mode}</td>
                                        <td>{instrumentDate}</td>
                                        <td>{status}</td>
                                        <td>{bankName}</td>
                                        <td>
                                            {formatIndianCurrencyWithDecimals(
                                                Number(receipt.amount)
                                            )}
                                        </td>
                                        <td>
                                            {formatIndianCurrencyWithDecimals(
                                                Number(receipt.cgst)
                                            )}
                                        </td>
                                        <td>
                                            {formatIndianCurrencyWithDecimals(
                                                Number(receipt.sgst)
                                            )}
                                        </td>
                                        <td>
                                            {formatIndianCurrencyWithDecimals(
                                                Number(receipt.totalAmount)
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Totals Row */}
                            <tr>
                                <td colSpan={5}>
                                    <strong>Total</strong>
                                </td>
                                <td>
                                    <strong>
                                        {formatIndianCurrencyWithDecimals(
                                            receiptData.receipt
                                                .reduce(
                                                    (acc, r) =>
                                                        acc + Number(r.amount),
                                                    0
                                                )
                                                .toFixed(2)
                                        )}
                                    </strong>
                                </td>
                                <td>
                                    <strong>
                                        {formatIndianCurrencyWithDecimals(
                                            receiptData.receipt
                                                .reduce(
                                                    (acc, r) =>
                                                        acc + Number(r.cgst),
                                                    0
                                                )
                                                .toFixed(2)
                                        )}
                                    </strong>
                                </td>
                                <td>
                                    <strong>
                                        {formatIndianCurrencyWithDecimals(
                                            receiptData.receipt
                                                .reduce(
                                                    (acc, r) =>
                                                        acc + Number(r.sgst),
                                                    0
                                                )
                                                .toFixed(2)
                                        )}
                                    </strong>
                                </td>
                                <td>
                                    <strong>
                                        {formatIndianCurrencyWithDecimals(
                                            receiptData.receipt
                                                .reduce(
                                                    (acc, r) =>
                                                        acc +
                                                        Number(r.totalAmount),
                                                    0
                                                )
                                                .toFixed(2)
                                        )}
                                    </strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div>
                        <strong>
                            Amount in words:{" "}
                            {numberToWords(
                                receiptData.receipt.reduce(
                                    (acc, r) => acc + Number(r.totalAmount),
                                    0
                                )
                            ).toUpperCase()}{" "}
                            ONLY
                        </strong>
                    </div>
                    <div className={styles.signature}>
                        <p>For DSD HOMES PVT. LTD.</p>
                        <p className={styles.authorized}>
                            Authorised Signatory
                        </p>
                    </div>

                    <div className={styles.terms}>
                        <ul>
                            <li>With tax as per Govt. rule</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className={styles.noPrint}>
                <button onClick={handlePrint} className={styles.printButton}>
                    Print
                </button>
                <button
                    onClick={handleDownloadPDF}
                    className={styles.printButton}
                >
                    Download PDF
                </button>
            </div>
        </>
    );
};

export default Page;
