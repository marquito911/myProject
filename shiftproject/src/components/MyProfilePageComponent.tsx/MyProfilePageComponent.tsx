import { User, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { Button, TextField, Snackbar, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { deleteDoc, doc, updateDoc, query, where, getDocs, collection } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useNavigate, useParams } from "react-router-dom";

import { db } from "../../firebase";
import { IUser } from "../../interfaces/AuthContext";
import { getUserFromFirestore } from "../../utils/functions";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./MyProfilePageComponent.module.scss";

const MyProfilePageComponent: React.FC<{ user: User | null }> = ({ user }) => {
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

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
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
    };

    fetchUser();
  }, [user, userId, navigate]);

  const capitalizeName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { firstname: "", lastname: "", email: "", currentPassword: "", password: "", confirmPassword: "" };
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!formData.email || !emailPattern.test(formData.email)) {
      newErrors.email = "The email is not valid.";
      isValid = false;
    }

    if (!formData.currentPassword || formData.currentPassword.length < 6) {
      newErrors.currentPassword = "Current password is required.";
      isValid = false;
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    const namePattern = /^[A-Za-z]+$/;
    const cleanFirst = capitalizeName(formData.firstname);
    if (!cleanFirst || cleanFirst.length < 2 || cleanFirst.length > 20 || !namePattern.test(cleanFirst)) {
      newErrors.firstname = "First name must be between 2 and 20 letters.";
      isValid = false;
    }

    const cleanLast = capitalizeName(formData.lastname);
    if (!cleanLast || cleanLast.length < 2 || cleanLast.length > 20 || !namePattern.test(cleanLast)) {
      newErrors.lastname = "Last name must be between 2 and 20 letters.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateData = async () => {
    if (!firestoreUser || !user) return;

    if (!validateForm()) return;

    const cleanFirst = capitalizeName(formData.firstname);
    const cleanLast = capitalizeName(formData.lastname);

    try {
      const credential = EmailAuthProvider.credential(user.email!, formData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      const docRef = doc(db, "users", firestoreUser.id);
      await updateDoc(docRef, {
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

      setFirestoreUser({
        ...firestoreUser,
        firstname: cleanFirst,
        lastname: cleanLast,
        email: formData.email,
      });

      setFormData({ ...formData, password: "", confirmPassword: "", currentPassword: "" });
      setSnackbarMessage("Profile updated successfully!");
      setOpenSnackbar(true);
      window.location.reload();
    } catch (error) {
      if (error instanceof FirebaseError) {
        setSnackbarMessage(getErrorMessage(error.code));
        setOpenSnackbar(true);
      }
    }
  };

  const getErrorMessage = (code: string) => {
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

  const handleDeleteData = async () => {
    if (!user || !firestoreUser) return;

    try {
      const credential = EmailAuthProvider.credential(user.email!, confirmPassword);
      await reauthenticateWithCredential(user, credential);

      const shiftsQuery = query(collection(db, "shifts"), where("userId", "==", user.uid));
      const shiftsSnapshot = await getDocs(shiftsQuery);
      shiftsSnapshot.forEach(async (doc) => await deleteDoc(doc.ref));

      await deleteDoc(doc(db, "users", firestoreUser.id));
      await deleteUser(user);
      await logout();
      setSnackbarMessage("Profile deleted successfully.");
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage("Password is incorrect or an error occurred.");
      setOpenSnackbar(true);
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
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
          fullWidth
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
        />

        <Button className={styles.updateprofilebtn} variant="contained" onClick={updateData}>
          Update Profile
        </Button>
        <Button
          className={styles.deleteprofilebtn}
          style={{ backgroundColor: "#e53935" }}
          variant="contained"
          onClick={() => setDeleteModalOpen(true)}
        >
          Delete Profile
        </Button>

        <Snackbar anchorOrigin={{ vertical: "top", horizontal: "right" }} open={openSnackbar} onClose={() => setOpenSnackbar(false)} message={snackbarMessage} />

        <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <TextField
              variant="outlined"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteModalOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteData} color="secondary" variant="contained">
              Confirm Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default MyProfilePageComponent;
