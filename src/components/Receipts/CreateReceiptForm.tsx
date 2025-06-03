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
  totalAmount: Yup.number()
    .required("Total amount is required")
    .positive("Amount must be positive"),

  mode: Yup.string()
    .oneOf(["online", "cash", "cheque", "demand-draft", "adjustment"])
    .required("Mode is required"),

  dateIssued: Yup.string().required("Date issued is required"),

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
  towerId?: string; // Optional if needed in the future
}

const CreateReceiptForm: React.FC<CreateReceiptFormProps> = ({
  rera,
  saleId,
  towerId, // Optional if needed in the future
}) => {
  const router = useRouter();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const response = await addSaleReceipt(
        rera,
        saleId,
        values.totalAmount,
        values.mode,
        values.dateIssued,
        values.bankName,
        values.transactionNumber
      );

      if (response?.error === false) {
  toast.success("Receipt created successfully!");
  if (towerId) {
    router.push(
      `/org-admin/society/towers/flats?rera=${rera}&saleId=${saleId}&towerId=${towerId}`
    );
  } else {
    router.push(
      `/org-admin/society/flats?rera=${rera}&saleId=${saleId}`
    );
  }
}

 else {
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
        totalAmount: "",
        mode: "",
        dateIssued: "",
        bankName: "",
        transactionNumber: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values }) => (
        <Form className={styles.form}>
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
