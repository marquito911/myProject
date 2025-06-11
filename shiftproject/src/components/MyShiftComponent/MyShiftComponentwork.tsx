import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { getAuth } from "firebase/auth";
import { IShift } from "../../interfaces/IHomepageInteface";
import {
  Typography,
  Box,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

const MyShifts: React.FC = () => {
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editShift, setEditShift] = useState<IShift | null>(null);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (user) {
      setUserId(user.uid);
    }
  }, []);

  const fetchShifts = async () => {
    if (userId) {
      try {
        const querySnapshot = await getDocs(collection(db, "shift"));
        const fetchedShifts: IShift[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === userId) {
            fetchedShifts.push({ ...data, id: doc.id } as IShift);
          }
        });
        setShifts(fetchedShifts);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [userId]);

  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month}-${day}`);
  };

  const today = new Date();
  const pastShifts = shifts.filter((shift) => {
    const shiftDate = parseDate(shift.date);
    return shiftDate < today;
  });

  const futureShifts = shifts.filter((shift) => parseDate(shift.date) >= today);

  const columns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 130 },
    { field: "startTime", headerName: "Start Time", width: 110 },
    { field: "endTime", headerName: "End Time", width: 110 },
    { field: "hourlyWage", headerName: "Hourly Wage", width: 110 },
    { field: "shiftName", headerName: "Shift Name", width: 150 },
    { field: "workplace", headerName: "Workplace", width: 180 },
    { field: "comments", headerName: "Comments", width: 150 },
    {
      field: "edit",
      headerName: "Edit",
      width: 100,
      renderCell: (params) => {
        const shiftDate = parseDate(params.row.date);
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleEditClick(params.row)}
            disabled={shiftDate < today}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  const toGridRows = (data: IShift[]) =>
    data.map((shift) => ({
      ...shift,
      hourlyWage: Number(shift.hourlyWage),
    }));

  const paginationModel = { page: 0, pageSize: 5 };

  const handleEditClick = async (shift: IShift) => {
    try {
      const userDoc = await getDoc(doc(db, "users", shift.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const fullName = `${userData.firstname} ${userData.lastname}`;
        setEditShift({ ...shift, workName: fullName });
        setEditModalOpen(true);
      }
    } catch (error) {}
  };

  const handleEditSubmit = async () => {
    if (editShift && editShift.id) {
      try {
        const updatedShift: IShift = {
          ...editShift,
          hourlyWage: Number(editShift.hourlyWage),
        };
        await setDoc(doc(db, "shift", updatedShift.id), updatedShift);
        setEditModalOpen(false);
        setEditShift(null);
        fetchShifts();
      } catch (error) {}
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editShift) {
      setEditShift({ ...editShift, [e.target.name]: e.target.value });
    }
  };

  const handleWorkplaceChange = (e: SelectChangeEvent<string>) => {
    if (editShift) {
      setEditShift({ ...editShift, workplace: e.target.value });
    }
  };

  const handleShiftNameChange = (e: SelectChangeEvent<string>) => {
    if (editShift) {
      setEditShift({ ...editShift, shiftName: e.target.value });
    }
  };

  const handleDateChange = (value: Dayjs | null) => {
    if (editShift && value) {
      setEditShift({ ...editShift, date: value.format("DD-MM-YYYY") });
    }
  };

  const handleStartTimeChange = (value: Dayjs | null) => {
    if (editShift && value) {
      setEditShift({ ...editShift, startTime: value.format("HH:mm") });
    }
  };

  const handleEndTimeChange = (value: Dayjs | null) => {
    if (editShift && value) {
      setEditShift({ ...editShift, endTime: value.format("HH:mm") });
    }
  };

  const calculateMonthlyIncome = (shifts: IShift[]): number => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return shifts.reduce((total, shift) => {
      const [day, month, year] = shift.date.split("-");
      const shiftDate = new Date(`${year}-${month}-${day}`);

      if (shiftDate.getMonth() === currentMonth && shiftDate.getFullYear() === currentYear) {
        const [startH, startM] = shift.startTime.split(":").map(Number);
        const [endH, endM] = shift.endTime.split(":").map(Number);

        let start = new Date(0, 0, 0, startH, startM);
        let end = new Date(0, 0, 0, endH, endM);

        if (end <= start) {
          end.setDate(end.getDate() + 1);
        }

        const hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const earned = hoursWorked * Number(shift.hourlyWage);
        return total + earned;
      }

      return total;
    }, 0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box >
        <Typography variant="h6" gutterBottom   sx={{
        display: 'flex',
        justifyContent: 'center',   
       
      }}> 
          Future My Shifts
        </Typography>
        <Paper sx={{ height: 350, width: "100%", mb: 4 }}>
          <DataGrid 
            rows={toGridRows(futureShifts)}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0,   display: 'flex',
              justifyContent: 'center',  }}
            rowHeight={40}
          />
        </Paper>

        <Typography variant="h6" gutterBottom sx={{
        display: 'flex',
        justifyContent: 'center',   
       
      }} >
          Past My Shifts
        </Typography>
        <Paper sx={{ height: 250, width: "100%", 
        display: 'flex',
        justifyContent: 'center',   }}>
          <DataGrid
            rows={toGridRows(pastShifts)}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0 }}
            rowHeight={40}
          />
        </Paper>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Monthly Income Wage: {calculateMonthlyIncome(shifts).toFixed(2)} €
        </Typography>

        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <Box sx={{ padding: 3, backgroundColor: "white", borderRadius: 2 }}>
            <Typography variant="h6">Edit Shift</Typography>

            <DatePicker
              label="Date"
              value={dayjs(editShift?.date, "DD-MM-YYYY")}
              onChange={handleDateChange}
              format="DD-MM-YYYY"
              minDate={dayjs()}
              slotProps={{ textField: { variant: "filled", fullWidth: true, margin: "normal" } }}
            />

            <TimePicker
              label="Start Time"
              value={dayjs(editShift?.startTime, "HH:mm")}
              onChange={handleStartTimeChange}
              format="HH:mm"
              slotProps={{ textField: { variant: "filled", fullWidth: true, margin: "normal" } }}
            />

            <TimePicker
              label="End Time"
              value={dayjs(editShift?.endTime, "HH:mm")}
              onChange={handleEndTimeChange}
              format="HH:mm"
              slotProps={{ textField: { variant: "filled", fullWidth: true, margin: "normal" } }}
            />

            <TextField
              id="hourlyWage"
              name="hourlyWage"
              type="number"
              label="Hourly Wage"
              variant="filled"
              value={editShift?.hourlyWage || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <FormControl variant="filled" fullWidth margin="normal">
              <InputLabel id="workplace-label">Workplace</InputLabel>
              <Select
                labelId="workplace-label"
                id="workplace"
                name="workplace"
                value={editShift?.workplace || ""}
                onChange={handleWorkplaceChange}
              >
                <MenuItem value="Berceni">Berceni</MenuItem>
                <MenuItem value="Militari">Militari</MenuItem>
                <MenuItem value="Pipera">Pipera</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="filled" fullWidth margin="normal">
              <InputLabel id="shift-name-label">Shift Name</InputLabel>
              <Select
                labelId="shift-name-label"
                id="shiftName"
                name="shiftName"
                value={editShift?.shiftName || ""}
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
              value={editShift?.workName}
              disabled
              fullWidth
              margin="normal"
            />

            <Box sx={{ marginTop: 2 }}>
              <Button variant="contained" color="primary" onClick={handleEditSubmit}>
                Save Changes
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setEditModalOpen(false)}
                sx={{ marginLeft: 2 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default MyShifts;
