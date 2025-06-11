import {
  type User,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import React, { useState, useEffect, type JSX } from "react";
import {
  Button,
  TextField,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useNavigate, useParams } from "react-router-dom";

import styles from "./MyProfilePageComponent.module.scss";
import { useAuth } from "../../contexts/AuthContext";
import type { IUser } from "../../interfaces/AuthContext";
import { getUserFromFirestore } from "../../utils/functions";
import { db } from "../../firebase";

const MyProfilePageComponent: React.FC<{ user: User | null }> = ({ user }): JSX.Element => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [firestoreUser, setFirestoreUser] = useState<IUser | undefined>();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    firstname: "",
    lastname: "",
    email: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

   useEffect(() => {
    async function loadUserData() {
      if (!user || user.uid !== userId) {
        navigate("/notfound");
        return;
      }

      const fetchedUser = await getUserFromFirestore(user.uid);
      if (!fetchedUser) {
        navigate("/notfound");
        return;
      }

      setFirestoreUser(fetchedUser);
      setFormData({
        firstname: fetchedUser.firstname || "",
        lastname: fetchedUser.lastname || "",
        email: user.email || "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
    }

    loadUserData();
  }, [user, userId, navigate]);

  const formatName = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const checkFormValidity = () => {
    let valid = true;
    const validationErrors = {
      firstname: "",
      lastname: "",
      email: "",
      currentPassword: "",
      password: "",
      confirmPassword: "",
    };

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!formData.email || !emailRegex.test(formData.email)) {
      validationErrors.email = "The email is not valid.";
      valid = false;
    }

    if (!formData.currentPassword || formData.currentPassword.length < 6) {
      validationErrors.currentPassword = "Current password is required.";
      valid = false;
    }

    if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters long.";
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    const nameRegex = /^[A-Za-z]+$/;
    const firstNameFormatted = formatName(formData.firstname);
    if (
      !firstNameFormatted ||
      firstNameFormatted.length < 2 ||
      firstNameFormatted.length > 20 ||
      !nameRegex.test(firstNameFormatted)
    ) {
      validationErrors.firstname = "First name must be between 2 and 20 letters.";
      valid = false;
    }

    const lastNameFormatted = formatName(formData.lastname);
    if (
      !lastNameFormatted ||
      lastNameFormatted.length < 2 ||
      lastNameFormatted.length > 20 ||
      !nameRegex.test(lastNameFormatted)
    ) {
      validationErrors.lastname = "Last name must be between 2 and 20 letters.";
      valid = false;
    }

    setErrors(validationErrors);
    return valid;
  };

  const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "firstname" || name === "lastname") {
      setFormData(prev => ({ ...prev, [name]: formatName(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const applyProfileChanges = async () => {
    if (!firestoreUser || !user) return;
    if (!checkFormValidity()) return;

    const cleanFirst = formatName(formData.firstname);
    const cleanLast = formatName(formData.lastname);

    try {
      const credential = EmailAuthProvider.credential(user.email!, formData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      const userDocRef = doc(db, "users", firestoreUser.id);
      await updateDoc(userDocRef, {
        firstname: cleanFirst,
        lastname: cleanLast,
        email: formData.email,
      });

      if (user.email !== formData.email) {
        await updateEmail(user, formData.email);
      }

      if (formData.password.length > 0) {
        await updatePassword(user, formData.password);
      }

      setFirestoreUser(prev => prev && ({
        ...prev,
        firstname: cleanFirst,
        lastname: cleanLast,
        email: formData.email,
      }));

      setFormData(prev => ({
        ...prev,
        password: "",
        confirmPassword: "",
        currentPassword: "",
      }));

      setSnackbar({ open: true, message: "Profile updated successfully!" });

       window.location.reload();
    } catch (error) {
      if (error instanceof FirebaseError) {
        setSnackbar({ open: true, message: extractFirebaseError(error.code) });
      } else {
        setSnackbar({ open: true, message: "An unexpected error occurred." });
      }
    }
  };

  const extractFirebaseError = (code: string) => {
    switch (code) {
      case "auth/wrong-password":
        return "Current password is incorrect.";
      case "auth/invalid-credential":
        return "Invalid credentials. Please try again.";
      case "auth/email-already-in-use":
        return "This email is already in use.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const removeProfileAndFlats = async () => {
    if (!user || !firestoreUser) return;

    try {
      const credential = EmailAuthProvider.credential(user.email!, deletePassword);
      await reauthenticateWithCredential(user, credential);

       const flatsQuery = query(collection(db, "flats"), where("userId", "==", user.uid));
      const flatsSnapshot = await getDocs(flatsQuery);

      const deletionPromises = flatsSnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletionPromises);

       await deleteDoc(doc(db, "users", firestoreUser.id));

       await deleteUser(user);

      await logout();

      setSnackbar({ open: true, message: "Profile and all flats deleted successfully." });
    } catch {
      setSnackbar({ open: true, message: "Password is incorrect or an error occurred." });
    }
  };

  return (
    <div className={styles.formcontainer}>
      <div className={styles.myprofileform}>
        <TextField
          className={styles.textfield}
          variant="outlined"
          label="First Name"
          name="firstname"
          value={formData.firstname}
          onChange={updateField}
          fullWidth
          error={!!errors.firstname}
          helperText={errors.firstname}
        />
        <TextField
          className={styles.textfield}
          variant="outlined"
          label="Last Name"
          name="lastname"
          value={formData.lastname}
          onChange={updateField}
          fullWidth
          error={!!errors.lastname}
          helperText={errors.lastname}
        />
        <TextField
          className={styles.textfield}
          variant="outlined"
          label="Email"
          name="email"
          value={formData.email}
          fullWidth
          disabled
        />
        <TextField
          className={styles.textfield}
          variant="outlined"
          label="Current Password"
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={updateField}
          fullWidth
          error={!!errors.currentPassword}
          helperText={errors.currentPassword}
        />
        <TextField
          className={styles.textfield}
          variant="outlined"
          label="New Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={updateField}
          fullWidth
          error={!!errors.password}
          helperText={errors.password}
        />
        <TextField
          className={styles.textfield}
          variant="outlined"
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={updateField}
          fullWidth
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
        />

        <Button
          className={styles.updateprofilebtn}
          variant="contained"
          onClick={applyProfileChanges}
        >
          Update Profile
        </Button>
        <Button
          className={styles.deleteprofilebtn}
          style={{ backgroundColor: "#e53935" }}
          variant="contained"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Delete Profile
        </Button>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          message={snackbar.message}
        />

        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <TextField
              label="Confirm Password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              fullWidth
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={removeProfileAndFlats} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default MyProfilePageComponent;
