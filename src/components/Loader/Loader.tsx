import React from "react";
import ReactDOM from "react-dom";
import Spinner from "react-bootstrap/Spinner";
import styles from "./loader.module.scss";

const Loader = () => {
  return ReactDOM.createPortal(
    <div className={styles.loader}>
      <Spinner animation="border" />
    </div>,
    document.body // ⬅️ Appends directly to the body
  );
};

export default Loader;
