"use client";

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./society.module.scss";
import toast from "react-hot-toast";

// Validation Schema
const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Society name must be at least 3 characters")
    .required("Society name is required"),
  Rera: Yup.string()
    .min(5, "RERA must be at least 5 characters")
    .required("RERA number is required"),
});

const Society = () => {
  const handleSubmit = (
    values: { name: string; Rera: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    console.log("Form Submitted:", values);
    toast.success("Society submitted successfully!");
    resetForm();
  };
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className={`container ${styles.container}`}>
      <h1>Society</h1>

      <Formik
        initialValues={{ name: "", Rera: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className={styles.formsection}>
            <div className={styles.image_upload}>
              <label htmlFor="imageUpload" className={styles.image_label}>
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className={styles.preview_img}
                  />
                ) : (
                  <span>+</span>
                )}
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.file_input}
                />
              </label>
            </div>

            <div className={styles.form_group}>
              <label htmlFor="name">Society Name</label>
              <Field
                type="text"
                id="name"
                name="name"
                className={styles.form_control}
              />
              <ErrorMessage
                name="name"
                component="p"
                className={styles["text-danger"]}
              />
            </div>

            <div className={styles.form_group}>
              <label htmlFor="Rera">Rera Number</label>
              <Field
                type="text"
                id="Rera"
                name="Rera"
                className={styles.form_control}
              />
              <ErrorMessage
                name="Rera"
                component="p"
                className={styles["text-danger"]}
              />
            </div>

            <button type="submit" className={styles.button}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Society;
