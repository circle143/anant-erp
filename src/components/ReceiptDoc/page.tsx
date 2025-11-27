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

interface ReceiptData {
  saleNumber: string;
  rera: string;
  receiptNo: string;
  customerId: string;
  name: string;
  address: string;
  phone: string;
  date: string;
  amount: number;
  cgst: number;
  sgst: number;
  total: number;
  superArea: number;
  floor: string;
  tower: string;
  project: string;
  plotNo: string;
  bankName: string;
  instrumentDate: string;
  status: string;
  mode: string;
  krishiKalyanCess: string;
  serviceTax: string;
  swatchBharatCess: string;
}

interface PageProps {
  receiptData: ReceiptData;
  onClose: () => void;
}

const Page: React.FC<PageProps> = ({ receiptData, onClose }) => {
  const {
    receiptNo,
    saleNumber,
    customerId,
    name,
    address,
    phone,
    date,
    amount,
    cgst,
    sgst,
    total,
    superArea,
    floor,
    tower,
    plotNo,
    status,
    mode,
    krishiKalyanCess,
    serviceTax,
    swatchBharatCess,
  } = receiptData;

  const receiptRef = useRef<HTMLDivElement>(null);
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
              options: {
                validateObjectExistence: true,
                expiresIn: 3600,
              },
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

  // ==============================
  // PRINT FUNCTIONALITY
  // ==============================
  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups for this website to use the print feature.");
      return;
    }

    let styleTags = "";
    Array.from(document.styleSheets).forEach((styleSheet) => {
      try {
        if (styleSheet.cssRules) {
          let cssText = "";
          for (let i = 0; i < styleSheet.cssRules.length; i++) {
            cssText += styleSheet.cssRules[i].cssText;
          }
          styleTags += `<style>${cssText}</style>`;
        } else if (styleSheet.href) {
          styleTags += `<link rel="stylesheet" href="${styleSheet.href}">`;
        }
      } catch (e) {
        console.warn("Could not access stylesheet:", e);
      }
    });

    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receiptNo}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${styleTags}
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: white !important; color: black !important; }
            .noPrint { display: none !important; }
            .receiptContainer { width: 100%; padding: 10px; background: white !important; color: black !important; }
            .receiptTable { width: 100%; font-size: 10px; border-collapse: collapse; }
            .receiptTable th, .receiptTable td { border: 1px solid black; padding: 4px; text-align: center; }
            .receiptTable th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact !important; }
          </style>
        </head>
        <body>${printContent.outerHTML}</body>
      </html>
    `;

    printWindow.document.write(printDocument);
    printWindow.document.close();

    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  // ==============================
  // PDF DOWNLOAD FUNCTIONALITY (FIXED FULL-PAGE)
  // ==============================
  const handleDownloadPDF = async () => {
    const input = receiptRef.current;
    if (!input) return;

    // Hide noPrint elements
    const noPrintElements = input.querySelectorAll(".noPrint");
    noPrintElements.forEach(
      (el) => ((el as HTMLElement).style.display = "none")
    );

    // Add temporary export class
    input.classList.add("pdfExport");

    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(input, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollY: 0,
    });

    // Restore
    input.classList.remove("pdfExport");
    noPrintElements.forEach((el) => ((el as HTMLElement).style.display = ""));

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    const pdfWidthPx = (pageWidth * 96) / 25.4;
    const pdfHeightPx = (pageHeight * 96) / 25.4;

    // Fit within A4
    const ratio = Math.min(pdfWidthPx / imgWidthPx, pdfHeightPx / imgHeightPx);

    const renderWidth = imgWidthPx * ratio;
    const renderHeight = imgHeightPx * ratio;

    // ✅ Force the content to start from top (remove top padding)
    const offsetX = (pdfWidthPx - renderWidth) / 2;
    const offsetY = 0; // 👈 Force to top edge

    // Convert to mm
    const renderWidthMM = (renderWidth * 25.4) / 96;
    const renderHeightMM = (renderHeight * 25.4) / 96;
    const offsetXMM = (offsetX * 25.4) / 96;

    pdf.addImage(imgData, "PNG", offsetXMM, 0, renderWidthMM, renderHeightMM);
    pdf.save(`receipt_${receiptNo}.pdf`);
  };

  // ==============================
  // JSX RENDER
  // ==============================
  const showGSTGroup =
    cgst !== undefined &&
    sgst !== undefined &&
    !isNaN(Number(cgst)) &&
    !isNaN(Number(sgst));

  const showOtherTaxesGroup =
    krishiKalyanCess || serviceTax || swatchBharatCess;

  return (
    <>
      <div className={styles.overlay}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div ref={receiptRef} className={styles.receiptContainer}>
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
              <strong>Receipt No:</strong> {receiptNo}
            </p>
            <p>
              <strong>Member ID:</strong> {saleNumber}
            </p>
            <p>
              <strong>
                {customerId.includes(",") ? "Owner(s)" : "Customer Name"}:
              </strong>{" "}
              {name}
            </p>
            <p>
              <strong>Address:</strong> {address}
            </p>
            <p>
              <strong>Mobile:</strong> {phone}
            </p>
            <p>
              <strong>Date:</strong> {date}
            </p>
          </div>

          <div className={styles.summary}>
            <p>
              A sum of{" "}
              <strong>{formatIndianCurrencyWithDecimals(total)}</strong> (
              <strong>{numberToWords(total).toUpperCase()} ONLY</strong>)
              received for Flat No. <strong>{plotNo}</strong> with Salable Area{" "}
              <strong>{superArea} Sq.Ft.</strong> on{" "}
              <strong>{floor}th floor</strong> at Tower no.{" "}
              <strong>{tower}</strong> in project{" "}
              <strong>
                {SocietyFlatData?.name} located at {SocietyFlatData?.address}
              </strong>
              .
            </p>
          </div>

          <table className={styles.receiptTable}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Mode</th>
                <th>Instrument Date</th>
                <th>Status</th>
                <th>Amount</th>
                {showGSTGroup && (
                  <>
                    <th>CGST</th>
                    <th>SGST</th>
                  </>
                )}
                {showOtherTaxesGroup && (
                  <>
                    <th>Krishi Kalyan Cess</th>
                    <th>Service Tax</th>
                    <th>Swatch Bharat Cess</th>
                  </>
                )}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>{mode}</td>
                <td>{receiptData.instrumentDate}</td>
                <td>{status}</td>
                <td>{formatIndianCurrencyWithDecimals(amount || 0)}</td>
                {showGSTGroup && (
                  <>
                    <td>
                      {formatIndianCurrencyWithDecimals(Number(cgst) || 0)}
                    </td>
                    <td>
                      {formatIndianCurrencyWithDecimals(Number(sgst) || 0)}
                    </td>
                  </>
                )}
                {showOtherTaxesGroup && (
                  <>
                    <td>
                      {formatIndianCurrencyWithDecimals(
                        Number(krishiKalyanCess) || 0
                      )}
                    </td>
                    <td>
                      {formatIndianCurrencyWithDecimals(
                        Number(serviceTax) || 0
                      )}
                    </td>
                    <td>
                      {formatIndianCurrencyWithDecimals(
                        Number(swatchBharatCess) || 0
                      )}
                    </td>
                  </>
                )}
                <td>{formatIndianCurrencyWithDecimals(total || 0)}</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.signature}>
            <p>For HORIZON ANANT</p>
            <p className={styles.authorized}>Authorised Signatory</p>
          </div>

          <div className={styles.terms}>
            <ul>
              <li>This receipt is subject to realization of cheque/draft.</li>
              <li>
                The receipts are not transferable without written consent of the
                company.
              </li>
              <li>
                This is only the receipt for the remittance and does not entitle
                ownership unless confirmed by the company.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.noPrint}>
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
