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
import autoTable from "jspdf-autotable";

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
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;

    // Helper function to replace ₹ with Rs.
    const formatCurrency = (value: number | string) => {
      return formatIndianCurrencyWithDecimals(Number(value) || 0).replace(
        "₹",
        "Rs."
      );
    };

    // Header - Company Name
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(formData.name || "Mangalya Group", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 8;

    // Address and contact info
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      "Address: GH-9, Sector 11, Vrindavan Colony, Lucknow, Uttar Pradesh 226012",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    yPos += 5;
    pdf.text("Ph: 0120-4229777", pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
    pdf.text(
      "GSTIN: 09AACCH6839F1ZE | CIN No.: U70109DL2013PTC251321",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    yPos += 5;
    pdf.text(
      "Web: www.novenagreen.com | Email: info@novenagreen.com",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    yPos += 10;

    // Draw a line
    pdf.setDrawColor(200);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // Customer Info
    pdf.setFontSize(11);
    const leftCol = margin;
    const valueCol = margin + 40;

    pdf.setFont("helvetica", "bold");
    pdf.text("Receipt No:", leftCol, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(receiptNo || "N/A", valueCol, yPos);
    yPos += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Member ID:", leftCol, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(saleNumber || "N/A", valueCol, yPos);
    yPos += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Customer Name:", leftCol, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(name || "N/A", valueCol, yPos);
    yPos += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Address:", leftCol, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(address || "N/A", valueCol, yPos);
    yPos += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Mobile:", leftCol, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(phone || "N/A", valueCol, yPos);
    yPos += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Date:", leftCol, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(date || "N/A", valueCol, yPos);
    yPos += 10;

    // Summary paragraph - with proper text wrapping
    pdf.setFontSize(10);
    const projectName = SocietyFlatData?.name || "";
    const projectAddress = SocietyFlatData?.address || "";

    const summaryText = `A sum of ${formatCurrency(total)} (${numberToWords(
      total
    ).toUpperCase()} ONLY) received for Flat No. ${plotNo} with Salable Area ${superArea} Sq.Ft. on ${floor}th floor at Tower no. ${tower}${
      projectName ? ` in project ${projectName}` : ""
    }${projectAddress ? ` located at ${projectAddress}` : ""}.`;

    const maxWidth = pageWidth - margin * 2;
    const splitSummary = pdf.splitTextToSize(summaryText, maxWidth);
    pdf.text(splitSummary, margin, yPos);
    yPos += splitSummary.length * 5 + 10;

    // Table headers
    const tableHeaders: string[] = [
      "S.No",
      "Mode",
      "Instrument Date",
      "Status",
      "Amount",
    ];
    if (showGSTGroup) {
      tableHeaders.push("CGST", "SGST");
    }
    if (showOtherTaxesGroup) {
      tableHeaders.push("KK Cess", "Service Tax", "SB Cess");
    }
    tableHeaders.push("Total");

    // Table data
    const tableData: string[][] = [
      [
        "1",
        mode || "N/A",
        receiptData.instrumentDate || "N/A",
        status || "N/A",
        formatCurrency(amount),
      ],
    ];

    if (showGSTGroup) {
      tableData[0].push(formatCurrency(cgst), formatCurrency(sgst));
    }
    if (showOtherTaxesGroup) {
      tableData[0].push(
        formatCurrency(krishiKalyanCess),
        formatCurrency(serviceTax),
        formatCurrency(swatchBharatCess)
      );
    }
    tableData[0].push(formatCurrency(total));

    // Generate table
    autoTable(pdf, {
      head: [tableHeaders],
      body: tableData,
      startY: yPos,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
      },
      theme: "grid",
      tableWidth: "auto",
    });

    // Get final Y position after table
    yPos = (pdf as any).lastAutoTable.finalY + 20;

    // Signature
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text("For HORIZON ANANT", pageWidth - margin - 45, yPos);
    yPos += 12;
    pdf.setFont("helvetica", "bold");
    pdf.text("Authorised Signatory", pageWidth - margin - 45, yPos);
    yPos += 15;

    // Terms
    pdf.setDrawColor(200);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");

    const terms = [
      "• This receipt is subject to realization of cheque/draft.",
      "• The receipts are not transferable without written consent of the company.",
      "• This is only the receipt for the remittance and does not entitle ownership unless confirmed by the company.",
    ];

    terms.forEach((term) => {
      const splitTerm = pdf.splitTextToSize(term, maxWidth);
      pdf.text(splitTerm, margin, yPos);
      yPos += splitTerm.length * 4 + 2;
    });

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
              A sum of
              <strong>{formatIndianCurrencyWithDecimals(total)}</strong> (
              <strong>{numberToWords(total).toUpperCase()} ONLY</strong>)
              received for Flat No. <strong>{plotNo}</strong> with Salable Area
              <strong>{superArea} Sq.Ft.</strong> on
              <strong>{floor}th floor</strong> at Tower no.
              <strong>{tower}</strong> in project
              <strong>
                {SocietyFlatData?.name} located at {SocietyFlatData?.address}
              </strong>
              .
            </p>
          </div>

          <table
            className={styles.receiptTable}
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #000",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  S.No
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Mode
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Instrument Date
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Amount
                </th>
                {showGSTGroup && (
                  <>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      CGST
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      SGST
                    </th>
                  </>
                )}
                {showOtherTaxesGroup && (
                  <>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      Krishi Kalyan Cess
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      Service Tax
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      Swatch Bharat Cess
                    </th>
                  </>
                )}
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  1
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {mode}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {receiptData.instrumentDate}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {status}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {formatIndianCurrencyWithDecimals(amount || 0)}
                </td>
                {showGSTGroup && (
                  <>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {formatIndianCurrencyWithDecimals(Number(cgst) || 0)}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {formatIndianCurrencyWithDecimals(Number(sgst) || 0)}
                    </td>
                  </>
                )}
                {showOtherTaxesGroup && (
                  <>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {formatIndianCurrencyWithDecimals(
                        Number(krishiKalyanCess) || 0
                      )}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {formatIndianCurrencyWithDecimals(
                        Number(serviceTax) || 0
                      )}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {formatIndianCurrencyWithDecimals(
                        Number(swatchBharatCess) || 0
                      )}
                    </td>
                  </>
                )}
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {formatIndianCurrencyWithDecimals(total || 0)}
                </td>
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
