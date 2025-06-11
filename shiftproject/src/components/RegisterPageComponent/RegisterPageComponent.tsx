import React, { JSX, useState } from "react";
import {
  Button,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IUser } from "../../interfaces/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./RegisterPageComponent.module.scss";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

const RegisterPageComponent: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ [key: string]: string }>({
    email: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
    age: "",
    id: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({
    email: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
    age: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [isRegisterSucces, setIsRegisterSucces] = useState<{
    succes: boolean;
    error?: string;
  }>({
    succes: false,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const register = async (user: IUser, password: string) => {
    try {
      const data = await createUserWithEmailAndPassword(auth, user.email, password);
      const createdAtString = data.user.metadata.creationTime;
      const lastLoginAtString = data.user.metadata.lastSignInTime;
      const createdAt = new Date(createdAtString!).getTime();
      const lastLoginAt = new Date(lastLoginAtString!).getTime();

      const userData: IUser = {
        ...user,
        id: data.user.uid,
        createdAt: createdAt,
        lastLoginAt: lastLoginAt,
      };

      await setDoc(doc(db, "users", userData.id), userData);
      setIsRegisterSucces({ succes: true });
      return { succes: true };
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === "auth/email-already-in-use"
      ) {
        setEmailError("Email already in use");
        setOpenSnackbar(true);
      } else {
        setEmailError("Error");
        setOpenSnackbar(true);
      }

      setIsRegisterSucces({
        succes: false,
        error: error instanceof FirebaseError ? error.code : "",
      });
      return {
        succes: false,
        error: error instanceof FirebaseError ? error.code : "",
      };
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      firstname: "",
      lastname: "",
      age: "",
    };

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!user.email || !emailPattern.test(user.email)) {
      newErrors.email = "The email is not valid.";
      isValid = false;
    }

    if (!user.password || user.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
      isValid = false;
    }

    if (!user.confirmPassword || user.password !== user.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    const firstNamePattern = /^[A-Za-z]+$/;
    if (
      !user.firstname ||
      user.firstname.length < 2 ||
      user.firstname.length > 20 ||
      !firstNamePattern.test(user.firstname)
    ) {
      newErrors.firstname = "First name must be between 2 and 20 letters.";
      isValid = false;
    }

    const lastNamePattern = /^[A-Za-z]+$/;
    if (
      !user.lastname ||
      user.lastname.length < 2 ||
      user.lastname.length > 20 ||
      !lastNamePattern.test(user.lastname)
    ) {
      newErrors.lastname = "Last name must be between 2 and 20 letters.";
      isValid = false;
    }

    const age = parseInt(user.age);
    if (!user.age || isNaN(age) || age < 6 || age > 130) {
      newErrors.age = "Age must be a number between 6 and 130.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const formatName = (text: string) =>
      text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    setUser((prevUser) => ({
      ...prevUser,
      [name]:
        name === "firstname" || name === "lastname" ? formatName(value) : value,
    }));
  };

  const handleRegister = async () => {
    if (validateForm()) {
      const newUser: IUser = {
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        age: user.age,
        isAdmin: false,
        isActive: true,
        id: "",
        Owner: false,
      };

      const registerSucces = await register(newUser, user.password);
      if (registerSucces?.succes) {
        navigate("/");
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <div className={styles["register-container"]}>
        <form className={styles["register-form"]}>
          <TextField
            className={styles["text-field"]}
            id="filled-email"
            label="Email"
            variant="filled"
            name="email"
            type="email"
            onChange={handleChangeInput}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            className={styles["text-field"]}
            type={showPassword ? "text" : "password"}
            id="filled-password"
            label="Password"
            variant="filled"
            name="password"
            onChange={handleChangeInput}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            className={styles["text-field"]}
            type={showConfirmPassword ? "text" : "password"}
            id="filled-confirm-password"
            label="Confirm Password"
            variant="filled"
            name="confirmPassword"
            onChange={handleChangeInput}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowConfirmPassword} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            className={styles["text-field"]}
            type="text"
            id="filled-firstname"
            label="First Name"
            variant="filled"
            name="firstname"
            onChange={handleChangeInput}
            error={!!errors.firstname}
            helperText={errors.firstname}
          />
          <TextField
            className={styles["text-field"]}
            type="text"
            id="filled-lastname"
            label="Last Name"
            variant="filled"
            name="lastname"
            onChange={handleChangeInput}
            error={!!errors.lastname}
            helperText={errors.lastname}
          />
          <TextField
            className={styles["text-field"]}
            type="number"
            id="filled-age"
            label="Age"
            variant="filled"
            name="age"
            onChange={handleChangeInput}
            error={!!errors.age}
            helperText={errors.age}
          />
          <Button
            variant="outlined"
            className={styles["register-button"]}
            onClick={handleRegister}
          >
            Register
          </Button>
        </form>
      </div>

      {emailError && (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            variant="filled"
          >
            {emailError}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default RegisterPageComponent;
