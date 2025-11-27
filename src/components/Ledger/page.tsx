// app/components/Receipt/Page.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import styles from "./page.module.scss";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { numberToWords } from "@/utils/numberToWords";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useSearchParams } from "next/navigation";
import { getSelf } from "../../redux/action/org-admin";
import { getUrl } from "aws-amplify/storage";
import Loader from "../Loader/Loader";

// ------------ Types ------------

interface ClearedInfo {
  bank: {
    accountNumber: string;
    createdAt: string;
    id: string;
    name: string;
    orgId: string;
    societyId: string;
  };
  bankId: string;
  receiptId: string;
}

interface ReceiptItem {
  id: string | number;
  mode: string;
  dateIssued: string;
  failed?: boolean;
  cleared?: ClearedInfo;
  amount: number | string;
  cgst?: number | string;
  sgst?: number | string;
  krishiKalyanCess?: number | string;
  serviceTax?: number | string;
  swatchBharatCess?: number | string;
  totalAmount: number | string;
}

interface ReceiptData {
  receipt: ReceiptItem[];
  saleNumber: string;
  customerId: string;
  name: string;
  phone: string;
  amount: number | string;
  amountRemaining: number | string;
  bookingDate: string;
  plotNo: string;
  superArea: number | string;
  floor: number | string;
  tower: string;
}

type PageProps = {
  receiptData: ReceiptData;
  onClose: () => void;
};

// ------------ Component ------------

const Page: React.FC<PageProps> = ({ receiptData, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to use the print feature.");
      return;
    }

    // Grab hashed class names for CSS Modules
    const overlayCls = styles.overlay;
    const receiptCls = styles.receiptContainer;
    const noPrintCls = styles.noPrint;
    const headerCls = styles.header;
    const customerInfoCls = styles.customerInfo;
    const summaryCls = styles.summary;
    const tableCls = styles.receiptTable;
    const amountInWordsCls = styles.amountInWords;
    const termsCls = styles.terms;
    const signatureCls = styles.signature;
    const tableContainerCls = styles.tableContainer;

    // Collect styles
    let styleTags = "";
    Array.from(document.styleSheets).forEach((ss) => {
      try {
        const css = (ss as CSSStyleSheet).cssRules;
        if (css) {
          let txt = "";
          for (let i = 0; i < css.length; i++) txt += css[i].cssText;
          styleTags += `<style>${txt}</style>`;
        } else if ((ss as CSSStyleSheet).href) {
          styleTags += `<link rel="stylesheet" href="${
            (ss as CSSStyleSheet).href
          }">`;
        }
      } catch {
        // Cross-origin: fallback to href
        if ((ss as CSSStyleSheet).href) {
          styleTags += `<link rel="stylesheet" href="${
            (ss as CSSStyleSheet).href
          }">`;
        }
      }
    });

    // Hard overrides to prevent "blank pages"
    const safeOverrides = `
      <style>
        /* Force visibility in popup */
        * { visibility: visible !important; }
        .${noPrintCls}, .noPrint { display: none !important; }

        html, body {
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          margin: 0; padding: 0;
        }
        @page { size: A4 portrait; margin: 10mm; }

        /* De-cardify */
        .${overlayCls} { padding: 0 !important; background: #ffffff !important; }
        .${receiptCls} {
          box-shadow: none !important;
          background: #ffffff !important;
          color: #000000 !important;
          width: auto !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Ensure readable sizes in print popup too */
        .${headerCls} h1 { font-size: 16px; }
        .${headerCls} p,
        .${customerInfoCls} p,
        .${summaryCls},
        .${amountInWordsCls},
        .${signatureCls} p { font-size: 12px; }

        .${tableContainerCls} { overflow: visible !important; margin: 10px 0; }
        .${tableCls} {
          width: 100% !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
          font-size: 10px !important;
        }
        .${tableCls} th, .${tableCls} td {
          border: 1px solid #000 !important;
          padding: 4px !important;
          text-align: center !important;
          word-wrap: break-word !important;
        }
        .${tableCls} th { background: #f3f4f6 !important; }

        .${termsCls} { border-top: 1px solid #000 !important; padding-top: 10px !important; }
      </style>
    `;

    const doc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Receipt - ${receiptData.customerId}</title>
          ${styleTags}
          ${safeOverrides}
        </head>
        <body>${printContent.outerHTML}</body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(doc);
    printWindow.document.close();

    const doPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } finally {
        printWindow.close();
      }
    };

    const afterFonts = () => setTimeout(doPrint, 50);
    try {
      const docFonts = (printWindow.document as any).fonts;
      if (docFonts && docFonts.ready) {
        docFonts.ready.then(afterFonts).catch(afterFonts);
      } else {
        afterFonts();
      }
    } catch {
      afterFonts();
    }
  };

  const handleDownloadPDF = async () => {
    const input = receiptRef.current;
    if (!input) return;

    try {
      input.classList.add(styles.pdfExport);
      if ("fonts" in document) {
        const docFonts = (document as any).fonts;
        if (docFonts && docFonts.ready) {
          await docFonts.ready.catch(() => {});
        }
      }
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve())
      );
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 50));

      const scale = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = await html2canvas(input, {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        removeContainer: true,
        ignoreElements: (el) =>
          el.classList?.contains(styles.noPrint) ||
          el.classList?.contains("noPrint"),
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 5;
      const usableWidth = pageWidth - margin * 2;

      const imgWpx = canvas.width;
      const imgHpx = canvas.height;
      const imgHeight = (imgHpx * usableWidth) / imgWpx;

      pdf.addImage(imgData, "PNG", margin, margin, usableWidth, imgHeight);

      let heightLeft = imgHeight - (pageHeight - margin * 2);
      while (heightLeft > 0) {
        pdf.addPage();
        const position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`receipt_${receiptData.customerId}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      input.classList.remove(styles.pdfExport);
    }
  };

  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");
  const SocietyFlatData = useSelector((state: RootState) =>
    rera ? state.flats.societyFlats[rera] : null
  );

  const [formData, setFormData] = useState({
    name: "",
    gst: "",
    logo: "",
    file: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchSelf = async () => {
      const res = await getSelf();
      if (!res?.error && res?.data) {
        const item = res.data;
        if (item.logo) {
          try {
            const getUrlResult = await getUrl({
              path: item.logo,
              options: { validateObjectExistence: true, expiresIn: 3600 },
            });
            item.logo = getUrlResult.url.toString();
          } catch (error) {
            console.error("Error fetching logo URL", error);
          }
        }
        setFormData({
          name: item.name || "",
          gst: item.gst || "",
          logo: item.logo || "",
          file: null,
        });
      }
      setLoading(false);
    };
    fetchSelf();
  }, []);

  if (loading) return <Loader />;

  // Use the defined type
  type Item = ReceiptItem;

  // ✅ Only non-failed receipts are considered for rows & calculations
  const validReceipts: Item[] = receiptData.receipt.filter(
    (r: Item) => !r.failed
  );

  const hasPostGST = validReceipts.some(
    (r: Item) => new Date(r.dateIssued) > new Date("2017-07-01")
  );
  const hasPreGST = validReceipts.some(
    (r: Item) => new Date(r.dateIssued) <= new Date("2017-07-01")
  );

  const calculateTotalColSpan = () => 4; // S.No, Mode, Date, Status

  const totalAmount = validReceipts.reduce(
    (a: number, r: Item) => a + Number(r.totalAmount),
    0
  );

  return (
    <>
      <div className={styles.overlay}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <div
          id="receipt"
          ref={receiptRef}
          className={styles.receiptContainer}
          style={{ backgroundColor: "#ffffff" }}
        >
          <div className={styles.header}>
            <h1>{formData.name}</h1>
            <p>
              Address: GH-9, Sector 11, Vrindavan Colony, Lucknow, Uttar Pradesh
              226012
            </p>
            <p>Ph: 0120-4229777</p>
            <p>GSTIN: 09AACCH6839F1ZE | CIN No.: U70109DL2013PTC251321</p>
            <p>Web: www.novenagreen.com | Email: info@novenagreen.com</p>
          </div>

          <div className={styles.customerInfo}>
            <p>
              <strong>Member ID:</strong> {receiptData.saleNumber}
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
              {formatIndianCurrencyWithDecimals(Number(receiptData.amount))}
            </p>
            <p>
              <strong>Remaining Amount:</strong>{" "}
              {formatIndianCurrencyWithDecimals(
                Number(receiptData.amountRemaining)
              )}
            </p>
            <p>
              <strong>Booking Date:</strong> {receiptData.bookingDate}
            </p>
          </div>

          <div className={styles.summary}>
            <p>
              Flat No. <strong>{receiptData.plotNo}</strong> with a salable area
              of <strong>{receiptData.superArea} Sq.Ft.</strong>, located on the{" "}
              <strong>
                {receiptData.floor}
                <sup>th</sup> floor
              </strong>{" "}
              of Tower <strong>{receiptData.tower}</strong>, in the project{" "}
              <strong>{SocietyFlatData?.name}</strong> located at{" "}
              <strong>{SocietyFlatData?.address}</strong>.
            </p>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.receiptTable}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Mode</th>
                  <th>Instrument Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  {hasPostGST && (
                    <>
                      <th>CGST</th>
                      <th>SGST</th>
                    </>
                  )}
                  {hasPreGST && (
                    <>
                      <th>Krishi Kalyan Cess</th>
                      <th>Service Tax</th>
                      <th>Swachh Bharat Cess</th>
                    </>
                  )}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {validReceipts.map((r: Item, i: number) => {
                  const status = r.cleared ? "Paid" : "Pending";
                  const instrumentDate = new Date(
                    r.dateIssued
                  ).toLocaleDateString();
                  return (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{r.mode}</td>
                      <td>{instrumentDate}</td>
                      <td>{status}</td>
                      <td>
                        {formatIndianCurrencyWithDecimals(Number(r.amount))}
                      </td>
                      {hasPostGST && (
                        <>
                          <td>
                            {formatIndianCurrencyWithDecimals(
                              Number(r.cgst) || 0
                            )}
                          </td>
                          <td>
                            {formatIndianCurrencyWithDecimals(
                              Number(r.sgst) || 0
                            )}
                          </td>
                        </>
                      )}
                      {hasPreGST && (
                        <>
                          <td>
                            {formatIndianCurrencyWithDecimals(
                              Number(r.krishiKalyanCess) || 0
                            )}
                          </td>
                          <td>
                            {formatIndianCurrencyWithDecimals(
                              Number(r.serviceTax) || 0
                            )}
                          </td>
                          <td>
                            {formatIndianCurrencyWithDecimals(
                              Number(r.swatchBharatCess) || 0
                            )}
                          </td>
                        </>
                      )}
                      <td>
                        {formatIndianCurrencyWithDecimals(
                          Number(r.totalAmount)
                        )}
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td colSpan={calculateTotalColSpan()}>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>
                      {formatIndianCurrencyWithDecimals(
                        validReceipts.reduce(
                          (a: number, r: Item) => a + Number(r.amount),
                          0
                        )
                      )}
                    </strong>
                  </td>
                  {hasPostGST && (
                    <>
                      <td>
                        <strong>
                          {formatIndianCurrencyWithDecimals(
                            validReceipts.reduce(
                              (a: number, r: Item) => a + (Number(r.cgst) || 0),
                              0
                            )
                          )}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {formatIndianCurrencyWithDecimals(
                            validReceipts.reduce(
                              (a: number, r: Item) => a + (Number(r.sgst) || 0),
                              0
                            )
                          )}
                        </strong>
                      </td>
                    </>
                  )}
                  {hasPreGST && (
                    <>
                      <td>
                        <strong>
                          {formatIndianCurrencyWithDecimals(
                            validReceipts.reduce(
                              (a: number, r: Item) =>
                                a + (Number(r.krishiKalyanCess) || 0),
                              0
                            )
                          )}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {formatIndianCurrencyWithDecimals(
                            validReceipts.reduce(
                              (a: number, r: Item) =>
                                a + (Number(r.serviceTax) || 0),
                              0
                            )
                          )}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {formatIndianCurrencyWithDecimals(
                            validReceipts.reduce(
                              (a: number, r: Item) =>
                                a + (Number(r.swatchBharatCess) || 0),
                              0
                            )
                          )}
                        </strong>
                      </td>
                    </>
                  )}
                  <td>
                    <strong>
                      {formatIndianCurrencyWithDecimals(
                        validReceipts.reduce(
                          (a: number, r: Item) => a + Number(r.totalAmount),
                          0
                        )
                      )}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.amountInWords}>
            <strong>
              Amount in words: {numberToWords(totalAmount).toUpperCase()} ONLY
            </strong>
          </div>

          <div className={styles.signature}>
            <p>For HORIZON ANANT</p>
            <p className={styles.authorized}>Authorised Signatory</p>
          </div>

          <div className={styles.terms}>
            <ul>
              <li>With tax as per Govt. rule</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`${styles.noPrint} noPrint`}>
        <button onClick={handlePrint} className={styles.printButton}>
          Print
        </button>
        <button onClick={handleDownloadPDF} className={styles.printButton}>
          Download PDF
        </button>
      </div>
    </>
  );
};

export default Page;
