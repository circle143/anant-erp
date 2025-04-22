"use client";

import React, { useEffect, useState } from "react";
import { getSelf } from "../../../../redux/action/org-admin"; // adjust the path based on your structure

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

  if (loading) return <div>Loading...</div>;

  if (data?.error) return <div>Error: {data.message}</div>;

  return (
    <div>
      <h1>Self Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Page;
