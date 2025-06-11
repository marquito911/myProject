import React, { useState, type JSX } from "react";
import styles from "./AddFlatsComponent.module.scss";
import { useNavigate } from "react-router-dom";
import { firestore, auth } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { cityList, validateFlat } from "../../utils/validateFlat";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { IFlat } from "../../interfaces/IFlats";
import { FirebaseError } from "firebase/app";
import { FormControlLabel, Switch } from "@mui/material";

const ensureImageExtension = (url: string): string => {
  const extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  return extensions.some((ext) => url.toLowerCase().endsWith(ext))
    ? url
    : `${url}.jpg`;
};

const capitalizeEachWord = (text: string): string =>
  text
    .toLowerCase()
    .split(" ")
    .map((word) =>
      word && word[0] ? word[0].toUpperCase() + word.slice(1) : word
    )
    .join(" ");

const validateAvailableDate = (date: Date | null): string | null => {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0); 
 
  const userDate = new Date(date);
  userDate.setHours(0, 0, 0, 0);  

  return userDate < today ? "Date available cannot be in the past" : null;
};

const AddFlatsComponent: React.FC = (): JSX.Element => {
  const [flat, setFlat] = useState<IFlat>({
    id: "",
    ownerId: "",
    hasAC: false,
    city: "",
    streetName: "",
    streetNumber: 0,
    areaSize: 0,
    rentPrice: 0,
    dateAvailable: null,
    yearBuilt: 0,
    description: null,
    userId: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
const DEFAULT_IMAGE_URL = "https://thumbs.dreamstime.com/b/no-image-available-icon-flat-vector-no-image-available-icon-flat-vector-illustration-132482953.jpg";


  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (
      (name === "city" && value.length > 25) ||
      (name === "streetName" && value.length > 45)
    )
      return;

    const cleanedValue =
      name === "city" || name === "streetName"
        ? capitalizeEachWord(value)
        : value;

    if (name === "imageUrl") {
      setFlat((prev) => ({
        ...prev,
        imageUrl: ensureImageExtension(cleanedValue),
      }));
    } else if (
      ["streetNumber", "areaSize", "rentPrice", "yearBuilt"].includes(name)
    ) {
      const numeric = Number(cleanedValue);
      if (!isNaN(numeric)) {
        setFlat((prev) => ({ ...prev, [name]: numeric }));
      }
    } else {
      setFlat((prev) => ({ ...prev, [name]: cleanedValue }));
    }
  };

  const toggleAC = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlat((prev) => ({ ...prev, hasAC: e.target.checked }));
  };

  const setDate = (date: Date | null) => {
    setFlat((prev) => ({ ...prev, dateAvailable: date }));
  };

  const showError = (field: string) =>
    errors[field] ? (
      <p className={styles.errorText}>{errors[field]}</p>
    ) : null;

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const issues = validateFlat(flat);
    const dateMsg = validateAvailableDate(flat.dateAvailable);
    if (dateMsg) issues.dateAvailable = dateMsg; 

    if (Object.keys(issues).length > 0) {
      setErrors(issues);
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      setErrors({ general: "You must be logged in to add a flat." });
      return;
    }

    try {
      await addDoc(collection(firestore, "flats"), {
        ...flat,
        userId,
        imageUrl: flat.imageUrl.trim() || DEFAULT_IMAGE_URL, 
      });
      navigate("/");
    } catch (err) {
      if (err instanceof FirebaseError) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: "An unexpected error occurred." });
      }
    }
  };


  
  return (
    <div className={styles.addShiftContainer}>
      <form className={styles.addShiftForm} onSubmit={submitForm} noValidate>
        <h2>Add a Flat</h2>

        <label htmlFor="city" className={styles.label}>City</label>
        <select
          id="city"
          name="city"
          className={styles.inputField}
          value={flat.city}
          onChange={onChange}
          aria-invalid={!!errors.city}
          aria-describedby="city-error"
        >
          <option value="">Select a city</option>
          {cityList.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        {showError("city")}

        <label htmlFor="streetName" className={styles.label}>Street Name</label>
        <input
          id="streetName"
          name="streetName"
          type="text"
          className={styles.inputField}
          value={flat.streetName}
          onChange={onChange}
          aria-invalid={!!errors.streetName}
          aria-describedby="streetName-error"
        />
        {showError("streetName")}

        <label htmlFor="streetNumber" className={styles.label}>Street Number</label>
        <input
          id="streetNumber"
          name="streetNumber"
          type="number"
          className={styles.inputField}
          value={flat.streetNumber}
          onChange={onChange}
          aria-invalid={!!errors.streetNumber}
          aria-describedby="streetNumber-error"
        />
        {showError("streetNumber")}

        <label htmlFor="areaSize" className={styles.label}>Area Size (m²)</label>
        <input
          id="areaSize"
          name="areaSize"
          type="number"
          className={styles.inputField}
          value={flat.areaSize}
          onChange={onChange}
          aria-invalid={!!errors.areaSize}
          aria-describedby="areaSize-error"
        />
        {showError("areaSize")}

        <label htmlFor="rentPrice" className={styles.label}>Rent Price (€)</label>
        <input
          id="rentPrice"
          name="rentPrice"
          type="number"
          className={styles.inputField}
          value={flat.rentPrice}
          onChange={onChange}
          aria-invalid={!!errors.rentPrice}
          aria-describedby="rentPrice-error"
        />
        {showError("rentPrice")}

        <label htmlFor="dateAvailable" className={styles.label}>Date Available</label>
        <DatePicker
          id="dateAvailable"
          selected={flat.dateAvailable}
          onChange={setDate}
          dateFormat="dd-MM-yyyy"
          className={styles.inputField}
          aria-invalid={!!errors.dateAvailable}
          aria-describedby="dateAvailable-error"
        />
        {showError("dateAvailable")}

        <label htmlFor="yearBuilt" className={styles.label}>Year Built</label>
        <input
          id="yearBuilt"
          name="yearBuilt"
          type="number"
          className={styles.inputField}
          value={flat.yearBuilt}
          onChange={onChange}
          aria-invalid={!!errors.yearBuilt}
          aria-describedby="yearBuilt-error"
        />
        {showError("yearBuilt")}

        <FormControlLabel
          control={
            <Switch
              checked={flat.hasAC}
              onChange={toggleAC}
              name="hasAC"
              color="primary"
              inputProps={{ "aria-label": "Has AC switch" }}
            />
          }
          label="Has AC"
        />

        <label htmlFor="description" className={styles.label}>Description</label>
        <textarea
          id="description"
          name="description"
          className={styles.inputField}
          value={flat.description || ""}
          onChange={onChange}
          aria-invalid={!!errors.description}
          aria-describedby="description-error"
        />
        {showError("description")}

        <label htmlFor="imageUrl" className={styles.label}>Image URL</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="text"
          className={styles.inputField}
          value={flat.imageUrl}
          onChange={onChange}
          placeholder="Enter image URL"
          aria-invalid={!!errors.imageUrl}
          aria-describedby="imageUrl-error"
        />
        {showError("imageUrl")}

        {flat.imageUrl && (
          <div className={styles.previewImageWrapper}>
            <img
              src={flat.imageUrl}
              alt="Preview"
              className={styles.previewImage}
            />
          </div>
        )}

        {errors.general && <p className={styles.errorText}>{errors.general}</p>}

        <button type="submit" className={styles.addShiftButton}>
          Add Flat
        </button>
      </form>
    </div>
  );
};

export default AddFlatsComponent;
