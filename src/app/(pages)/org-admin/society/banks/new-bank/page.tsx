"use client";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { addBank } from "@/redux/action/org-admin";

// ✅ Validation Schema
const validationSchema = Yup.object({
  name: Yup.string().required("Bank name is required"),
  accountNumber: Yup.string()
    .required("Account number is required")
    .matches(/^[0-9]{9,18}$/, "Account number must be 9 to 18 digits"),
});

const Page = () => {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");

  const handleSubmit = async (
    values: {
      name: string;
      accountNumber: string;
    },
    { resetForm }: { resetForm: () => void }
  ) => {
    if (!rera) {
      toast.error("RERA number missing from URL");
      return;
    }

    setLoading(true);

    try {
      const response = await addBank(rera, values.name, values.accountNumber);

      if (response?.error === false) {
        toast.success("Bank added successfully!");
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

  const new_bank_breadcrumb = [
    { name: "Home", href: "/org-admin" },
    { name: "Societies", href: "/org-admin/society" },
    {
      name: "Banks",
      href: `/org-admin/society/banks?rera=${rera}`,
    },
    { name: "New Bank" },
  ];

  return (
    <div>
      <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
        <CustomBreadcrumbs items={new_bank_breadcrumb} />
      </div>
      <div className={`container ${styles.container}`}>
        <h1>Create Bank</h1>
        <Formik
          initialValues={{
            name: "",
            accountNumber: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form className={`form ${styles.form}`}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Bank Name</label>
              <Field
                type="text"
                id="name"
                name="name"
                className={styles.form_control}
              />
              <ErrorMessage name="name" component="p" className="text-danger" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="accountNumber">Account Number</label>
              <Field
                type="text"
                id="accountNumber"
                name="accountNumber"
                className={styles.form_control}
              />
              <ErrorMessage
                name="accountNumber"
                component="p"
                className="text-danger"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default Page;
