"use client";
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./create-org.module.scss";
import { addOrgAdminUser } from "@/redux/action/admin"; 

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const CreateOrg = () => {
  const handleSubmit = async (values: { name: string; email: string }) => {
    try {

      const response = await addOrgAdminUser(values.name, values.email);
      console.log("✅ API Response:", response);
    } catch (error) {
      console.error("❌ API Error:", error);
    }
  };

  return (
    <div className="container">
      <h1>Create Organization</h1>
      <Formik
        initialValues={{ name: "", email: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="form">
            <div className="form-group">
              <label htmlFor="name">Organization Name</label>
              <Field
                type="text"
                id="name"
                name="name"
                className="form-control"
              />
              <ErrorMessage name="name" component="p" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="email">Organization Email</label>
              <Field
                type="email"
                id="email"
                name="email"
                className="form-control"
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-danger"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateOrg;
