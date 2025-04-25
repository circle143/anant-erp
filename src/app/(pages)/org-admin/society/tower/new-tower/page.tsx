"use client";
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import { createTower } from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Tower name is required"),
  floorCount: Yup.number()
    .required("Floor count is required")
    .min(1, "Floor count must be at least 1"),
});

const Page = () => {
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");

  const handleSubmit = async (
    values: { name: string; floorCount: number },
    { resetForm }: { resetForm: () => void }
  ) => {
    if (!rera) {
      toast.error("RERA number missing from URL");
      return;
    }

    const response = await createTower(rera, values.floorCount, values.name);

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
  };

  return (
    <div className={`container ${styles.container}`}>
      <h1>Create Tower</h1>
      <Formik
        initialValues={{ name: "", floorCount: 1 }}
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
              <ErrorMessage name="name" component="p" className="text-danger" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="floorCount">Floor Count</label>
              <Field
                type="number"
                id="floorCount"
                name="floorCount"
                className={styles.form_control}
              />
              <ErrorMessage
                name="floorCount"
                component="p"
                className="text-danger"
              />
            </div>

            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Page;
