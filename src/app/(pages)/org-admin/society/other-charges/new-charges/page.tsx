"use client";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { createOtherCharge } from "@/redux/action/org-admin";

const validationSchema = Yup.object({
  summary: Yup.string().required("Summary is required"),
  price: Yup.number()
   
    .required("Price is required")
    .min(1, "Price must be at least 1"),
  advanceMonths: Yup.number().when("recurring", {
    is: true,
    then: (schema) =>
      schema
        .required("Advance months required for recurring charges")
        .min(1, "Minimum 1 month"),
    otherwise: (schema) => schema.notRequired().default(0),
  }),
});

const Page = () => {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");

  const handleSubmit = async (
    values: {
      summary: string;
      price: number;
      recurring: boolean;
      optional: boolean;
      fixed: boolean;
      advanceMonths: number;
    },
    { resetForm }: { resetForm: () => void }
  ) => {
    if (!rera) {
      toast.error("RERA number missing from URL");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        summary: values.summary,
        price: values.price,
        recurring: values.recurring,
        optional: values.optional,
        fixed: values.fixed,
        advanceMonths: values.recurring ? values.advanceMonths : 0,
      };

      const response = await createOtherCharge(rera, payload);

      if (response?.error === false) {
        toast.success("Other charge created successfully!");
        resetForm();
      } else {
        const errorMessage =
          response?.response?.data?.message ||
          response?.message ||
          "Something went wrong";
        toast.error(errorMessage);
        console.error("API Error:", errorMessage);
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles.container}`}>
      <h1>Create Other Charge</h1>
      <Formik
        initialValues={{
          summary: "",
          price: 0,
          recurring: false,
          optional: false,
          fixed: false,
          advanceMonths: 0,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values }) => (
          <Form className={`form ${styles.form}`}>
            <div className={styles.formGroup}>
              <label htmlFor="summary">Summary</label>
              <Field
                type="text"
                id="summary"
                name="summary"
                className={styles.form_control}
              />
              <ErrorMessage
                name="summary"
                component="p"
                className="text-danger"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Price</label>
              <Field
                type="number"
                id="price"
                name="price"
                className={styles.form_control}
                min="0"
                step="0.01"
              />
              <ErrorMessage
                name="price"
                component="p"
                className="text-danger"
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <Field type="checkbox" name="recurring" />
                &nbsp;Recurring
              </label>
            </div>

            {values.recurring && (
              <div className={styles.formGroup}>
                <label htmlFor="advanceMonths">Advance Months</label>
                <Field
                  type="number"
                  id="advanceMonths"
                  name="advanceMonths"
                  className={styles.form_control}
                  min="1"
                />
                <ErrorMessage
                  name="advanceMonths"
                  component="p"
                  className="text-danger"
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label>
                <Field type="checkbox" name="optional" />
                &nbsp;Optional
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                <Field type="checkbox" name="fixed" />
                &nbsp;Fixed
              </label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Page;
