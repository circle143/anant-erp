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
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";

import { Button, Tab, Tabs } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
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
import { CustomerDetails } from "@/utils/routes/sale/types";

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

    photo: Yup.mixed().test(
      "fileType",
      "Only JPG, JPEG, PNG, and WEBP files are allowed",
      (value) => {
        // Allow if not provided (optional)
        if (!value) return true;

        // Allow if it's a URL (already uploaded)
        if (typeof value === "string") return true;

        // Validate if it's a File
        if (value instanceof File) {
          return SUPPORTED_FORMATS.includes(value.type);
        }

        return false;
      }
    ),

    maritalStatus: Yup.string().required("Marital Status is required"),
    nationality: Yup.string().required("Nationality is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string()
      .matches(/^\d{10}$/, "Phone Number must be exactly 10 digits")
      .required("Phone Number is required"),

    // Optional fields
    numberOfChildren: Yup.number().nullable(),
    anniversaryDate: Yup.date().nullable(),

    aadharNumber: Yup.string()
      .nullable()
      .matches(
        /^[2-9]{1}[0-9]{11}$/,
        "Invalid Aadhar format (12 digits, cannot start with 0/1)"
      ),
    panNumber: Yup.string()
      .nullable()
      .matches(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Invalid PAN format (Example: ABCDE1234F)"
      ),
    passportNumber: Yup.string()
      .nullable()
      .matches(
        /^[A-PR-WYa-pr-wy][0-9]{7}$/,
        "Invalid Passport format (Example: A1234567)"
      ),

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
const CompanySchema = Yup.object()
  .shape({
    name: Yup.string().required("Company name is required"),
    companyPan: Yup.string()
      .required("Company PAN is required")
      .matches(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Invalid PAN format (Example: ABCDE1234F)"
      ),
    companyGST: Yup.string()
      .nullable()
      .matches(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GST format (Example: 12ABCDE3456F7Z8)"
      ),
    aadharNumber: Yup.string()
      .nullable()
      .matches(
        /^[2-9]{1}[0-9]{11}$/,
        "Invalid Aadhar format (12 digits, cannot start with 0/1)"
      ),
    panNumber: Yup.string()
      .nullable()
      .matches(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Invalid PAN format (Example: ABCDE1234F)"
      ),
  })
  .test(
    "at-least-one-id",
    "At least one of Aadhar Number or PAN Number is required",
    function (value) {
      return !!value.aadharNumber?.trim() || !!value.panNumber?.trim();
    }
  );

const StepTwoSchema = Yup.object().shape({
  type: Yup.string().required("Customer type is required"),
  customers: Yup.array().when("type", {
    is: (value: string) => value === "user",
    then: (schema) =>
      schema
        .of(CustomerSchema)
        .min(1, "At least one customer is required")
        .max(3, "Maximum 3 customers allowed"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  companyBuyer: Yup.object().when("type", {
    is: (value: string) => value === "company",
    then: () => CompanySchema, // Important: Return the schema directly
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});

const initialValues = {
  society: "",
  tower: "",
  flat: "",
  seller: "",
  charges: [] as string[],
  basicCost: 0,
  type: "user",
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
  companyBuyer: {
    name: "",
    companyPan: "",
    companyGST: "",
    aadharNumber: "",
    panNumber: "",
  },
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
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
type CompanyBuyerErrors =
  | string
  | {
      name?: string;
      companyPan?: string;
      companyGST?: string;
      aadharNumber?: string;
      panNumber?: string;
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
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
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
  const maxDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 18)
  )
    .toISOString()
    .split("T")[0];
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
  const isCustomerError = (error: unknown): error is { email?: string } => {
    return typeof error === "object" && error !== null;
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
      const {
        society,
        flat,
        charges,
        basicCost,
        type,
        companyBuyer,
        customers,
      } = values;

      // Process customers only if type is 'user'
      let processedCustomers: CustomerDetails[] | undefined;
      if (type === "user") {
        processedCustomers = await Promise.all(
          customers.map(async (customer: any, index: number) => {
            let photoPath = customer.photo;
            const options = {
              maxSizeMB: 0.8,
              maxWidthOrHeight: 800,
              useWebWorker: true,
            };

            // Handle image upload if exists
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
                options: { contentType: compressedFile.type },
              }).result;

              photoPath = result.path;
            }

            // Cleanup temporary preview
            delete customer.photoPreview;

            // Format dates
            const formattedDOB = customer.dateOfBirth
              ? new Date(customer.dateOfBirth).toISOString().slice(0, 10)
              : "";

            let formattedAnniversary = "";
            if (customer.anniversaryDate) {
              formattedAnniversary = new Date(customer.anniversaryDate)
                .toISOString()
                .slice(0, 10);
            }

            // Format phone number
            let formattedPhone = customer.phoneNumber;
            try {
              const phoneNumber = parsePhoneNumber(customer.phoneNumber, "IN");
              if (phoneNumber?.isValid()) {
                formattedPhone = phoneNumber.number;
              }
            } catch (error) {
              console.warn("Invalid phone number:", customer.phoneNumber);
            }

            return {
              ...customer,
              photo: photoPath,
              dateOfBirth: formattedDOB,
              anniversaryDate: formattedAnniversary,
              phoneNumber: formattedPhone,
            };
          })
        );
      }

      // Make API call with parameters in correct order
      const response = await addCustomer(
        society, // societyReraNumber: string
        flat, // flatID: string
        charges, // optionalCharges: string[]
        parseFloat(basicCost.toString()), // basicCost: number
        type, // type: string
        type === "company" ? companyBuyer : undefined, // companyBuyer?
        type === "user" ? processedCustomers : undefined // customers?
      );

      if (response.error) {
        toast.error(response.message || "Submission failed");
        setLoading(false);
        return;
      }

      // Reset form on success
      toast.success("Form submitted successfully!");
      resetForm();
      setLoading(false);
      setStep(1); // Return to first step
    } catch (error) {
      setLoading(false);
      console.error("Submission failed:", error);
      toast.error("Something went wrong during submission");
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
          touched,
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
                              {society.name} (RERA: {society.reraNumber})
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
                          fullWidth
                          size="small"
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
                  <Box>
                    <Tabs
                      value={tabValue}
                      variant="fullWidth"
                      // indicatorColor="secondary"
                    
                      textColor="inherit"
                      onChange={(e, newValue) => {
                        setTabValue(newValue);
                        setFieldValue(
                          "type",
                          newValue === 0 ? "user" : "company"
                        );
                      }}
                    >
                      <Tab label="Individual" />
                      <Tab label="Company" />
                    </Tabs>
                  </Box>

                  <TabPanel value={tabValue} index={0}>
                    <>
                      <FieldArray name="customers">
                        {({ push, remove }) => (
                          <>
                            {values.customers.map((customer, index) => (
                              <div key={index} className={styles.secondform}>
                                <h4>Applicant {index + 1}</h4>

                                {/* Salutation */}
                                <div>
                                  <InputLabel id={`salutation-label-${index}`}>
                                    Salutation
                                  </InputLabel>
                                  <Select
                                    labelId={`salutation-label-${index}`}
                                    value={
                                      values.customers?.[index]?.salutation ||
                                      ""
                                    }
                                    onChange={(e: any) =>
                                      setFieldValue(
                                        `customers[${index}].salutation`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.salutation &&
                                      Boolean(
                                        errors.customers?.[index]?.salutation
                                      )
                                    }
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                  >
                                    <MenuItem value="">
                                      Select Salutation
                                    </MenuItem>
                                    <MenuItem value="Mr.">Mr.</MenuItem>
                                    <MenuItem value="Mrs.">Mrs.</MenuItem>
                                    <MenuItem value="Ms.">Ms.</MenuItem>
                                    <MenuItem value="Dr.">Dr.</MenuItem>
                                    <MenuItem value="Prof.">Prof.</MenuItem>
                                  </Select>
                                  <FormHelperText>
                                    {isCustomerError(
                                      errors.customers?.[index]
                                    ) &&
                                      touched.customers?.[index]?.salutation &&
                                      errors.customers[index]?.salutation && (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.salutation}
                                        </span>
                                      )}
                                  </FormHelperText>
                                </div>

                                {/* Name Fields */}
                                <div>
                                  <TextField
                                    label="First Name"
                                    value={
                                      values.customers?.[index]?.firstName || ""
                                    }
                                    onChange={(e: any) =>
                                      setFieldValue(
                                        `customers[${index}].firstName`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.firstName &&
                                      Boolean(
                                        errors.customers[index]?.firstName
                                      )
                                    }
                                    helperText={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.firstName &&
                                      errors.customers[index]?.firstName ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.firstName}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                <div>
                                  <TextField
                                    label="Middle Name"
                                    value={
                                      values.customers?.[index]?.middleName ||
                                      ""
                                    }
                                    onChange={(e: any) =>
                                      setFieldValue(
                                        `customers[${index}].middleName`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.middleName &&
                                      Boolean(
                                        errors.customers[index]?.middleName
                                      )
                                    }
                                    helperText={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.middleName &&
                                      errors.customers[index]?.middleName ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.middleName}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                <div>
                                  <TextField
                                    label="Last Name"
                                    value={
                                      values.customers?.[index]?.lastName || ""
                                    }
                                    onChange={(e: any) =>
                                      setFieldValue(
                                        `customers[${index}].lastName`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.lastName &&
                                      Boolean(errors.customers[index]?.lastName)
                                    }
                                    helperText={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.lastName &&
                                      errors.customers[index]?.lastName ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.lastName}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                {/* Date of Birth */}
                                <div>
                                  <TextField
                                    label="Date of Birth"
                                    type="date"
                                    value={
                                      values.customers?.[index]?.dateOfBirth ||
                                      ""
                                    }
                                    onChange={(e: any) =>
                                      setFieldValue(
                                        `customers[${index}].dateOfBirth`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.dateOfBirth &&
                                      Boolean(
                                        errors.customers[index]?.dateOfBirth
                                      )
                                    }
                                    helperText={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.dateOfBirth &&
                                      errors.customers[index]?.dateOfBirth ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.dateOfBirth}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    slotProps={{
                                      inputLabel: { shrink: true },
                                      input: { inputProps: { max: maxDate } },
                                    }}
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                {/* Gender */}
                                <div>
                                  <InputLabel id={`gender-label-${index}`}>
                                    Gender
                                  </InputLabel>
                                  <Select
                                    labelId={`gender-label-${index}`}
                                    value={
                                      values.customers?.[index]?.gender || ""
                                    }
                                    onChange={(e: any) =>
                                      setFieldValue(
                                        `customers[${index}].gender`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.gender &&
                                      Boolean(errors.customers?.[index]?.gender)
                                    }
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                  >
                                    <MenuItem value="">Select Gender</MenuItem>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Transgender">
                                      Transgender
                                    </MenuItem>
                                  </Select>
                                  <FormHelperText>
                                    {isCustomerError(
                                      errors.customers?.[index]
                                    ) &&
                                      touched.customers?.[index]?.gender &&
                                      errors.customers[index]?.gender && (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.gender}
                                        </span>
                                      )}
                                  </FormHelperText>
                                </div>

                                {/* Photo Upload */}
                                <div>
                                  <InputLabel
                                    htmlFor={`customers[${index}].photo`}
                                  >
                                    Upload Photo
                                  </InputLabel>
                                  <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    startIcon={<UploadFileIcon />}
                                    size="small"
                                    color={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.photo &&
                                      errors.customers?.[index]?.photo
                                        ? "error"
                                        : "primary"
                                    }
                                  >
                                    Upload Photo
                                    <input
                                      id={`customers[${index}].photo`}
                                      type="file"
                                      hidden
                                      name={`customers[${index}].photo`}
                                      accept="image/*"
                                      onChange={handleFileChange(index)}
                                    />
                                  </Button>
                                  {values.customers[index].photoPreview && (
                                    <div>
                                      <h5>Preview:</h5>
                                      <img
                                        src={
                                          values.customers[index].photoPreview
                                        }
                                        alt="Preview"
                                        className={styles.previewImage}
                                        style={{
                                          maxWidth: "200px",
                                          maxHeight: "200px",
                                        }}
                                      />
                                    </div>
                                  )}

                                  <FormHelperText>
                                    {isCustomerError(
                                      errors.customers?.[index]
                                    ) &&
                                      touched.customers?.[index]?.photo &&
                                      errors.customers[index]?.photo && (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.photo}
                                        </span>
                                      )}
                                  </FormHelperText>
                                </div>

                                {/* Marital Status */}
                                <div>
                                  <InputLabel
                                    id={`marital-status-label-${index}`}
                                  >
                                    Marital Status
                                  </InputLabel>
                                  <Select
                                    labelId={`marital-status-label-${index}`}
                                    value={
                                      values.customers?.[index]
                                        ?.maritalStatus || ""
                                    }
                                    onChange={(e) =>
                                      setFieldValue(
                                        `customers[${index}].maritalStatus`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]
                                        ?.maritalStatus &&
                                      Boolean(
                                        errors.customers?.[index]?.maritalStatus
                                      )
                                    }
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                  >
                                    <MenuItem value="">
                                      Select Marital Status
                                    </MenuItem>
                                    <MenuItem value="Single">Single</MenuItem>
                                    <MenuItem value="Married">Married</MenuItem>
                                  </Select>
                                  <FormHelperText>
                                    {isCustomerError(
                                      errors.customers?.[index]
                                    ) &&
                                      touched.customers?.[index]
                                        ?.maritalStatus &&
                                      errors.customers[index]
                                        ?.maritalStatus && (
                                        <span className={styles.errorText}>
                                          {
                                            errors.customers[index]
                                              ?.maritalStatus
                                          }
                                        </span>
                                      )}
                                  </FormHelperText>
                                </div>

                                {/* Nationality */}
                                <div>
                                  <InputLabel id={`nationality-label-${index}`}>
                                    Nationality
                                  </InputLabel>
                                  <Select
                                    labelId={`nationality-label-${index}`}
                                    value={
                                      values.customers?.[index]?.nationality ||
                                      ""
                                    }
                                    onChange={(e: any) =>
                                      setFieldValue(
                                        `customers[${index}].nationality`,
                                        e.target.value
                                      )
                                    }
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.nationality &&
                                      Boolean(
                                        errors.customers?.[index]?.nationality
                                      )
                                    }
                                  >
                                    <MenuItem value="">
                                      Select Nationality
                                    </MenuItem>
                                    <MenuItem value="Resident">
                                      Resident
                                    </MenuItem>
                                    <MenuItem value="PIO">PIO</MenuItem>
                                    <MenuItem value="NRI">NRI</MenuItem>
                                    <MenuItem value="OCI">OCI</MenuItem>
                                  </Select>
                                  <FormHelperText>
                                    {isCustomerError(
                                      errors.customers?.[index]
                                    ) &&
                                      touched.customers?.[index]?.nationality &&
                                      errors.customers[index]?.nationality && (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.nationality}
                                        </span>
                                      )}
                                  </FormHelperText>
                                </div>

                                {/* Email & Phone */}
                                <div>
                                  <TextField
                                    label="Email"
                                    type="email"
                                    value={
                                      values.customers?.[index]?.email || ""
                                    }
                                    onChange={(e: any) =>
                                      setFieldValue(
                                        `customers[${index}].email`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.email &&
                                      Boolean(errors.customers?.[index]?.email)
                                    }
                                    helperText={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.email &&
                                      errors.customers[index]?.email ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.email}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                <div>
                                  <TextField
                                    label="Phone Number"
                                    type="tel"
                                    name={`customers[${index}].phoneNumber`}
                                    value={
                                      values.customers?.[index]?.phoneNumber ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setFieldValue(
                                        `customers[${index}].phoneNumber`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.phoneNumber &&
                                      Boolean(
                                        errors.customers?.[index]?.phoneNumber
                                      )
                                    }
                                    helperText={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.phoneNumber &&
                                      errors.customers?.[index]?.phoneNumber ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.phoneNumber}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                {/* Additional Fields */}
                                <div>
                                  <TextField
                                    label="Number of Children"
                                    type="number"
                                    name={`customers[${index}].numberOfChildren`}
                                    value={
                                      values.customers?.[index]
                                        ?.numberOfChildren || ""
                                    }
                                    onChange={(e) =>
                                      setFieldValue(
                                        `customers[${index}].numberOfChildren`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]
                                        ?.numberOfChildren &&
                                      Boolean(
                                        errors.customers?.[index]
                                          ?.numberOfChildren
                                      )
                                    }
                                    helperText={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]
                                        ?.numberOfChildren &&
                                      errors.customers?.[index]
                                        ?.numberOfChildren ? (
                                        <span className={styles.errorText}>
                                          {
                                            errors.customers[index]
                                              ?.numberOfChildren
                                          }
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                <div>
                                  <TextField
                                    label="Anniversary Date"
                                    type="date"
                                    name={`customers[${index}].anniversaryDate`}
                                    value={
                                      values.customers?.[index]
                                        ?.anniversaryDate || ""
                                    }
                                    onChange={(e) =>
                                      setFieldValue(
                                        `customers[${index}].anniversaryDate`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]
                                        ?.anniversaryDate &&
                                      Boolean(
                                        errors.customers[index]?.anniversaryDate
                                      )
                                    }
                                    helperText={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]
                                        ?.anniversaryDate &&
                                      errors.customers[index]
                                        ?.anniversaryDate ? (
                                        <span className={styles.errorText}>
                                          {
                                            errors.customers[index]
                                              ?.anniversaryDate
                                          }
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    slotProps={{
                                      inputLabel: { shrink: true }, // ✅ replaces deprecated InputLabelProps
                                      input: {
                                        inputProps: {
                                          max: new Date()
                                            .toISOString()
                                            .split("T")[0], // disables future dates
                                        },
                                      },
                                    }}
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                <div>
                                  {/* <label>Aadhar Number:</label> */}
                                  <TextField
                                    label="Aadhar Number"
                                    type="number"
                                    name={`customers[${index}].aadharNumber`}
                                    value={
                                      values.customers?.[index]?.aadharNumber ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setFieldValue(
                                        `customers[${index}].aadharNumber`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]
                                        ?.aadharNumber &&
                                      Boolean(
                                        errors.customers[index]?.aadharNumber
                                      )
                                    }
                                    helperText={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]
                                        ?.aadharNumber &&
                                      errors.customers[index]?.aadharNumber ? (
                                        <span className={styles.errorText}>
                                          {
                                            errors.customers[index]
                                              ?.aadharNumber
                                          }
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                <div>
                                  {/* <label>PAN Number:</label> */}
                                  <TextField
                                    label="PAN Number"
                                    type="text"
                                    name={`customers[${index}].panNumber`}
                                    value={
                                      values.customers?.[index]?.panNumber || ""
                                    }
                                    onChange={(e) =>
                                      setFieldValue(
                                        `customers[${index}].panNumber`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.panNumber &&
                                      Boolean(
                                        errors.customers[index]?.panNumber
                                      )
                                    }
                                    helperText={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.panNumber &&
                                      errors.customers[index]?.panNumber ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index]?.panNumber}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                <div>
                                  <TextField
                                    label="Passport Number"
                                    type="text"
                                    name={`customers[${index}].passportNumber`}
                                    value={
                                      values.customers?.[index]
                                        ?.passportNumber || ""
                                    }
                                    onChange={(e) =>
                                      setFieldValue(
                                        `customers[${index}].passportNumber`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]
                                        ?.passportNumber &&
                                      Boolean(
                                        errors.customers[index]?.passportNumber
                                      )
                                    }
                                    helperText={
                                      touched.customers?.[index]
                                        ?.passportNumber &&
                                      typeof errors.customers?.[index] ===
                                        "object" &&
                                      errors.customers[index]
                                        ?.passportNumber ? (
                                        <span className={styles.errorText}>
                                          {
                                            errors.customers[index]
                                              .passportNumber
                                          }
                                        </span>
                                      ) : typeof errors.customers?.[index] ===
                                        "string" ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index] as string}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                <div>
                                  <TextField
                                    label="Profession"
                                    type="text"
                                    name={`customers[${index}].profession`}
                                    value={
                                      values.customers?.[index]?.profession ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setFieldValue(
                                        `customers[${index}].profession`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.profession &&
                                      Boolean(
                                        errors.customers[index]?.profession
                                      )
                                    }
                                    helperText={
                                      touched.customers?.[index]?.profession &&
                                      typeof errors.customers?.[index] ===
                                        "object" &&
                                      errors.customers[index]?.profession ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index].profession}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                <div>
                                  <TextField
                                    label="Designation"
                                    type="text"
                                    name={`customers[${index}].designation`}
                                    value={
                                      values.customers?.[index]?.designation ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setFieldValue(
                                        `customers[${index}].designation`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.designation &&
                                      Boolean(
                                        errors.customers[index]?.designation
                                      )
                                    }
                                    helperText={
                                      touched.customers?.[index]?.designation &&
                                      typeof errors.customers?.[index] ===
                                        "object" &&
                                      errors.customers[index]?.designation ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index].designation}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

                                <div>
                                  <TextField
                                    label="Company Name"
                                    type="text"
                                    name={`customers[${index}].companyName`}
                                    value={
                                      values.customers?.[index]?.companyName ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setFieldValue(
                                        `customers[${index}].companyName`,
                                        e.target.value
                                      )
                                    }
                                    error={
                                      isCustomerError(
                                        errors.customers?.[index]
                                      ) &&
                                      touched.customers?.[index]?.companyName &&
                                      Boolean(
                                        errors.customers[index]?.companyName
                                      )
                                    }
                                    helperText={
                                      touched.customers?.[index]?.companyName &&
                                      typeof errors.customers?.[index] ===
                                        "object" &&
                                      errors.customers[index]?.companyName ? (
                                        <span className={styles.errorText}>
                                          {errors.customers[index].companyName}
                                        </span>
                                      ) : (
                                        ""
                                      )
                                    }
                                    fullWidth
                                    size="small"
                                  />
                                </div>

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
                    </>
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    {/* New company form */}
                    <Box sx={{ mt: 2 }}>
                      <InputLabel>Company Name *</InputLabel>
                      <Field
                        as={TextField}
                        name="companyBuyer.name"
                        fullWidth
                        error={
                          touched.companyBuyer?.name &&
                          !!errors.companyBuyer?.name
                        }
                        helperText={<ErrorMessage name="companyBuyer.name" />}
                      />
                      <InputLabel>Company PAN Number</InputLabel>
                      <Field
                        as={TextField}
                        name="companyBuyer.companyPan"
                        fullWidth
                        inputProps={{
                          maxLength: 10,
                          style: { textTransform: "uppercase" },
                        }}
                        error={
                          touched.companyBuyer?.companyPan &&
                          !!errors.companyBuyer?.companyPan
                        }
                        helperText={
                          <ErrorMessage name="companyBuyer.companyPan" />
                        }
                      />
                      <InputLabel>Company GST</InputLabel>
                      <Field
                        as={TextField}
                        name="companyBuyer.companyGST"
                        // value={values.companyBuyer?.companyGST || ""}
                        fullWidth
                        error={
                          touched.companyBuyer?.companyGST &&
                          !!errors.companyBuyer?.companyGST
                        }
                        helperText={
                          <ErrorMessage name="companyBuyer.companyGST" />
                        }
                      />
                      <InputLabel>Aadhar Number</InputLabel>
                      <Field
                        as={TextField}
                        name="companyBuyer.aadharNumber"
                        fullWidth
                        error={
                          touched.companyBuyer?.aadharNumber &&
                          !!errors.companyBuyer?.aadharNumber
                        }
                        helperText={
                          <ErrorMessage name="companyBuyer.aadharNumber" />
                        }
                      />

                      <InputLabel>PAN Number</InputLabel>
                      <Field
                        as={TextField}
                        name="companyBuyer.panNumber"
                        fullWidth
                        inputProps={{
                          maxLength: 10,
                          style: { textTransform: "uppercase" },
                        }}
                        error={
                          touched.companyBuyer?.panNumber &&
                          !!errors.companyBuyer?.panNumber
                        }
                        helperText={
                          <ErrorMessage name="companyBuyer.panNumber" />
                        }
                      />
                      {errors.companyBuyer &&
                        typeof errors.companyBuyer === "string" && (
                          <FormHelperText
                            error
                            sx={{ mt: 2, fontSize: "0.875rem" }}
                          >
                            {errors.companyBuyer as string}
                          </FormHelperText>
                        )}
                    </Box>
                  </TabPanel>

                  {/* Navigation buttons */}
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
