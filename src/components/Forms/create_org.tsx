"use client";
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./create-org.module.scss";
import { addOrgAdminUser } from "@/redux/action/admin";
import toast from "react-hot-toast";

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const CreateOrg = () => {
  const handleSubmit = async (
    values: { name: string; email: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    const response = await addOrgAdminUser(values.name, values.email);

    if (response?.error==false) {
      toast.success("Organization created successfully!");
    } else {
      const errorMessage =
        response?.response?.data?.message ||
        response?.message ||
        "Something went wrong";
      toast.error(errorMessage);
      console.error("API Error:", errorMessage);
    }

    resetForm(); // Clear input fields regardless of outcome
  };


  return (
    <div className={`container ${styles.container}`}>
      <h1>Create Organization</h1>
      <Formik
        initialValues={{ name: "", email: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className={`form ${styles.form}`}>
            <div className={`form-group ${styles.formGroup}`}>
              <label htmlFor="name">Organization Name</label>
              <Field
                type="text"
                id="name"
                name="name"
                className={`form-control ${styles.form_control}`}
              />
              <ErrorMessage name="name" component="p" className="text-danger" />
            </div>

            <div className={`form-group ${styles.formGroup}`}>
              <label htmlFor="email">Organization Email</label>
              <Field
                type="email"
                id="email"
                name="email"
                className={`form-control ${styles.form_control}`}
              />
              <ErrorMessage
                name="email"
                component="p"
                className={`text-danger ${styles.text_danger}`}
              />
            </div>

            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateOrg;
