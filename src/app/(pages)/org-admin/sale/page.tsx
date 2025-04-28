"use client";
import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  getSocieties,
  getTowers,
  getAllTowerUnsoldFlats,
} from "@/redux/action/org-admin";
import styles from "./page.module.scss";
const StepOneSchema = Yup.object().shape({
  society: Yup.string().required("Society is required"),
  tower: Yup.string().required("Tower is required"),
  flat: Yup.string().required("Flat is required"),
});

const CustomerSchema = Yup.object().shape({
  salutation: Yup.string().required("Salutation is required"),
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  dateOfBirth: Yup.date().required("Date of Birth is required"),
  gender: Yup.string().required("Gender is required"),
  photo: Yup.string().required("Photo is required"),
  maritalStatus: Yup.string().required("Marital Status is required"),
  nationality: Yup.string().required("Nationality is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string().required("Phone Number is required"),
  middleName: Yup.string(),
  numberOfChildren: Yup.number(),
  anniversaryDate: Yup.date(),
  aadharNumber: Yup.string(),
  panNumber: Yup.string(),
  passportNumber: Yup.string(),
  profession: Yup.string(),
  designation: Yup.string(),
  companyName: Yup.string(),
});

const StepTwoSchema = Yup.object().shape({
  customers: Yup.array()
    .of(CustomerSchema)
    .min(1, "At least one customer is required")
    .max(3, "Maximum 3 customers allowed"),
});

const initialValues = {
  society: "",
  tower: "",
  flat: "",
  customers: [
    {
      salutation: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      photo: "",
      maritalStatus: "",
      nationality: "",
      email: "",
      phoneNumber: "",
      middleName: "",
      numberOfChildren: undefined,
      anniversaryDate: "",
      aadharNumber: "",
      panNumber: "",
      passportNumber: "",
      profession: "",
      designation: "",
      companyName: "",
    },
  ],
};
const fetchTowers = async (
  rera: string,
  cursor: string | null = null,
  accumulated: any[] = []
): Promise<any[]> => {
  const response = await getTowers(cursor, rera);
  if (response?.error) return accumulated;

  const items = response?.data?.items || [];
  console.log("Items:", items);
  const newData = [...accumulated, ...items];
  const hasNext = response?.data?.pageInfo?.nextPage;
  const nextCursor = response?.data?.pageInfo?.cursor;

  if (hasNext && nextCursor) {
    return await fetchTowers(rera, nextCursor, newData);
  }

  return newData;
};

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [societies, setSocieties] = useState<
    { reraNumber: string; name: string }[]
  >([]);
  const [towers, setTowers] = useState<
    { id: string; name: string; societyId: string }[]
  >([]);
  const [selectedSocietyRera, setSelectedSocietyRera] = useState<string>("");
  const [flats, setFlats] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    const fetchAllSocieties = async (
      cursor: string | null = null,
      accumulated: any[] = []
    ): Promise<any[]> => {
      const response = await getSocieties(cursor);
      if (response?.error) return accumulated;

      const items = response?.data?.items || [];

      const newData = [...accumulated, ...items];
      const hasNext = response?.data?.pageInfo?.nextPage;
      const nextCursor = response?.data?.pageInfo?.cursor;

      if (hasNext && nextCursor) {
        return await fetchAllSocieties(nextCursor, newData);
      }

      return newData;
    };

    fetchAllSocieties().then((data) => {
      setSocieties(data);
    });
  }, []);
  const handleSocietyChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: any
  ) => {
    const reraNumber = e.target.value;
    setFieldValue("society", reraNumber);
    setFieldValue("tower", ""); // Reset dependent fields
    setFieldValue("flat", "");
    setTowers([]);
    setFlats([]);

    if (!reraNumber) return;

    const fetchAllTowers = async (
      cursor: string | null = null,
      accumulated: any[] = []
    ) => {
      const response = await getTowers(cursor, reraNumber);
      if (response?.error) return accumulated;

      const items = response?.data?.items || [];
      console.log("Items:", items);
      const newData = [...accumulated, ...items];
      const hasNext = response?.data?.pageInfo?.nextPage;
      const nextCursor = response?.data?.pageInfo?.cursor;

      if (hasNext && nextCursor) {
        return await fetchAllTowers(nextCursor, newData);
      }

      return newData;
    };

    const towerData = await fetchAllTowers();
    setTowers(towerData);
  };
  const handleTowerChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: any
  ) => {
    const towerId = e.target.value;
    setFieldValue("tower", towerId);
    setFieldValue("flat", "");
    setFlats([]);

    if (!towerId) return;

    const selectedTower = towers.find((tower) => tower.id === towerId);
    if (!selectedTower) return;

    const fetchAllUnsoldFlats = async (
      cursor: string | null = null,
      accumulated: any[] = []
    ) => {
      const response = await getAllTowerUnsoldFlats(
        cursor,
        selectedTower.societyId,
        towerId
      );
      if (response?.error) return accumulated;

      const items = response?.data?.items || [];

      const newData = [...accumulated, ...items];
      const hasNext = response?.data?.pageInfo?.nextPage;
      const nextCursor = response?.data?.pageInfo?.cursor;

      if (hasNext && nextCursor) {
        return await fetchAllUnsoldFlats(nextCursor, newData);
      }

      return newData;
    };

    const flatData = await fetchAllUnsoldFlats();
    setFlats(flatData);
  };

  const handleNext = (validateForm: any, setTouched: any) => {
    validateForm().then((errors: any) => {
      if (Object.keys(errors).length === 0) {
        setStep(step + 1);
      } else {
        setTouched(errors);
      }
    });
  };
  const handleFileChange =
    (index: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Create a file reader to show the image preview
        const reader = new FileReader();
        reader.onloadend = () => {
          // Set the base64 string as the photo field for the customer
          setFieldValue(`customers[${index}].photo`, reader.result as string);
        };
        reader.readAsDataURL(file); // Read the file as base64
      }
    };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = (values: any) => {
    console.log("Final Form Values:", values);
    alert("Form submitted successfully!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Sale Form</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={step === 1 ? StepOneSchema : StepTwoSchema}
        onSubmit={handleSubmit}
      >
        {({ values, validateForm, setTouched, setFieldValue }) => (
          <Form>
            {step === 1 && (
              <>
                <div>
                  <label>Society:</label>
                  <Field
                    as="select"
                    name="society"
                    className={styles.select}
                    onChange={(e: any) => handleSocietyChange(e, setFieldValue)}
                  >
                    <option value="">Select Society</option>
                    {societies.map((society) => (
                      <option
                        key={society.reraNumber}
                        value={society.reraNumber}
                      >
                        {society.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="society"
                    component="div"
                    className="error"
                  />
                </div>

                <div>
                  <label>Tower:</label>
                  <Field
                    as="select"
                    name="tower"
                    className={styles.select}
                    onChange={(e: any) => handleTowerChange(e, setFieldValue)}
                  >
                    <option value="">Select Tower</option>
                    {towers.map((tower) => (
                      <option key={tower.id} value={tower.id}>
                        {tower.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="tower"
                    component="div"
                    className="error"
                  />
                </div>

                <div>
                  <label>Flat:</label>
                  <Field as="select" name="flat" className={styles.select}>
                    <option value="">Select Flat</option>
                    {flats.map((flat) => (
                      <option key={flat.id} value={flat.id}>
                        {flat.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="flat" component="div" className="error" />
                </div>

                <button
                  type="button"
                  onClick={() => handleNext(validateForm, setTouched)}
                >
                  Next
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <FieldArray name="customers">
                  {({ push, remove }) => (
                    <>
                      {values.customers.map((customer, index) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: 20,
                            padding: 10,
                            border: "1px solid gray",
                          }}
                        >
                          <h4>Customer {index + 1}</h4>
                          <div>
                            <label>Salutation:</label>
                            <Field
                              as="select"
                              className={styles.select}
                              name={`customers[${index}].salutation`}
                            >
                              <option value="">Select Salutation</option>
                              <option value="Mr.">Mr.</option>
                              <option value="Mrs.">Mrs.</option>
                              <option value="Ms.">Ms.</option>
                              <option value="Dr.">Dr.</option>
                              <option value="Prof.">Prof.</option>
                            </Field>
                            <ErrorMessage
                              name={`customers[${index}].salutation`}
                              component="div"
                              className="error"
                            />
                          </div>

                          <div>
                            <label>First Name:</label>
                            <Field
                              className={styles.select}
                              name={`customers[${index}].firstName`}
                            />
                            <ErrorMessage
                              name={`customers[${index}].firstName`}
                              component="div"
                              className="error"
                            />
                          </div>

                          <div>
                            <label>Last Name:</label>
                            <Field
                              className={styles.select}
                              name={`customers[${index}].lastName`}
                            />
                            <ErrorMessage
                              name={`customers[${index}].lastName`}
                              component="div"
                              className="error"
                            />
                          </div>

                          <div>
                            <label>Date of Birth:</label>
                            <Field
                              className={styles.select}
                              name={`customers[${index}].dateOfBirth`}
                              type="date"
                            />
                            <ErrorMessage
                              name={`customers[${index}].dateOfBirth`}
                              component="div"
                              className="error"
                            />
                          </div>

                          <div>
                            <label>Gender:</label>
                            <Field
                              as="select"
                              className={styles.select}
                              name={`customers[${index}].gender`}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </Field>
                            <ErrorMessage
                              name={`customers[${index}].gender`}
                              component="div"
                              className="error"
                            />
                          </div>

                          <div>
                            <label>Photo:</label>
                            <input
                              type="file"
                              className={styles.fileInput}
                              name={`customers[${index}].photo`}
                              onChange={handleFileChange(index)}
                            />
                            {values.customers[index].photo && (
                              <div>
                                <h5>Preview:</h5>
                                <img
                                  src={values.customers[index].photo}
                                  alt="Preview"
                                  className={styles.previewImage}
                                  style={{
                                    maxWidth: "200px",
                                    maxHeight: "200px",
                                  }}
                                />
                              </div>
                            )}
                            <ErrorMessage
                              name={`customers[${index}].photo`}
                              component="div"
                              className="error"
                            />
                          </div>

                          <div>
                            <label>Marital Status:</label>
                            <Field
                              as="select"
                              className={styles.select}
                              name={`customers[${index}].maritalStatus`}
                            >
                              <option value="">Select Marital Status</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                            </Field>
                            <ErrorMessage
                              name={`customers[${index}].maritalStatus`}
                              component="div"
                              className="error"
                            />
                          </div>

                          <div>
                            <label>Nationality:</label>
                            <Field
                              className={styles.select}
                              name={`customers[${index}].nationality`}
                            />
                            <ErrorMessage
                              name={`customers[${index}].nationality`}
                              component="div"
                              className="error"
                            />
                          </div>

                          <div>
                            <label>Email:</label>
                            <Field
                              className={styles.select}
                              name={`customers[${index}].email`}
                              type="email"
                            />
                            <ErrorMessage
                              name={`customers[${index}].email`}
                              component="div"
                              className="error"
                            />
                          </div>

                          <div>
                            <label>Phone Number:</label>
                            <Field
                              className={styles.select}
                              name={`customers[${index}].phoneNumber`}
                            />
                            <ErrorMessage
                              name={`customers[${index}].phoneNumber`}
                              component="div"
                              className="error"
                            />
                          </div>

                          {values.customers.length > 1 && (
                            <button type="button" onClick={() => remove(index)}>
                              Remove Customer
                            </button>
                          )}
                        </div>
                      ))}

                      {values.customers.length < 3 && (
                        <button
                          type="button"
                          onClick={() =>
                            push({
                              salutation: "",
                              firstName: "",
                              lastName: "",
                              dateOfBirth: "",
                              gender: "",
                              photo: "",
                              maritalStatus: "",
                              nationality: "",
                              email: "",
                              phoneNumber: "",
                              middleName: "",
                              numberOfChildren: undefined,
                              anniversaryDate: "",
                              aadharNumber: "",
                              panNumber: "",
                              passportNumber: "",
                              profession: "",
                              designation: "",
                              companyName: "",
                            })
                          }
                        >
                          Add Customer
                        </button>
                      )}
                    </>
                  )}
                </FieldArray>

                <button type="button" onClick={handlePrevious}>
                  Previous
                </button>

                <button type="submit">Submit</button>
              </>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MultiStepForm;
