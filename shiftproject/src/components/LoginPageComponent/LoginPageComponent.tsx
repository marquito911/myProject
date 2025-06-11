import React, { JSX, useState } from "react";
import { Button, TextField, Snackbar, SnackbarContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FirebaseError } from "firebase/app";
import styles from "./LoginPageComponent.module.scss";

const LoginPageComponent: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSnackbarMessage("");

    if (!credentials.email || !credentials.password) {
      setSnackbarMessage("Please fill in both email and password.");
      setSnackbarOpen(true);
      return;
    }

    try {
      await login(credentials.email, credentials.password);
      navigate("/");
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/wrong-password":
          case "auth/invalid-email":
            setSnackbarMessage("Incorrect email or password.");
            break;
          case "auth/user-not-found":
            setSnackbarMessage("No user found with this email.");
            break;
          default:
            setSnackbarMessage("An error occurred. Please try again.");
        }
      } else {
        setSnackbarMessage("Something went wrong. Please try again.");
      }
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className={styles["login-container"]}>
      <form onSubmit={handleLogin} className={styles["login-form"]}>
        <div className={styles["form-field"]}>
          <TextField
            label="Email"
            variant="filled"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleInputChange}
            fullWidth
            required
            autoFocus
          />
        </div>

        <div className={styles["form-field"]}>
          <TextField
            label="Password"
            variant="filled"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </div>

        <div className={styles["form-actions"]}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={styles["login-button"]}
          >
            Login
          </Button>
          <br />
          <br />
        <p> If you are not registered, please go to the <a href="/register">register</a> page.</p> 

        </div>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <SnackbarContent
          message={snackbarMessage || "An error occurred."}
          style={{
            backgroundColor: "#f44336",
            color: "white",
            fontWeight: "bold",
          }}
        />
      </Snackbar>
    </div>
  );
};

export default LoginPageComponent;
