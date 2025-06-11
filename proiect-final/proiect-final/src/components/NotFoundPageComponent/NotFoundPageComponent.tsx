import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotFoundPageComponent.module.scss";

const NotFoundPageComponent: React.FC = () => {
  const navigate = useNavigate();

  const redirect = () => {
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.message}>Ups! The page you are looking for does not exist.</p>
      <button className={styles.button} onClick={redirect}>
      Back to main page
      </button>
    </div>
  );
};

export default NotFoundPageComponent;
