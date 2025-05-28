"use client";

import React, { useEffect, useState } from "react";
import { getAllSocietyBrokers, getSocieties } from "@/redux/action/org-admin";
import { getBrokerReport } from "@/redux/action/org-admin"; // ensure path is correct
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from "@/components/Loader/Loader";
import styles from "./page.module.scss"; // ensure path is correct
const page = () => {
  const [societies, setSocieties] = useState<
    { reraNumber: string; name: string }[]
  >([]);
  const [brokers, setBrokers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const today = new Date().toISOString().split("T")[0];

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

    fetchAllSocieties().then(setSocieties);
  }, []);

  const formik = useFormik({
    initialValues: {
      society: "",
      broker: "",
      recordsFrom: "",
      recordsTill: "",
    },
    validationSchema: Yup.object({
      society: Yup.string().required("Select a society"),
      broker: Yup.string().required("Select a broker"),

      recordsFrom: Yup.date()
        .nullable()
        .transform((value, originalValue) =>
          !originalValue ? null : new Date(originalValue)
        )
        .max(new Date(), "Start date can't be in the future"),

      recordsTill: Yup.date()
        .nullable()
        .transform((value, originalValue) =>
          !originalValue ? null : new Date(originalValue)
        )
        .max(new Date(), "End date can't be in the future")
        .test(
          "endDateAfterStartDate",
          "End date cannot be before start date",
          function (value) {
            const { recordsFrom } = this.parent;
            if (!value || !recordsFrom) return true; // only validate when both are defined
            return new Date(value) >= new Date(recordsFrom);
          }
        ),
    }),

    onSubmit: async (values) => {
      setLoading(true);
      const data = await getBrokerReport(
        values.society,
        values.broker,
        values.recordsFrom ? new Date(values.recordsFrom) : undefined,
        values.recordsTill ? new Date(values.recordsTill) : undefined
      );
      setReport(data);
      setLoading(false);
    },
  });

  const handleSocietyChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const reraNumber = e.target.value;
    formik.setFieldValue("society", reraNumber);
    formik.setFieldValue("broker", "");
    setBrokers([]);
    setReport(null);

    if (!reraNumber) return;

    setLoading(true);
    const fetchAllBrokers = async (
      cursor: string | null = null,
      accumulated: { id: string; name: string }[] = []
    ): Promise<{ id: string; name: string }[]> => {
      const response = await getAllSocietyBrokers(reraNumber, cursor);
      if (response?.error) return accumulated;

      const items = response?.data?.items || [];
      const newData = [...accumulated, ...items];
      const hasNext = response?.data?.pageInfo?.nextPage;
      const nextCursor = response?.data?.pageInfo?.cursor;

      if (hasNext && nextCursor) {
        return await fetchAllBrokers(nextCursor, newData);
      }

      return newData;
    };

    const brokerData = await fetchAllBrokers();
    setBrokers(brokerData);
    
    setLoading(false);
  };
  const handleClearFilter = async () => {
    formik.setFieldValue("recordsFrom", "");
    formik.setFieldValue("recordsTill", "");
    formik.setTouched({ recordsFrom: false, recordsTill: false });
    formik.setErrors({ recordsFrom: undefined, recordsTill: undefined });

    if (formik.values.society && formik.values.broker) {
      setLoading(true);
      const data = await getBrokerReport(
        formik.values.society,
        formik.values.broker
      );
      setReport(data);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Broker Report</h1>
      {loading && <Loader />}

      <form onSubmit={formik.handleSubmit}>
        <div className={styles.formGroup}>
          <div>
            <label>Society</label>
            <select
              name="society"
              value={formik.values.society}
              onChange={handleSocietyChange}
              className={styles.brokerSelect}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Society</option>
              {societies.map((s) => (
                <option key={s.reraNumber} value={s.reraNumber}>
                  {s.name} (Rera: {s.reraNumber})
                </option>
              ))}
            </select>
            {formik.touched.society && formik.errors.society && (
              <p style={{ color: "red" }}>{formik.errors.society}</p>
            )}
          </div>

          <div>
            <label>Broker</label>
            <select
              name="broker"
              value={formik.values.broker}
              className={styles.brokerSelect}
              onChange={async (e) => {
                const brokerId = e.target.value;
                await formik.setFieldValue("broker", brokerId);
                if (formik.values.society && brokerId) {
                  setLoading(true);
                  const data = await getBrokerReport(
                    formik.values.society,
                    brokerId,
                    formik.values.recordsFrom
                      ? new Date(formik.values.recordsFrom)
                      : undefined,
                    formik.values.recordsTill
                      ? new Date(formik.values.recordsTill)
                      : undefined
                  );
                  console.log("Broker Report Data:", data);
                  setReport(data);
                  setLoading(false);
                }
              }}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Broker</option>
              {brokers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {formik.touched.broker && formik.errors.broker && (
              <p style={{ color: "red" }}>{formik.errors.broker}</p>
            )}
          </div>
        </div>
        <div className={styles.dateGroup}>
          <div>
            <label>Start Date</label>
            <input
              type="date"
              name="recordsFrom"
              className={styles.date}
              max={formik.values.recordsTill || today}
              value={formik.values.recordsFrom}
              onChange={formik.handleChange}
            />
            {formik.touched.recordsFrom && formik.errors.recordsFrom && (
              <p style={{ color: "red" }}>{formik.errors.recordsFrom}</p>
            )}
          </div>

          <div>
            <label>End Date</label>
            <input
              type="date"
              name="recordsTill"
              className={styles.date}
              min={formik.values.recordsFrom || ""}
              max={today}
              value={formik.values.recordsTill}
              onChange={formik.handleChange}
            />
            {formik.touched.recordsTill && formik.errors.recordsTill && (
              <p style={{ color: "red" }}>{formik.errors.recordsTill}</p>
            )}
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Apply Filter"}
            </button>
            <button
              type="button"
              onClick={handleClearFilter}
              disabled={
                loading || !formik.values.society || !formik.values.broker
              }
            >
              Clear Filter
            </button>
          </div>
        </div>
      </form>

      {/* Report Display */}
      {report && (
        <div className={styles.reportContainer}>
          <h2>Broker Report Data</h2>
          <pre>{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default page;
