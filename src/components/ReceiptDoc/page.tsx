"use client";
import React, { useRef,useEffect,useState } from "react";
import styles from "./page.module.scss";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { numberToWords } from "@/utils/numberToWords"; // Ensure this utility is available
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useSearchParams } from "next/navigation";
import {
    getSelf,
    updateOrganizationDetails,
} from "../../redux/action/org-admin";
import { getUrl, uploadData } from "aws-amplify/storage";
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
        project,
        plotNo,
        bankName,
        instrumentDate,
        status,
        mode,
    } = receiptData;

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
        pdf.save(`receipt_${receiptNo}.pdf`);

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
      const [formData, setFormData] = useState({
        name: "",
        gst: "",
        logo: "",
        file: null as File | null,
    });
 const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true)
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
      if (loading) {
    return <Loader />;
  }
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
                        <h1>{formData.name}</h1>
                        <p>
                            Address: GH-9, Sector 11, Vrindavan Colony, Lucknow, Uttar Pradesh 226012
                        </p>
                        <p>Ph: 0120-4229777</p>
                        <p>
                            GSTIN: 09AACCH6839F1ZE | CIN No.:
                            U70109DL2013PTC251321
                        </p>
                        <p>
                            Web: www.novenagreen.com | Email:
                            info@novenagreen.com
                        </p>
                    </div>

                    <div className={styles.customerInfo}>
                        <p>
                            <strong>Receipt No:</strong> {receiptNo}
                        </p>
                        {/* <p>
                            <strong>
                                {customerId.includes(",")
                                    ? "Owner ID(s)"
                                    : "Customer ID"}
                                :
                            </strong>{" "}
                            {customerId}
                        </p> */}
                        <p>
                            <strong>Member ID:</strong> {saleNumber}
                        </p>
                        <p>
                            <strong>
                                {customerId.includes(",")
                                    ? "Owner(s)"
                                    : "Customer Name"}
                                :
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
                            <strong>
                                {formatIndianCurrencyWithDecimals(total)}
                            </strong>{" "}
                            (
                            <strong>
                                {numberToWords(total).toUpperCase()} ONLY
                            </strong>
                            ) received for Flat No. <strong>{plotNo}</strong>{" "}
                            with Salable Area{" "}
                            <strong>{superArea} Sq.Ft.</strong> on{" "}
                            <strong>{floor}th floor</strong> at Tower no.{" "}
                            <strong>{tower}</strong> in project{" "}
                            <strong>
                                {SocietyFlatData?.name} located at{" "}
                                {SocietyFlatData?.address}
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
                                <th>Bank</th>
                                <th>Amount</th>
                                <th>CGST</th>
                                <th>SGST</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>{mode}</td>
                                <td>{instrumentDate}</td>
                                <td>{status}</td>
                                <td>{bankName}</td>
                                <td>
                                    {formatIndianCurrencyWithDecimals(amount)}
                                </td>
                                <td>
                                    {formatIndianCurrencyWithDecimals(cgst)}
                                </td>
                                <td>
                                    {formatIndianCurrencyWithDecimals(sgst)}
                                </td>
                                <td>
                                    {formatIndianCurrencyWithDecimals(total)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className={styles.signature}>
                        <p>For DSD HOMES PVT. LTD.</p>
                        <p className={styles.authorized}>
                            Authorised Signatory
                        </p>
                    </div>

                    <div className={styles.terms}>
                        <ul>
                            <li>
                                This receipt is subject to realization of
                                cheque/draft.
                            </li>
                            <li>
                                The receipts are not transferable without
                                written consent of the company.
                            </li>
                            <li>
                                This is only the receipt for the remittance and
                                does not entitle ownership unless confirmed by
                                the company.
                            </li>
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
