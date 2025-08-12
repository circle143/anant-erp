"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import styles from "./page.module.scss";
import { addSaleReceipt } from "@/redux/action/org-admin";
import { useRouter } from "next/navigation";

const modeOptions = [
  { value: "online", label: "Online" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "demand-draft", label: "Demand Draft" },
  { value: "adjustment", label: "Adjustment" },
];

const validationSchema = Yup.object().shape({
  receiptNumber: Yup.string().required("Receipt number is required"),
  totalAmount: Yup.number()
    .required("Total amount is required")
    .positive("Amount must be positive"),
  mode: Yup.string()
    .oneOf(["online", "cash", "cheque", "demand-draft", "adjustment"])
    .required("Mode is required"),
  dateIssued: Yup.string().required("Date issued is required"),
  
  gstRate: Yup.string().when("dateIssued", {
    is: (date: string) => new Date(date) >= new Date("2017-07-01"),
    then: (schema) =>
      schema.oneOf(["5", "1"], "Select a GST rate").required("GST Rate is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  ServiceTax: Yup.number().when("dateIssued", {
    is: (date: string) => new Date(date) < new Date("2017-07-01"),
    then: (schema) => schema.required("Service Tax is required").min(0),
    otherwise: (schema) => schema.notRequired(),
  }),
  SwatchBharatCess: Yup.number().when("dateIssued", {
    is: (date: string) => new Date(date) < new Date("2017-07-01"),
    then: (schema) => schema.required("Swatch Bharat Cess is required").min(0),
    otherwise: (schema) => schema.notRequired(),
  }),
  KrishiKalyanCess: Yup.number().when("dateIssued", {
    is: (date: string) => new Date(date) < new Date("2017-07-01"),
    then: (schema) => schema.required("Krishi Kalyan Cess is required").min(0),
    otherwise: (schema) => schema.notRequired(),
  }),

  bankName: Yup.string().when("mode", {
    is: (val: unknown): val is string =>
      typeof val === "string" &&
      ["online", "cheque", "demand-draft"].includes(val),
    then: (schema) => schema.required("Bank name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  transactionNumber: Yup.string().when("mode", {
    is: (val: unknown): val is string =>
      typeof val === "string" &&
      ["online", "cheque", "demand-draft"].includes(val),
    then: (schema) => schema.required("Transaction number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});


interface CreateReceiptFormProps {
  rera: string;
  saleId: string;
  towerId?: string;
  onSuccess: () => void;
}

const CreateReceiptForm: React.FC<CreateReceiptFormProps> = ({
  rera,
  saleId,
  towerId,
  onSuccess,
}) => {
  const router = useRouter();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {

     const isGSTDate = new Date(values.dateIssued) >= new Date("2017-07-01");

    const response = await addSaleReceipt(
      values.receiptNumber,
      rera,
      saleId,
      Number(values.totalAmount),
      values.mode,
      values.dateIssued,
      isGSTDate ? Number(values.gstRate) : undefined, // GST if applicable
      values.bankName || undefined,
      values.transactionNumber || undefined,
      !isGSTDate ? Number(values.ServiceTax) || 0 : undefined, // Service Tax if applicable
      !isGSTDate ? Number(values.SwatchBharatCess) || 0 : undefined,
      !isGSTDate ? Number(values.KrishiKalyanCess) || 0 : undefined
    );

      if (response?.error === false) {
        toast.success("Receipt created successfully!");
        onSuccess();
      } else {
        toast.error(response?.message || "Failed to create receipt.");
      }
    } catch (error) {
      console.error("Add receipt error:", error);
      toast.error("Unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        receiptNumber: "",
        totalAmount: "",
        mode: "",
        dateIssued: "",
        bankName: "",
        transactionNumber: "",
        gstRate:"5", 
          ServiceTax: "",
    SwatchBharatCess: "",
    KrishiKalyanCess: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values }) => (
        <Form className={styles.form}>
          <h2 className={styles.formHeading}>Create New Receipt</h2>

          <div className={styles.formGroup}>
            <label htmlFor="receiptNumber">Receipt Number</label>
            <Field
              name="receiptNumber"
              type="text"
              className={styles.formControl}
            />
            <ErrorMessage
              name="receiptNumber"
              component="p"
              className={styles.error}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="totalAmount">Total Amount</label>
            <Field
              name="totalAmount"
              type="number"
              className={styles.formControl}
            />
            <ErrorMessage
              name="totalAmount"
              component="p"
              className={styles.error}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="mode">Mode</label>
            <Field as="select" name="mode" className={styles.formControl}>
              <option value="">Select mode</option>
              {modeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Field>
            <ErrorMessage name="mode" component="p" className={styles.error} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dateIssued">Date Issued</label>
            <Field
              name="dateIssued"
              type="date"
              className={styles.formControl}
            />
            <ErrorMessage
              name="dateIssued"
              component="p"
              className={styles.error}
            />
          </div>

          {/* GST Rate Radio Buttons */}
          {/* GST Rate or Old Tax Fields */}
{values.dateIssued && new Date(values.dateIssued) <= new Date("2017-07-01") ? (
    <>
    <div className={styles.formGroup}>
      <label htmlFor="ServiceTax">Service Tax</label>
      <Field
        name="ServiceTax"
        type="number"
        className={styles.formControl}
      />
      <ErrorMessage name="ServiceTax" component="p" className={styles.error} />
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="SwatchBharatCess">Swatch Bharat Cess</label>
      <Field
        name="SwatchBharatCess"
        type="number"
        className={styles.formControl}
      />
      <ErrorMessage
        name="SwatchBharatCess"
        component="p"
        className={styles.error}
      />
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="KrishiKalyanCess">Krishi Kalyan Cess</label>
      <Field
        name="KrishiKalyanCess"
        type="number"
        className={styles.formControl}
      />
      <ErrorMessage
        name="KrishiKalyanCess"
        component="p"
        className={styles.error}
      />
    </div>
  </>


) : (
    <div className={styles.formGroup}>
    <label>GST Rate</label>
    <div className={styles.radioGroup}>
      <label>
        <Field type="radio" name="gstRate" value="1" />
        1%
      </label>
      <label>
        <Field type="radio" name="gstRate" value="5" />
        5%
      </label>
    </div>
    <ErrorMessage name="gstRate" component="p" className={styles.error} />
  </div>
)}


          {["online", "cheque", "demand-draft"].includes(values.mode) && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="bankName">Bank Name</label>
                <Field
                  name="bankName"
                  type="text"
                  className={styles.formControl}
                />
                <ErrorMessage
                  name="bankName"
                  component="p"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="transactionNumber">Transaction Number</label>
                <Field
                  name="transactionNumber"
                  type="text"
                  className={styles.formControl}
                />
                <ErrorMessage
                  name="transactionNumber"
                  component="p"
                  className={styles.error}
                />
              </div>
            </>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Create Receipt"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default CreateReceiptForm;
