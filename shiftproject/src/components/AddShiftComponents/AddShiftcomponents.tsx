import React, { JSX, useEffect, useState } from "react";
import { Button, MenuItem, TextField, Select, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import dayjs from "dayjs";
import styles from "./AddSShift.module.scss";

const AddShift: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [shiftData, setShiftData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    hourlyWage: "",
    comments: "",
    workplace: "",
    shiftName: "",
    workName: ""
  });
  const [touched, setTouched] = useState({
    startTime: false,
    endTime: false,
    date: false,
  });
  const [dateError, setDateError] = useState("");
  const today = dayjs().startOf("day");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = getAuth().currentUser;
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            const fullName = `${capitalize(data.firstname)} ${capitalize(data.lastname)}`;
            setUserName(fullName);
            setShiftData((prev) => ({
              ...prev,
              workName: fullName,
            }));
          }
        } catch (error) { 
        }
      }
    };
    fetchUserData();
  }, []);

  const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShiftData({
      ...shiftData,
      [name]: name === "comments" ? capitalize(value) : value,
    });
  };

  const handleWorkplaceChange = (e: SelectChangeEvent<string>) => {
    setShiftData({
      ...shiftData,
      workplace: e.target.value,
    });
  };

  const handleShiftNameChange = (e: SelectChangeEvent<string>) => {
    setShiftData({
      ...shiftData,
      shiftName: e.target.value,
    });
  };

  const addShift = async () => {
    try {
      const user = getAuth().currentUser;
      if (user) {
        const userId = user.uid;
        const finalComments = shiftData.comments.trim() || "No comment";
        const selectedDate = dayjs(shiftData.date, "DD-MM-YYYY");

        if (!selectedDate.isValid() || selectedDate.isBefore(today)) {
          setDateError("Date must be today or in the future");
          return;
        }

        await setDoc(doc(db, "shift", uuidv4()), {
          ...shiftData,
          comments: finalComments,
          userId,
        });

        navigate("/");
      }
    } catch (error) {
      console.error("Error adding shift:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles["add-shift-container"]}>
        <div className={styles["add-shift-form"]}>
          <DatePicker
            label="Shift Date"
            format="DD-MM-YYYY"
            disablePast
            minDate={today}
            value={shiftData.date ? dayjs(shiftData.date, "DD-MM-YYYY") : null}
            onChange={(date) => {
              const formatted = date ? date.format("DD-MM-YYYY") : "";
              setShiftData({
                ...shiftData,
                date: formatted,
              });
              setDateError(date && date.isBefore(today) ? "Date must be today or in the future" : "");
            }}
            slotProps={{
              textField: {
                onBlur: () => setTouched((prev) => ({ ...prev, date: true })),
                error: touched.date && !!dateError,
                helperText: touched.date && dateError,
              },
            }}
            className={styles["text-field"]}
          />

          <TimePicker
            label="Start Time"
            value={shiftData.startTime ? dayjs(shiftData.startTime, "HH:mm") : null}
            onChange={(time) =>
              setShiftData({
                ...shiftData,
                startTime: time ? time.format("HH:mm") : "",
              })
            }
            ampm={false}
            // disablePast
            className={styles["text-field"]}
            slotProps={{
              textField: {
                onBlur: () => setTouched((prev) => ({ ...prev, startTime: true })),
                error: touched.startTime && !shiftData.startTime,
                helperText: touched.startTime && !shiftData.startTime ? "Start time is required" : "",
              },
            }}
          />

          <TimePicker
            label="End Time"
            value={shiftData.endTime ? dayjs(shiftData.endTime, "HH:mm") : null}
            onChange={(time) =>
              setShiftData({
                ...shiftData,
                endTime: time ? time.format("HH:mm") : "",
              })
            }
            ampm={false}
            className={styles["text-field"]}
            slotProps={{
              textField: {
                onBlur: () => setTouched((prev) => ({ ...prev, endTime: true })),
                error: touched.endTime && !shiftData.endTime,
                helperText: touched.endTime && !shiftData.endTime ? "End time is required" : "",
              },
            }}
          />

          <TextField
            id="hourlyWage"
            name="hourlyWage"
            type="number"
            label="Hourly Wage"
            variant="filled"
            className={styles["text-field"]}
            onChange={handleInput}
          />

          <FormControl variant="filled" className={styles["text-field"]}>
            <InputLabel id="workplace-label">Workplace</InputLabel>
            <Select
              labelId="workplace-label"
              id="workplace"
              name="workplace"
              value={shiftData.workplace}
              onChange={handleWorkplaceChange}
            >
              <MenuItem value="Berceni">Berceni</MenuItem>
              <MenuItem value="Militari">Militari</MenuItem>
              <MenuItem value="Pipera">Pipera</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="filled" className={styles["text-field"]}>
            <InputLabel id="shift-name-label">Shift Name</InputLabel>
            <Select
              labelId="shift-name-label"
              id="shiftName"
              name="shiftName"
              value={shiftData.shiftName}
              onChange={handleShiftNameChange}
            >
              <MenuItem value="Morning">Morning</MenuItem>
              <MenuItem value="Afternoon">Afternoon</MenuItem>
              <MenuItem value="Night">Night</MenuItem>
            </Select>
          </FormControl>

          <TextField
            id="workName"
            name="workName"
            type="text"
            label="Work Name"
            variant="filled"
            className={styles["text-field"]}
            value={shiftData.workName}
            disabled
          />

          <TextField
            id="comments"
            name="comments"
            type="text"
            label="Comments"
            variant="filled"
            className={styles["text-field"]}
            onChange={handleInput}
            value={shiftData.comments}
          />

          <Button onClick={addShift} className={styles["add-shift-button"]}>
            Add Shift
          </Button>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default AddShift;
