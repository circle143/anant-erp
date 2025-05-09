"use client";
import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  getSocieties,
  getTowers,
  getAllTowerUnsoldFlats,
  getAllOtherOptionalCharges,
  addCustomer,
} from "@/redux/action/org-admin";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import toast from "react-hot-toast";
import Loader from "@/components/Loader/Loader";
import styles from "./page.module.scss";
import TextField from "@mui/material/TextField";
import { getUrl, uploadData } from "aws-amplify/storage";
import { parsePhoneNumber } from "libphonenumber-js/min";
import imageCompression from "browser-image-compression";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";

const StepOneSchema = Yup.object().shape({
  society: Yup.string().required("Society is required"),
  tower: Yup.string().required("Tower is required"),
  flat: Yup.string().required("Flat is required"),
  charges: Yup.array(),
  basicCost: Yup.number()
    .required("Basic Cost is required")
    .min(1, "Basic Cost must be at least 1")
    .test(
      "is-decimal",
      "Basic Cost can have at most 2 decimal places",
      (value) => /^\d+(\.\d{1,2})?$/.test(String(value))
    ),
});

const today = new Date();
const minDOB = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
];

type SkillOption = {
  id: string;
  summary: string;
};

const CustomerSchema = Yup.object()
  .shape({
    salutation: Yup.string().required("Salutation is required"),
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    dateOfBirth: Yup.date()
      .max(minDOB, "Customer must be at least 18 years old")
      .required("Date of Birth is required"),
    gender: Yup.string().required("Gender is required"),
    photo: Yup.mixed()
      .required("Photo is required")
      .test(
        "fileType",
        "Only JPG, JPEG, PNG, and WEBP files are allowed",
        (value) => {
          if (!value) return false;
          if (typeof value === "string") return true;
          if (value instanceof File) {
            return SUPPORTED_FORMATS.includes(value.type);
          }
          return false;
        }
      ),
    maritalStatus: Yup.string().required("Marital Status is required"),
    nationality: Yup.string().required("Nationality is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string().required("Phone Number is required"),

    // Optional fields
    numberOfChildren: Yup.number().nullable(),
    anniversaryDate: Yup.date().nullable(),

    aadharNumber: Yup.string().nullable(),
    panNumber: Yup.string().nullable(),
    passportNumber: Yup.string().nullable(),

    profession: Yup.string().nullable(),
    designation: Yup.string().nullable(),
    companyName: Yup.string().nullable(),
  })
  .test(
    "at-least-one-id",
    "At least one of Aadhar Number, PAN Number, or Passport Number is required",
    function (value) {
      return (
        !!value.aadharNumber?.trim() ||
        !!value.panNumber?.trim() ||
        !!value.passportNumber?.trim()
      );
    }
  );

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
  seller: "",
  charges: [] as string[],
  basicCost: 0,
  customers: [
    {
      salutation: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      photo: "",
      photoPreview: "",
      maritalStatus: "",
      nationality: "",
      email: "",
      phoneNumber: "",
      middleName: "",
      numberOfChildren: 0,
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
  // console.log("Items:", items);
  const newData = [...accumulated, ...items];
  const hasNext = response?.data?.pageInfo?.nextPage;
  const nextCursor = response?.data?.pageInfo?.cursor;

  if (hasNext && nextCursor) {
    return await fetchTowers(rera, nextCursor, newData);
  }

  return newData;
};

const Sale = () => {
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [step, setStep] = useState(1);
  const [societies, setSocieties] = useState<
    { reraNumber: string; name: string }[]
  >([]);
  const [towers, setTowers] = useState<
    { id: string; name: string; societyId: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedSocietyRera, setSelectedSocietyRera] = useState<string>("");
  const [flats, setFlats] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    const fetchAllSocieties = async (
      cursor: string | null = null,
      accumulated: any[] = []
    ): Promise<any[]> => {
      setLoading(true);
      const response = await getSocieties(cursor);
      if (response?.error) {
        setLoading(false);
        return accumulated;
      }

      const items = response?.data?.items || [];

      const newData = [...accumulated, ...items];
      const hasNext = response?.data?.pageInfo?.nextPage;
      const nextCursor = response?.data?.pageInfo?.cursor;

      if (hasNext && nextCursor) {
        return await fetchAllSocieties(nextCursor, newData);
      }
      setLoading(false);
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
    setLoading(true);
    const reraNumber = e.target.value;
    setFieldValue("society", reraNumber);
    setFieldValue("tower", ""); // Reset dependent fields
    setFieldValue("flat", "");
    setTowers([]);
    setFlats([]);

    if (!reraNumber) {
      setLoading(false);
      return;
    }

    const fetchAllTowers = async (
      cursor: string | null = null,
      accumulated: any[] = []
    ) => {
      const response = await getTowers(cursor, reraNumber);
      console.log("Response:", response);
      if (response?.error) return accumulated;

      const items = response?.data?.items || [];
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

    // 🔽 Fetch and print all optional charges
    type MinimalCharge = { id: string; summary: string };

    const fetchAllCharges = async (
      accumulated: MinimalCharge[] = []
    ): Promise<MinimalCharge[]> => {
      const response = await getAllOtherOptionalCharges(reraNumber);
      if (response?.error) return accumulated;

      const items = response?.data || [];

      return items.map(({ id, summary }: { id: string; summary: string }) => ({
        id,
        summary,
      }));
    };

    const optionalCharges = await fetchAllCharges();
    setSkillOptions(optionalCharges);
    console.log("Optional Charges:", optionalCharges);

    setLoading(false);
  };

  const handleTowerChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: any
  ) => {
    setLoading(true);
    const towerId = e.target.value;
    setFieldValue("tower", towerId);
    setFieldValue("flat", "");
    setFlats([]);

    if (!towerId) {
      setLoading(false);
      return;
    }

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
    setLoading(false);
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

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      setLoading(true);
      const { society, flat, customers } = values;

      const updatedCustomers = await Promise.all(
        customers.map(async (customer: any, index: number) => {
          let photoPath = customer.photo;
          const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 800, // Resize to 800x800 if larger
            useWebWorker: true,
          };
          // If photo is a File object, upload it to S3
          if (customer.photo instanceof File) {
            const compressedFile = await imageCompression(
              customer.photo,
              options
            );
            const fileExt = customer.photo.name.split(".").pop();
            const s3Key = `${society}/${flat}/customer${index}/profile.${fileExt}`;

            const result = await uploadData({
              path: s3Key,
              data: compressedFile,
              options: {
                contentType: compressedFile.type,
              },
            }).result;

            photoPath = result.path;
            delete customer.photoPreview; // Use the uploaded file's path
          }
          const formattedDOB = customer.dateOfBirth
            ? new Date(customer.dateOfBirth).toISOString().slice(0, 10)
            : "";

          let formattedanniversaryDate = "";
          if (customer.anniversaryDate) {
            const date = new Date(customer.anniversaryDate);
            formattedanniversaryDate = date.toISOString().slice(0, 10);
          }

          let formattedPhone = customer.phoneNumber;
          try {
            const phoneNumber = parsePhoneNumber(customer.phoneNumber, {
              defaultCountry: "IN",
            });

            if (phoneNumber?.isValid()) {
              formattedPhone = phoneNumber.number; // E.164 format
            }
          } catch (error) {
            console.warn("Invalid phone number:", customer.phoneNumber);
          }
          return {
            ...customer,
            level: index, // add level
            photo: photoPath,
            dateOfBirth: formattedDOB,
            anniversaryDate: formattedanniversaryDate,
            phoneNumber: formattedPhone,
          };
        })
      );

      // Call your API to submit the updated customer data

      const response = await addCustomer(
        society,
        flat,
        updatedCustomers,
        values.charges,
        values.basicCost
      );
      // console.log("society", society);
      // console.log(" updatedCustomers", updatedCustomers);
      // console.log("flat", flat);
      // console.log("values.charges", values.charges);
      // console.log("values.basicCost", values.basicCost);
      if (response.error) {
        toast.error(response.message || "Customer add failed");
        setLoading(false);
        return;
      }
      // console.log("Form values:", updatedCustomers, society, flat);
      toast.success("Form submitted successfully!");
      resetForm();
      setLoading(false);
      setStep(step - 1);
    } catch (error) {
      setLoading(false);
      console.error("Form submission failed:", error);
      toast.error("Something went wrong while submitting the form.");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1>Sale Form</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={step === 1 ? StepOneSchema : StepTwoSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          validateForm,
          setTouched,
          setFieldValue,
          resetForm,
          errors,
        }) => {
          const handleFileChange =
            (index: number) =>
            async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const SUPPORTED_FORMATS = [
                "image/jpg",
                "image/jpeg",
                "image/png",
                "image/webp",
              ];

              if (!SUPPORTED_FORMATS.includes(file.type)) {
                alert("Only JPG, JPEG, PNG, and WEBP files are allowed");
                return;
              }
              // console.log("Customer photo:", file);
              // Set file (used for upload)
              setFieldValue(`customers[${index}].photo`, file);

              // Set preview image (used for display only)
              const reader = new FileReader();
              reader.onloadend = () => {
                setFieldValue(
                  `customers[${index}].photoPreview`,
                  reader.result
                ); // just for showing image
              };
              reader.readAsDataURL(file);
            };

          return (
            <Form>
              {step === 1 && (
                <>
                  {loading ? (
                    <Loader />
                  ) : (
                    <>
                      <div>
                        <label>
                          Society: <span style={{ color: "red" }}>*</span>
                        </label>
                        {/* <Field
                          as="select"
                          name="society"
                          className={styles.select}
                          onChange={(e: any) =>
                            handleSocietyChange(e, setFieldValue)
                          }
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
                        </Field> */}
                        <Select
                          id="society-select"
                          value={values.society || ""}
                          onChange={(e: any) =>
                            handleSocietyChange(e, setFieldValue)
                          }
                          displayEmpty
                          fullWidth
                          // className={styles.multiselect}
                          size="small"
                        >
                          <MenuItem value="">Select Society</MenuItem>
                          {societies.map((society) => (
                            <MenuItem
                              key={society.reraNumber}
                              value={society.reraNumber}
                            >
                              {society.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <ErrorMessage
                          name="society"
                          component="div"
                          className="error"
                        />
                      </div>

                      <div>
                        <label>
                          Tower: <span style={{ color: "red" }}>*</span>
                        </label>
                        {/* <Field
                          as="select"
                          name="tower"
                          className={styles.select}
                          onChange={(e: any) =>
                            handleTowerChange(e, setFieldValue)
                          }
                        >
                          <option value="">Select Tower</option>
                          {towers.map((tower) => (
                            <option key={tower.id} value={tower.id}>
                              {tower.name}
                            </option>
                          ))}
                        </Field> */}
                        <Select
                          id="tower-select"
                          value={values.tower || ""}
                          onChange={(e: any) =>
                            handleTowerChange(e, setFieldValue)
                          }
                          displayEmpty
                          fullWidth
                          // className={styles.multiselect}
                          size="small"
                        >
                          <MenuItem value="">Select Tower</MenuItem>
                          {towers.map((tower) => (
                            <MenuItem key={tower.id} value={tower.id}>
                              {tower.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <ErrorMessage
                          name="tower"
                          component="div"
                          className="error"
                        />
                      </div>

                      <div>
                        <label>
                          Flat: <span style={{ color: "red" }}>*</span>
                        </label>
                        {/* <Field
                          as="select"
                          name="flat"
                          className={styles.select}
                        >
                          <option value="">Select Flat</option>
                          {flats.map((flat) => (
                            <option key={flat.id} value={flat.id}>
                              {flat.name}
                            </option>
                          ))}
                        </Field> */}
                        <Select
                          id="flat-select"
                          value={values.flat || ""}
                          onChange={(e: any) =>
                            setFieldValue("flat", e.target.value)
                          }
                          // className={styles.multiselect}
                          size="small"
                          displayEmpty
                          fullWidth
                        >
                          <MenuItem value="">Select Flat</MenuItem>
                          {flats.map((flat) => (
                            <MenuItem key={flat.id} value={flat.id}>
                              {flat.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <ErrorMessage
                          name="flat"
                          component="div"
                          className="error"
                        />
                      </div>
                      <div>
                        <label>
                          Basic Cost : <span style={{ color: "red" }}>*</span>
                        </label>
                        {/* <Field
                          className={styles.select}
                          name="basicCost"
                          type="number"
                          min="1"
                          step="0.01"
                        /> */}
                        <TextField
                          id="basic-cost"
                          type="number"
                          className={styles.multiselect}
                          value={values.basicCost || ""}
                          onChange={(e) =>
                            setFieldValue("basicCost", e.target.value)
                          }
                          // variant="outlined"
                          fullWidth
                          size="small"
                          // placeholder="Basic Cost"
                        />
                        <ErrorMessage
                          name="basicCost"
                          component="div"
                          className="error"
                        />
                      </div>
                      <div>
                        <label>Optional Charges:</label>
                        <Select
                          multiple
                          name="charges"
                          className={styles.multiselect}
                          value={values.charges}
                          renderValue={(selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {selected.map((id: string) => {
                                const option = skillOptions.find(
                                  (opt) => opt.id === id
                                );
                                return (
                                  <Chip
                                    key={id}
                                    label={option?.summary || id}
                                    sx={{ maxWidth: 200 }}
                                  />
                                );
                              })}
                            </Box>
                          )}
                          onChange={(e) => {
                            const selectedValues =
                              typeof e.target.value === "string"
                                ? e.target.value.split(",")
                                : e.target.value;
                            setFieldValue("charges", selectedValues);
                          }}
                        >
                          {skillOptions.map((option) => (
                            <MenuItem
                              key={option.id}
                              value={option.id}
                              className={styles.select}
                              // style={getStyles(
                              //   option.id,
                              //   values.charges,
                              //   useTheme()
                              // )}
                            >
                              <Checkbox
                                checked={values.charges.includes(option.id)}
                              />
                              <ListItemText primary={option.summary} />
                            </MenuItem>
                          ))}
                        </Select>

                        <ErrorMessage
                          name="charges"
                          component="div"
                          className="error"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNext(validateForm, setTouched)}
                      >
                        Next
                      </button>
                    </>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <FieldArray name="customers">
                    {({ push, remove }) => (
                      <>
                        {values.customers.map((customer, index) => (
                          <div key={index} className={styles.secondform}>
                            <h4>Applicant {index + 1}</h4>

                            {/* Salutation */}
                            <div>
                              <label>
                                Salutation:
                                <span style={{ color: "red" }}>*</span>
                              </label>
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

                            {/* Name Fields */}
                            <div>
                              <label>
                                First Name:
                                <span style={{ color: "red" }}>*</span>
                              </label>
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
                              <label>Middle Name:</label>
                              <Field
                                className={styles.select}
                                name={`customers[${index}].middleName`}
                              />
                              <ErrorMessage
                                name={`customers[${index}].middleName`}
                                component="div"
                                className="error"
                              />
                            </div>

                            <div>
                              <label>
                                Last Name:
                                <span style={{ color: "red" }}>*</span>
                              </label>
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

                            {/* Date of Birth */}
                            <div>
                              <label>
                                Date of Birth:{" "}
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <Field
                                className={styles.select}
                                name={`customers[${index}].dateOfBirth`}
                                type="date"
                                max={
                                  new Date(
                                    new Date().setFullYear(
                                      new Date().getFullYear() - 18
                                    )
                                  )
                                    .toISOString()
                                    .split("T")[0]
                                } // ensures it's in yyyy-mm-dd format
                              />
                              <ErrorMessage
                                name={`customers[${index}].dateOfBirth`}
                                component="div"
                                className="error"
                              />
                            </div>

                            {/* Gender */}
                            <div>
                              <label>
                                Gender:<span style={{ color: "red" }}>*</span>
                              </label>
                              <Field
                                as="select"
                                className={styles.select}
                                name={`customers[${index}].gender`}
                              >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Transgender">Transgender</option>
                              </Field>
                              <ErrorMessage
                                name={`customers[${index}].gender`}
                                component="div"
                                className="error"
                              />
                            </div>

                            {/* Photo Upload */}
                            <div>
                              <label>
                                Photo:<span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                type="file"
                                className={styles.fileInput}
                                name={`customers[${index}].photo`}
                                accept="image/*"
                                onChange={handleFileChange(index)}
                              />
                              {values.customers[index].photoPreview && (
                                <div>
                                  <h5>Preview:</h5>
                                  <img
                                    src={values.customers[index].photoPreview}
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

                            {/* Marital Status */}
                            <div>
                              <label>
                                Marital Status:
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <Field
                                as="select"
                                className={styles.select}
                                name={`customers[${index}].maritalStatus`}
                              >
                                <option value="">Select Marital Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                              </Field>
                              <ErrorMessage
                                name={`customers[${index}].maritalStatus`}
                                component="div"
                                className="error"
                              />
                            </div>

                            {/* Nationality */}
                            <div>
                              <label>
                                Nationality:
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <Field
                                as="select"
                                className={styles.select}
                                name={`customers[${index}].nationality`}
                              >
                                <option value="">Select Nationality</option>
                                <option value="Resident">Resident</option>
                                <option value="PIO">PIO</option>
                                <option value="NRI">NRI</option>
                                <option value="OCI">OCI</option>
                              </Field>
                              <ErrorMessage
                                name={`customers[${index}].nationality`}
                                component="div"
                                className="error"
                              />
                            </div>

                            {/* Email & Phone */}
                            <div>
                              <label>
                                Email:<span style={{ color: "red" }}>*</span>
                              </label>
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
                              <label>
                                Phone Number:
                                <span style={{ color: "red" }}>*</span>
                              </label>
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

                            {/* Additional Fields */}
                            <div>
                              <label>Number of Children:</label>
                              <Field
                                type="number"
                                className={styles.select}
                                name={`customers[${index}].numberOfChildren`}
                              />
                              <ErrorMessage
                                name={`customers[${index}].numberOfChildren`}
                                component="div"
                                className="error"
                              />
                            </div>

                            <div>
                              <label>Anniversary Date:</label>
                              <Field
                                type="date"
                                className={styles.select}
                                name={`customers[${index}].anniversaryDate`}
                                max={new Date().toISOString().split("T")[0]} // disable future dates
                              />
                              <ErrorMessage
                                name={`customers[${index}].anniversaryDate`}
                                component="div"
                                className="error"
                              />
                            </div>

                            <div>
                              <label>Aadhar Number:</label>
                              <Field
                                className={styles.select}
                                name={`customers[${index}].aadharNumber`}
                              />
                              <ErrorMessage
                                name={`customers[${index}].aadharNumber`}
                                component="div"
                                className="error"
                              />
                            </div>

                            <div>
                              <label>PAN Number:</label>
                              <Field
                                className={styles.select}
                                name={`customers[${index}].panNumber`}
                              />
                              <ErrorMessage
                                name={`customers[${index}].panNumber`}
                                component="div"
                                className="error"
                              />
                            </div>

                            <div>
                              <label>Passport Number:</label>
                              <Field
                                className={styles.select}
                                name={`customers[${index}].passportNumber`}
                              />
                              <ErrorMessage
                                name={`customers[${index}].passportNumber`}
                                component="div"
                                className="error"
                              />
                              {errors.customers?.[index] && (
                                <div className="error">
                                  {typeof errors.customers[index] === "string"
                                    ? errors.customers[index]
                                    : ""}
                                </div>
                              )}
                            </div>

                            <div>
                              <label>Profession:</label>
                              <Field
                                className={styles.select}
                                name={`customers[${index}].profession`}
                              />
                              <ErrorMessage
                                name={`customers[${index}].profession`}
                                component="div"
                                className="error"
                              />
                            </div>

                            <div>
                              <label>Designation:</label>
                              <Field
                                className={styles.select}
                                name={`customers[${index}].designation`}
                              />
                              <ErrorMessage
                                name={`customers[${index}].designation`}
                                component="div"
                                className="error"
                              />
                            </div>

                            <div>
                              <label>Company Name:</label>
                              <Field
                                className={styles.select}
                                name={`customers[${index}].companyName`}
                              />
                              <ErrorMessage
                                name={`customers[${index}].companyName`}
                                component="div"
                                className="error"
                              />
                            </div>

                            {/* Remove Button */}
                            {values.customers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                              >
                                Remove Customer
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Add Button */}
                        {values.customers.length < 3 && (
                          <button
                            type="button"
                            onClick={() =>
                              push({
                                salutation: "",
                                firstName: "",
                                middleName: "",
                                lastName: "",
                                dateOfBirth: "",
                                gender: "",
                                photo: "",
                                maritalStatus: "",
                                nationality: "",
                                email: "",
                                phoneNumber: "",
                                numberOfChildren: 0,
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
                  <div className={styles.buttonGroup}>
                    <button type="button" onClick={handlePrevious}>
                      Previous
                    </button>

                    <button type="submit" disabled={loading}>
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </>
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Sale;
