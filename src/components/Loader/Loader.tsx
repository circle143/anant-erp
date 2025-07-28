"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Spinner from "react-bootstrap/Spinner";
import styles from "./loader.module.scss";

const Loader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensures this only runs on the client
  }, []);

  if (!mounted) return null;

  return ReactDOM.createPortal(
    <div className={styles.loader}>
      <Spinner animation="border" />
    </div>,
    document.body
  );
};

export default Loader;
