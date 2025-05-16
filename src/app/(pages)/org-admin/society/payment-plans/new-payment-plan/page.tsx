"use client";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./page.module.scss";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { createPaymentPlan } from "@/redux/action/org-admin";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
const validationSchema = Yup.object({
  summary: Yup.string().required("Summary is required"),
  scope: Yup.string()
    .oneOf(["Direct", "Tower"], "Invalid scope")
    .required("Scope is required"),
  conditionType: Yup.string()
    .oneOf(
      ["On-Booking", "After-Days", "On-Tower-Stage"],
      "Invalid condition type"
    )
    .required("Condition Type is required"),
  conditionValue: Yup.number().when("conditionType", {
    is: "After-Days",
    then: (schema) =>
      schema
        .typeError("Condition Value must be a number")
        .required("Condition Value is required")
        .moreThan(0, "Must be greater than 0"),
    otherwise: (schema) =>
      schema
        .typeError("Condition Value must be a number")
        .notRequired()
        .oneOf([0], "Must be 0"),
  }),
  amount: Yup.number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .min(1, "Minimum 1%")
    .max(100, "Maximum 100%"),
});

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [conditionType, setConditionType] = useState("");
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");

  const handleSubmit = async (
    values: {
      summary: string;
      scope: string;
      conditionType: string;
      conditionValue: number;
      amount: number;
    },
    { resetForm }: { resetForm: () => void }
  ) => {
    if (!rera) {
      toast.error("RERA number missing from URL");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        summary: values.summary,
        scope: values.scope,
        conditionType: values.conditionType,
        conditionValue:
          values.conditionType === "After-Days" ? values.conditionValue : 0,
        amount: values.amount,
      };

      const response = await createPaymentPlan(rera, payload);

      if (response?.error === false) {
        toast.success("Payment Plan created successfully!");
        resetForm();
        setConditionType("");
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
const payment_plan = [
  { name: "Home", href: "/org-admin" },
  { name: "Societies", href: "/org-admin/society" },
  { name: "Payment Plans", href: `/org-admin/society/payment-plans?rera=${rera}` },
  { name: "New Payment Plan" },
];
  return (
    <div>
      <div style={{ paddingTop: "1rem", paddingLeft: "1rem" }}>
        <CustomBreadcrumbs items={payment_plan} />
      </div>

      <div className={`container ${styles.container}`}>
        <h1>Create Payment Plan</h1>
        <Formik
          initialValues={{
            summary: "",
            scope: "",
            conditionType: "",
            conditionValue: 0,
            amount: 0,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => {
            const handleScopeChange = (
              e: React.ChangeEvent<HTMLSelectElement>
            ) => {
              const selectedScope = e.target.value;
              setFieldValue("scope", selectedScope);
              setFieldValue("conditionType", "");
              setConditionType("");
              setFieldValue("conditionValue", 0);
            };

            const handleConditionTypeChange = (
              e: React.ChangeEvent<HTMLSelectElement>
            ) => {
              const selected = e.target.value;
              setConditionType(selected);
              setFieldValue("conditionType", selected);
              if (selected !== "After-Days") {
                setFieldValue("conditionValue", 0);
              }
            };

            const conditionTypeOptions =
              values.scope === "Tower"
                ? [
                    {
                      label: "On-Tower-Stage",
                      value: "On-Tower-Stage",
                    },
                  ]
                : values.scope === "Direct"
                ? [
                    { label: "On-Booking", value: "On-Booking" },
                    { label: "After-Days", value: "After-Days" },
                  ]
                : [];

            return (
              <Form className={`form ${styles.form}`}>
                <div className={styles.formGroup}>
                  <label htmlFor="summary">Summary</label>
                  <Field
                    type="text"
                    id="summary"
                    name="summary"
                    className={styles.form_control}
                  />
                  <ErrorMessage
                    name="summary"
                    component="p"
                    className="text-danger"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="scope">Scope</label>
                  <Field
                    as="select"
                    id="scope"
                    name="scope"
                    className={styles.form_control}
                    onChange={handleScopeChange}
                  >
                    <option value="">Select Scope</option>
                    <option value="Direct">Direct</option>
                    <option value="Tower">Tower</option>
                  </Field>
                  <ErrorMessage
                    name="scope"
                    component="p"
                    className="text-danger"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="conditionType">Condition Type</label>
                  <Field
                    as="select"
                    id="conditionType"
                    name="conditionType"
                    className={styles.form_control}
                    onChange={handleConditionTypeChange}
                    disabled={!values.scope}
                  >
                    <option value="">Select Condition Type</option>
                    {conditionTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="conditionType"
                    component="p"
                    className="text-danger"
                  />
                </div>

                {conditionType === "After-Days" && (
                  <div className={styles.formGroup}>
                    <label htmlFor="conditionValue">Condition Value</label>
                    <Field
                      type="number"
                      id="conditionValue"
                      name="conditionValue"
                      className={styles.form_control}
                      min="1"
                    />
                    <ErrorMessage
                      name="conditionValue"
                      component="p"
                      className="text-danger"
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="amount">Amount (%)</label>
                  <Field
                    type="number"
                    id="amount"
                    name="amount"
                    className={styles.form_control}
                    min="1"
                    max="100"
                    step="0.01"
                    placeholder="%"
                  />
                  <ErrorMessage
                    name="amount"
                    component="p"
                    className="text-danger"
                  />
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default Page;
