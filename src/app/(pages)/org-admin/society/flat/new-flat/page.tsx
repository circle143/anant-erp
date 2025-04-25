"use client";
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import { createFlat } from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const validationSchema = Yup.object({
  tower: Yup.string().required("Tower is required"),
  flatType: Yup.string().required("Flat Type is required"),
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  floorNumber: Yup.number()
    .required("Floor Number is required")
    .min(0, "Floor number must be at least 0"),
});

const Page = () => {
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");

  const handleSubmit = async (
    values: {
      tower: string;
      flatType: string;
      name: string;
      floorNumber: number;
    },
    { resetForm }: { resetForm: () => void }
  ) => {
    if (!rera) {
      toast.error("RERA number missing from URL");
      return;
    }

    const response = await createFlat(
      rera,
      values.tower,
      values.flatType,
      values.name,
      values.floorNumber
    );

    if (response?.error === false) {
      toast.success("Flat created successfully!");
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
      <h1>Create Flat</h1>
      <Formik
        initialValues={{ tower: "", flatType: "", name: "", floorNumber: 0 }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className={`form ${styles.form}`}>
            <div className={styles.formGroup}>
              <label htmlFor="tower">Tower ID</label>
              <Field
                type="text"
                id="tower"
                name="tower"
                className={styles.form_control}
              />
              <ErrorMessage
                name="tower"
                component="p"
                className="text-danger"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="flatType">Flat Type ID</label>
              <Field
                type="text"
                id="flatType"
                name="flatType"
                className={styles.form_control}
              />
              <ErrorMessage
                name="flatType"
                component="p"
                className="text-danger"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name">Flat Name</label>
              <Field
                type="text"
                id="name"
                name="name"
                className={styles.form_control}
              />
              <ErrorMessage name="name" component="p" className="text-danger" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="floorNumber">Floor Number</label>
              <Field
                type="number"
                id="floorNumber"
                name="floorNumber"
                className={styles.form_control}
              />
              <ErrorMessage
                name="floorNumber"
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
