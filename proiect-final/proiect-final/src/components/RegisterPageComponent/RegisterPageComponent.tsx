import React, { useState, type JSX } from "react";
import {
  Button,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import styles from "./RegisterPageComponent.module.scss";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import type { IUser } from "../../interfaces/AuthContext";
import { auth, db } from "../../firebase";

const RegisterPageComponent: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{ [key: string]: string }>({
    email: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
    age: "",
    id: "",
  });

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({
    email: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
    age: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [emailIssue, setEmailIssue] = useState<string | undefined>(undefined);
  const [registrationStatus, setRegistrationStatus] = useState<{
    success: boolean;
    errorCode?: string;
  }>({
    success: false,
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((visible) => !visible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((visible) => !visible);
  };

  async function createNewUser(userInfo: IUser, pwd: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, userInfo.email, pwd);
      const createdTimestamp = new Date(result.user.metadata.creationTime!).getTime();
      const lastLoginTimestamp = new Date(result.user.metadata.lastSignInTime!).getTime();

      const completeUserData: IUser = {
        ...userInfo,
        id: result.user.uid,
        createdAt: createdTimestamp,
        lastLoginAt: lastLoginTimestamp,
      };

      await setDoc(doc(db, "users", completeUserData.id), completeUserData);
      setRegistrationStatus({ success: true });
      return { success: true };
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "auth/email-already-in-use") {
        setEmailIssue("Email already in use");
      } else {
        setEmailIssue("An unexpected error occurred");
      }
      setSnackbarOpen(true);
      setRegistrationStatus({
        success: false,
        errorCode: err instanceof FirebaseError ? err.code : undefined,
      });
      return {
        success: false,
        errorCode: err instanceof FirebaseError ? err.code : undefined,
      };
    }
  }

  function verifyForm(): boolean {
    let valid = true;
    const errors = {
      email: "",
      password: "",
      confirmPassword: "",
      firstname: "",
      lastname: "",
      age: "",
    };

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "The email is not valid.";
      valid = false;
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
      valid = false;
    }

    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    const nameRegex = /^[A-Za-z]+$/;
    if (
      !formData.firstname ||
      formData.firstname.length < 2 ||
      formData.firstname.length > 20 ||
      !nameRegex.test(formData.firstname)
    ) {
      errors.firstname = "First name must be between 2 and 20 letters.";
      valid = false;
    }

    if (
      !formData.lastname ||
      formData.lastname.length < 2 ||
      formData.lastname.length > 20 ||
      !nameRegex.test(formData.lastname)
    ) {
      errors.lastname = "Last name must be between 2 and 20 letters.";
      valid = false;
    }

    const ageNum = parseInt(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      errors.age = "Age must be a number between 18 and 120.";
      valid = false;
    }

    setValidationErrors(errors);
    return valid;
  }

  function updateField(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    const formatNameValue = (txt: string) =>
      txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();

    setFormData((prev) => ({
      ...prev,
      [name]: name === "firstname" || name === "lastname" ? formatNameValue(value) : value,
    }));
  }

  async function submitRegistration() {
    if (verifyForm()) {
      const userInfo: IUser = {
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        age: formData.age,
        isAdmin: false,
        isActive: true,
        id: "",
        Owner: false,
      };

      const result = await createNewUser(userInfo, formData.password);
      if (result?.success) {
        navigate("/");
      }
    }
  }

  function closeSnackbar() {
    setSnackbarOpen(false);
  }

  return (
    <>
      <div className={styles.registercontainer}>
        <form className={styles.registerform}>
          <TextField
            className={styles.textfield}
            id="filled-email"
            label="Email"
            variant="filled"
            name="email"
            type="email"
            onChange={updateField}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
          <TextField
            className={styles.textfield}
            type={isPasswordVisible ? "text" : "password"}
            id="filled-password"
            label="Password"
            variant="filled"
            name="password"
            onChange={updateField}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            className={styles.textfield}
            type={isConfirmPasswordVisible ? "text" : "password"}
            id="filled-confirm-password"
            label="Confirm Password"
            variant="filled"
            name="confirmPassword"
            onChange={updateField}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                    {isConfirmPasswordVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            className={styles.textfield}
            type="text"
            id="filled-firstname"
            label="First Name"
            variant="filled"
            name="firstname"
            onChange={updateField}
            error={!!validationErrors.firstname}
            helperText={validationErrors.firstname}
          />
          <TextField
            className={styles.textfield}
            type="text"
            id="filled-lastname"
            label="Last Name"
            variant="filled"
            name="lastname"
            onChange={updateField}
            error={!!validationErrors.lastname}
            helperText={validationErrors.lastname}
          />
          <TextField
            className={styles.textfield}
            type="number"
            id="filled-age"
            label="Age"
            variant="filled"
            name="age"
            onChange={updateField}
            error={!!validationErrors.age}
            helperText={validationErrors.age}
          />
          <Button
            variant="outlined"
            className={styles.registerbutton}
            onClick={submitRegistration}
          >
            Register
          </Button>
          <p className={styles.formfooter}>
            Already have an account? <a href="/login">Login here</a>.
          </p>
        </form>
      </div>

      {emailIssue && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={closeSnackbar}
        >
          <Alert onClose={closeSnackbar} severity="error" variant="filled">
            {emailIssue}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default RegisterPageComponent;
