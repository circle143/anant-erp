"use client";
import React, { useEffect, useState } from "react";
import { getSelf } from "../../../redux/action/org-admin";
import styles from "./page.module.scss";
import { getUrl } from "aws-amplify/storage";
import Loader from "@/components/Loader/Loader";

const Page = () => {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelf = async () => {
      try {
        const res = await getSelf();

        if (!res?.error && res?.data) {
          const item = res.data;

          if (item.logo) {
            try {
              const getUrlResult = await getUrl({
                path: item.logo,
                options: {
                  validateObjectExistence: true,
                  expiresIn: 3600,
                },
              });
              item.logo = getUrlResult.url.toString();
            } catch (err) {
              console.error("Error fetching logo URL", err);
            }
          }

          setOrg(item);
        } else {
          setErrorMsg(res?.message || "Something went wrong.");
        }
      } catch (err) {
        console.error("Failed to fetch organization data", err);
        setErrorMsg("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchSelf();
  }, []);

  if (loading) return <Loader />;
  if (errorMsg) return <div>Error: {errorMsg}</div>;

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
