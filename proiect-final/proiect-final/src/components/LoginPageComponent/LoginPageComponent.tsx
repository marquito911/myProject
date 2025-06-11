import React, { type JSX, useState } from "react";
import { Button, TextField, Snackbar, SnackbarContent } from "@mui/material";
import { useNavigate } from "react-router-dom"; 
import { FirebaseError } from "firebase/app";
import styles from "./LoginPageComponent.module.scss";
import { useAuth } from "../../contexts/AuthContext";

const LoginPageComponent: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [credentials, updateCredentials] = useState({ email: "", password: "" });
  const [snackbarOpen, toggleSnackbar] = useState(false);
  const [snackbarMessage, setMessage] = useState("");

  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateCredentials(prev => ({ ...prev, [name]: value }));
  };

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!credentials.email || !credentials.password) {
      setMessage("Please fill in both email and password.");
      toggleSnackbar(true);
      return;
    }

    try {
      await login(credentials.email, credentials.password);
      navigate("/");
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/wrong-password":
          case "auth/invalid-email":
            setMessage("Incorrect email or password.");
            break;
          case "auth/user-not-found":
            setMessage("No user found with this email.");
            break;
          default:
            setMessage("An error occurred. Please try again.");
        }
      } else {
        setMessage("Something went wrong. Please try again.");
      }
      toggleSnackbar(true);
    }
  };

  const closeSnackbar = () => {
    toggleSnackbar(false);
  };

  return (
    <div className={styles.logincontainer}>
      <form onSubmit={submitLogin} className={styles.loginform}>
        <div className={styles.formfield}>
          <TextField
            label="Email"
            variant="filled"
            name="email"
            type="email"
            value={credentials.email}
            onChange={updateField}
            fullWidth
            required
            autoFocus
          />
        </div>

        <div className={styles.formfield}>
          <TextField
            label="Password"
            variant="filled"
            name="password"
            type="password"
            value={credentials.password}
            onChange={updateField}
            fullWidth
            required
          />
        </div>

        <div className={styles.formactions}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={styles.loginbutton}
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
        onClose={closeSnackbar}
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
