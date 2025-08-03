// Converted to Formik + Yup and replaced with planRatioElements
import {
  PaymentPlanCreateProps,
  InputProps,
  planDetailsItem,
  planRatioElements,
  RatioContainerProps,
} from "./types";
import { createPaymentPlan } from "../../redux/action/org-admin";
import styles from "./payment-plan.module.css";
import { Typography, Button, MenuItem } from "@mui/material";
import { uniqueId } from "lodash";
import {
  useFormik,
  FormikProvider,
  Form,
  FieldArray,
  useFormikContext,
} from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "../Loader/Loader";

const Input = ({ label, ...props }: InputProps) => (
  <label className={styles["label"]}>
    <span className={styles["label-text"]}>{label}</span>
    <input {...props} className={styles["input"]} />
  </label>
);

const getConditionOptions = (scope: string) => {
  switch (scope) {
    case "tower":
      return [{ key: "on-tower-stage", displayValue: "On Tower Stage" }];
    case "flat":
      return [{ key: "on-flat-stage", displayValue: "On Flat Stage" }];
    case "sale":
    default:
      return [
        { key: "on-booking", displayValue: "On Booking" },
        { key: "within-days", displayValue: "Within Days" },
        { key: "on-allotment", displayValue: "On Allotment" },
      ];
  }
};

const PlanRatioForm = ({
  index,
  remove,
}: {
  index: number;
  remove: () => void;
}) => {
  const { values, setFieldValue } = useFormikContext<any>();
  const currentScope = values.ratios[index].scope;

  useEffect(() => {
    if (currentScope === "tower") {
      setFieldValue(`ratios[${index}].conditionType`, "on-tower-stage");
    } else if (currentScope === "flat") {
      setFieldValue(`ratios[${index}].conditionType`, "on-flat-stage");
    } else if (currentScope === "sale") {
      const existing = values.ratios[index].conditionType;
      if (!["on-booking", "within-days"].includes(existing)) {
        setFieldValue(`ratios[${index}].conditionType`, "");
      }
    }
  }, [currentScope, index, setFieldValue]);

  const conditionOptions = getConditionOptions(currentScope);

  return (
    <div className={styles["ratio-container"]}>
      <div className={styles["form-header"]}>
        <Typography variant="h6">Plan Ratio</Typography>
        {remove && (
          <Button color="error" onClick={remove}>
            Remove Ratio
          </Button>
        )}
      </div>
      {/* Items */}
      <FieldArray
        name={`ratios[${index}].items`}
        render={(itemHelpers) => (
          <div className={styles["form-elements"]}>
            {values.ratios[index].items.map((item: any, itemIndex: number) => {
              const itemPath = `ratios[${index}].items[${itemIndex}]`;
              const currentScope = item.scope;
              const conditionOptions = getConditionOptions(currentScope);

              return (
                <div key={itemIndex} className={styles["ratio-container"]}>
                  <div className={styles["form-header"]}>
                    <Typography variant="subtitle1">Plan Ratio Item</Typography>
                    {values.ratios[index].items.length > 1 && (
                      <Button
                        color="error"
                        onClick={() => itemHelpers.remove(itemIndex)}
                      >
                        Remove Item
                      </Button>
                    )}
                  </div>

                  <div className={styles["form-elements"]}>
                    {/* Scope */}
                    {planRatioElements.map((field) => {
                      const fieldPath = `${itemPath}.${field.name}`;

                      // Custom handling for Scope dropdown
                      if (field.name === "scope") {
                        return (
                          <label key={field.name} className={styles["label"]}>
                            <span className={styles["label-text"]}>
                              {field.label}
                            </span>
                            <select
                              name={fieldPath}
                              className={styles["input"]}
                              value={item.scope}
                              onChange={(e) => {
                                const newScope = e.target.value;
                                setFieldValue(fieldPath, newScope);

                                // Set default conditionType based on scope
                                const newOptions =
                                  getConditionOptions(newScope);
                                const defaultCond = newOptions?.[0]?.key || "";
                                setFieldValue(
                                  `${itemPath}.conditionType`,
                                  defaultCond,
                                );
                              }}
                              required={field.required}
                            >
                              <option value="">Select</option>
                              {("options" in field ? field.options : []).map(
                                (option) => (
                                  <option key={option.key} value={option.key}>
                                    {option.displayValue}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                        );
                      }

                      // Custom handling for Condition Type dropdown (based on Scope)
                      if (field.name === "conditionType") {
                        const options = getConditionOptions(item.scope);
                        return (
                          <label key={field.name} className={styles["label"]}>
                            <span className={styles["label-text"]}>
                              {field.label}
                            </span>
                            <select
                              name={fieldPath}
                              className={styles["input"]}
                              value={item.conditionType}
                              onChange={(e) =>
                                setFieldValue(fieldPath, e.target.value)
                              }
                              required={field.required}
                            >
                              <option value="">Select</option>
                              {options.map((option) => (
                                <option key={option.key} value={option.key}>
                                  {option.displayValue}
                                </option>
                              ))}
                            </select>
                          </label>
                        );
                      }
                      // Inside planRatioElements.map(...)
                      if (field.name === "conditionValue") {
                        if (item.conditionType !== "within-days") return null;

                        return (
                          <label key={field.name} className={styles["label"]}>
                            <span className={styles["label-text"]}>
                              {field.label}
                            </span>
                            <input
                              type="number"
                              name={fieldPath}
                              className={styles["input"]}
                              value={item.conditionValue}
                              onChange={(e) =>
                                setFieldValue(fieldPath, e.target.value)
                              }
                              required={field.required}
                            />
                          </label>
                        );
                      }

                      // Default input/select rendering
                      return (
                        <label key={field.name} className={styles["label"]}>
                          <span className={styles["label-text"]}>
                            {field.label}
                          </span>
                          {field.elementType === "input" ? (
                            <input
                              name={fieldPath}
                              className={styles["input"]}
                              value={
                                item[field.name as keyof typeof item] ?? ""
                              }
                              onChange={(e) =>
                                setFieldValue(fieldPath, e.target.value)
                              }
                              required={field.required}
                            />
                          ) : (
                            <select
                              name={fieldPath}
                              className={styles["input"]}
                              value={
                                item[field.name as keyof typeof item] ?? ""
                              }
                              onChange={(e) =>
                                setFieldValue(fieldPath, e.target.value)
                              }
                              required={field.required}
                            >
                              <option value="">Select</option>
                              {(field.options ?? []).map((option) => (
                                <option key={option.key} value={option.key}>
                                  {option.displayValue}
                                </option>
                              ))}
                            </select>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <Button
              onClick={() =>
                itemHelpers.push({
                  description: "",
                  ratio: "",
                  scope: "",
                  conditionType: "",
                  conditionValue: "",
                })
              }
            >
              Add Item
            </Button>
          </div>
        )}
      />
    </div>
  );
};

export const PaymentPlanCreate = ({ societyRera }: PaymentPlanCreateProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: "",
    abbr: "",
    ratios: [
      {
        items: [
          {
            description: "",
            ratio: "",
            scope: "",
            conditionType: "",
            conditionValue: "",
          },
        ],
      },
    ],
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    abbr: Yup.string().required("Required"),
    ratios: Yup.array()
      .of(
        Yup.object().shape({
          items: Yup.array()
            .of(
              Yup.object().shape({
                description: Yup.string().required("Required"),
                ratio: Yup.number().required("Required").min(0).max(100),
                scope: Yup.string().required("Required"),
                conditionType: Yup.string().required("Required"),
                conditionValue: Yup.string(),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      const isValid = values.ratios.every((group, i) => {
        const total = group.items.reduce(
          (sum, item) => sum + Number(item.ratio || 0),
          0,
        );
        if (Math.round(total) !== 100) {
          alert(
            `Total ratio in Plan Ratio ${i + 1} should be 100% (currently ${total}%)`,
          );
          return false;
        }
        return true;
      });

      if (!isValid) return;

      const payload = {
        name: values.name,
        abbr: values.abbr,
        ratios: values.ratios.map((ratioGroup) => ({
          items: ratioGroup.items.map((item) => ({
            ratio: Number(item.ratio),
            scope: item.scope,
            conditionType: item.conditionType,
            conditionValue:
              item.conditionType === "within-days"
                ? Number(item.conditionValue || 0)
                : 0,
          })),
        })),
      };

      setLoading(true); // 🟡 Show loader

      createPaymentPlan(societyRera, payload)
        .then((response) => {
          alert("Payment plan created successfully!");
          formik.resetForm();
          router.push(`/org-admin/society/payment-plans?rera=${societyRera}`);
        })
        .catch((error) => {
          console.error("API Error:", error);
          alert("Failed to create payment plan.");
        })
        .finally(() => {
          setLoading(false); // 🟢 Hide loader
        });
    },
  });

  useEffect(() => {
    const name = formik.values.name;
    if (name) {
      const abbr = name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase();
      formik.setFieldValue("abbr", abbr);
    }
  }, [formik.values.name]);

  return (
    <>
      {loading ? (
        <Loader /> // 👈 This is your existing Loader component
      ) : (
        <FormikProvider value={formik}>
          <Form className={`${styles["container"]} container`}>
            <Typography variant="h4" fontWeight={600}>
              Create Payment Plan
            </Typography>

            <div className={styles["form"]}>
              <div className={styles["form-group"]}>
                <Typography variant="h5">Plan Details</Typography>
                <div className={styles["form-elements"]}>
                  {planDetailsItem.map((item) => {
                    const fieldName = item.name as keyof typeof formik.values;
                    return (
                      <label className={styles["label"]} key={item.name}>
                        <span className={styles["label-text"]}>
                          {item.label}
                        </span>
                        <input
                          name={item.name}
                          className={styles["input"]}
                          required={item.required}
                          value={formik.values[fieldName] as string}
                          onChange={formik.handleChange}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className={styles["form-group"]}>
                <div className={styles["form-header"]}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      formik.setFieldValue("ratios", [
                        ...formik.values.ratios,
                        initialValues.ratios[0],
                      ])
                    }
                  >
                    Add another
                  </Button>
                </div>

                <FieldArray
                  name="ratios"
                  render={(arrayHelpers) => (
                    <div className={styles["form-elements"]}>
                      {formik.values.ratios.map((ratio, index) => (
                        <PlanRatioForm
                          key={index}
                          index={index}
                          remove={() =>
                            formik.values.ratios.length > 1 &&
                            arrayHelpers.remove(index)
                          }
                        />
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <Button variant="contained" type="submit">
                Create payment Plan
              </Button>
            </div>
          </Form>
        </FormikProvider>
      )}
    </>
  );
};
