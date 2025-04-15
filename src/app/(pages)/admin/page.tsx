import React from "react";

const page = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return <div>page - API URL: {apiUrl}</div>;
};

export default page;
