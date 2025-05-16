"use client";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import { createTower } from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Tower name is required"),
  floorCount: Yup.number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? NaN : Number(originalValue)
    )
    .required("Floor count is required")
    .min(1, "Floor count must be at least 1"),
});

const Page = () => {
  const [loading, setLoading] = useState(false); // NEW
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");

  const handleSubmit = async (
    values: { name: string; floorCount: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    if (!rera) {
      toast.error("RERA number missing from URL");
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await createTower(
        rera,
        Number(values.floorCount),
        values.name
      );

      if (response?.error === false) {
        toast.success("Tower created successfully!");
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
      setLoading(false); // End loading
    }
  };
  const new_tower = [
    { name: "Home", href: "/org-admin" },
    { name: "Societies", href: "/org-admin/society" },
    { name: "Towers", href: `/org-admin/society/tower?rera=${rera}` },

    { name: "New Tower" },
  ];
  return (
    <div>
      <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
        <CustomBreadcrumbs items={new_tower} />
      </div>

      <div className={`container ${styles.container}`}>
        <h1>Create Tower</h1>

        <Formik
          initialValues={{ name: "", floorCount: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className={`form ${styles.form}`}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Tower Name</label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className={styles.form_control}
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-danger"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="floorCount">Floor Count</label>
                <Field
                  type="number"
                  id="floorCount"
                  name="floorCount"
                  min="1"
                  className={styles.form_control}
                />
                <ErrorMessage
                  name="floorCount"
                  component="p"
                  className="text-danger"
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Page;
