"use client";

import React, { useEffect, useState } from "react";
import { getSelf } from "../../../redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
const Page = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSelf = async () => {
      const res = await getSelf();
      setData(res);
      setLoading(false);
    };

    fetchSelf();
  }, []);

  if (loading) return <Loader />;
  if (data?.error) return <div>Error: {data.message}</div>;

  const org = data?.data;

  return (
    <div className={styles.organizationProfile}>
      <div className={styles.card}>
        {org.logo ? (
          <img src={org.logo} alt="Organization Logo" className={styles.logo} />
        ) : (
          <div className={styles.placeholderLogo}>No Logo</div>
        )}
        <h2 className={styles.name}>{org.name}</h2>
        <p className={styles.gst}>
          <strong>GST:</strong> {org.gst || "Not Provided"}
        </p>
      </div>
    </div>
  );
};

export default Page;
