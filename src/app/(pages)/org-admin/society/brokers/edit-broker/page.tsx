"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import styles from "./page.module.scss";
import { updateBrokerDetails } from "@/redux/action/org-admin";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  aadharNumber: Yup.string()
    .nullable()
    .matches(
      /^[2-9]{1}[0-9]{11}$/,
      "Invalid Aadhar format (12 digits, cannot start with 0/1)"
    ),
  panNumber: Yup.string()
    .nullable()
    .matches(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Invalid PAN format (Example: ABCDE1234F)"
    ),
});

const page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rera = searchParams.get("rera") || "";
  const id = searchParams.get("id") || "";
  const name = searchParams.get("name") || "";
  const panNumber = searchParams.get("panNumber") || "";
  const aadharNumber = searchParams.get("aadharNumber") || "";

  const breadcrumbs = [
    { name: "Home", href: "/org-admin" },
    { name: "Societies", href: "/org-admin/society" },
    {
      name: "Brokers",
      href: `/org-admin/society/brokers?rera=${rera}`,
    },
    { name: "Edit Broker" },
  ];

  const handleSubmit = async (
    values: {
      name: string;
      panNumber: string;
      aadharNumber: string;
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const response = await updateBrokerDetails(
        rera,
        id,
        values.name,
        values.panNumber,
        values.aadharNumber
      );

      if (response?.error === false) {
        toast.success("Broker updated successfully!");
        router.push(`/org-admin/society/broker?rera=${rera}`);
      } else {
        const message =
          response?.response?.data?.message ||
          response?.message ||
          "Failed to update broker.";
        toast.error(message);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
        <CustomBreadcrumbs items={breadcrumbs} />
      </div>

      <div className={`container ${styles.container}`}>
        <h1>Edit Broker</h1>
        <Formik
          initialValues={{ name, panNumber, aadharNumber }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className={styles.formControl}
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="panNumber">PAN Number</label>
                <Field
                  type="text"
                  id="panNumber"
                  name="panNumber"
                  className={styles.formControl}
                />
                <ErrorMessage
                  name="panNumber"
                  component="p"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="aadharNumber">Aadhar Number</label>
                <Field
                  type="text"
                  id="aadharNumber"
                  name="aadharNumber"
                  className={styles.formControl}
                />
                <ErrorMessage
                  name="aadharNumber"
                  component="p"
                  className={styles.error}
                />
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Broker"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default page;
