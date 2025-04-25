"use client";
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import { createFlatType } from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  type: Yup.string().required("Type is required"),
  price: Yup.number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? NaN : Number(originalValue)
    )
    .required("Price is required")
    .min(0, "Price must be at least 0"),
  area: Yup.number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? NaN : Number(originalValue)
    )
    .required("Area is required")
    .min(0, "Area must be at least 0"),
});

const Page = () => {
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");

  const handleSubmit = async (
    values: { name: string; type: string; price: string; area: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    if (!rera) {
      toast.error("RERA number missing from URL");
      return;
    }

    const response = await createFlatType(
      rera,
      values.name,
      values.type,
      Number(values.price),
      Number(values.area)
    );

    if (response?.error === false) {
      toast.success("Flat type created successfully!");
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
      <h1>Create Flat Type</h1>
      <Formik
        initialValues={{ name: "", type: "", price: "", area: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className={`form ${styles.form}`}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <Field
                type="text"
                id="name"
                name="name"
                className={styles.form_control}
              />
              <ErrorMessage name="name" component="p" className="text-danger" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="type">Type</label>
              <Field
                type="text"
                id="type"
                name="type"
                className={styles.form_control}
              />
              <ErrorMessage name="type" component="p" className="text-danger" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Price</label>
              <Field
                type="number"
                id="price"
                name="price"
                min="0"
                className={styles.form_control}
              />
              <ErrorMessage
                name="price"
                component="p"
                className="text-danger"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="area">Area</label>
              <Field
                type="number"
                id="area"
                name="area"
                min="0"
                className={styles.form_control}
                placeholder="in sqft"
              />
              <ErrorMessage name="area" component="p" className="text-danger" />
            </div>

            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Page;
