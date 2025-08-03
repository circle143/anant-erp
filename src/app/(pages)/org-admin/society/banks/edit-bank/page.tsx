"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import styles from "./page.module.scss";
import { updateBankDetails } from "@/redux/action/org-admin";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";

// Validation Schema
const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  accountNumber: Yup.string()
    .matches(/^[0-9]{9,18}$/, "Invalid account number")
    .required("Account number is required"),
});

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera") || "";
  const id = searchParams.get("id") || "";
  const name = searchParams.get("name") || "";
  const accountNumber = searchParams.get("accountNumber") || "";

  const breadcrumbs = [
    { name: "Home", href: "/org-admin" },
    { name: "Societies", href: "/org-admin/society" },
    {
      name: "Banks",
      href: `/org-admin/society/banks?rera=${rera}`,
    },
    { name: "Edit Bank" },
  ];

  const handleSubmit = async (
    values: {
      name: string;
      accountNumber: string;
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const response = await updateBankDetails(
        rera,
        id,
        values.name,
        values.accountNumber
      );

      if (response?.error === false) {
        toast.success("Bank updated successfully!");
        router.push(`/org-admin/society/banks?rera=${rera}`);
      } else {
        const message =
          response?.response?.data?.message ||
          response?.message ||
          "Failed to update bank.";
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
        <h1>Edit Bank</h1>
        <Formik
          initialValues={{ name, accountNumber }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Bank Name</label>
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
                <label htmlFor="accountNumber">Account Number</label>
                <Field
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  className={styles.formControl}
                />
                <ErrorMessage
                  name="accountNumber"
                  component="p"
                  className={styles.error}
                />
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Bank"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Page;
