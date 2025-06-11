import React, { JSX, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { IShift } from "../../interfaces/IHomepageInteface";
import {
  Button,
  Modal,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

interface ITableComponentProps {
  shifts: IShift[];
  isAdmin: boolean;
  onShiftUpdated: () => void;
}

const TableComponent: React.FC<ITableComponentProps> = ({
  shifts,
  isAdmin,
  onShiftUpdated,
}): JSX.Element => {
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editShift, setEditShift] = useState<IShift | null>(null);

  const columns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 130 },
    { field: "startTime", headerName: "Start Time", width: 110 },
    { field: "endTime", headerName: "End Time", width: 110 },
    { field: "hourlyWage", headerName: "Hourly Wage", width: 110 },
    { field: "shiftName", headerName: "Shift Name", width: 150 },
    { field: "workplace", headerName: "Workplace", width: 180 },
    { field: "workName", headerName: "Work Name", width: 150 },
    { field: "comments", headerName: "Comments", width: 150 },
    {
      field: "edit",
      headerName: "Edit",
      width: 100,
      renderCell: (params) => {
        if (isAdmin) {
          return (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleEditClick(params.row)}
            >
              Edit
            </Button>
          );
        }
        return null;
      },
    },
  ];

  const rows = shifts.map((shift) => ({
    id: shift.id,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    hourlyWage: shift.hourlyWage,
    workplace: shift.workplace,
    shiftName: shift.shiftName,
    workName: shift.workName,
    comments: shift.comments,
  }));

  const handleEditClick = (shift: IShift) => {
    setEditShift(shift);
    setEditModalOpen(true);
  };

  const paginationModel = { page: 0, pageSize: 5 };

  const handleEditSubmit = async () => {
    if (editShift && editShift.id) {
      try {
        const shiftRef = doc(db, "shift", editShift.id);
        await updateDoc(shiftRef, {
          date: editShift.date,
          startTime: editShift.startTime,
          endTime: editShift.endTime,
          hourlyWage: editShift.hourlyWage,
          workplace: editShift.workplace,
          shiftName: editShift.shiftName,
          workName: editShift.workName,
          comments: editShift.comments,
        });
        onShiftUpdated();
      } catch (error) {}
      setEditModalOpen(false);
      setEditShift(null);
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
  };

  return (
    <>
      <Paper sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
        />
      </Paper>

      <Modal open={editModalOpen} onClose={handleCloseModal}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400,
      bgcolor: "white",
      borderRadius: 2,
      boxShadow: 24,
      p: 4,
    }}
  >
    <Typography variant="h6">Edit Shift</Typography>

    {editShift && (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Shift Date"
          format="DD-MM-YYYY"
          value={dayjs(editShift.date, "DD-MM-YYYY")}
          onChange={(newValue) => {
            if (editShift && newValue) {
              setEditShift({
                ...editShift,
                date: newValue.format("DD-MM-YYYY"),
              });
            }
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              variant: "filled",
            },
          }}
        />

        <TimePicker
          label="Start Time"
          value={dayjs(editShift.startTime, "HH:mm")}
          onChange={(newValue) => {
            if (editShift && newValue) {
              setEditShift({
                ...editShift,
                startTime: newValue.format("HH:mm"),
              });
            }
          }}
          ampm={false}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              variant: "filled",
            },
          }}
        />

        <TimePicker
          label="End Time"
          value={dayjs(editShift.endTime, "HH:mm")}
          onChange={(newValue) => {
            if (editShift && newValue) {
              setEditShift({
                ...editShift,
                endTime: newValue.format("HH:mm"),
              });
            }
          }}
          ampm={false}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              variant: "filled",
            },
          }}
        />
      </LocalizationProvider>
    )}

    <TextField
      label="Hourly Wage"
      type="number"
      fullWidth
      margin="normal"
      variant="filled"
      value={editShift?.hourlyWage ?? ""}
      onChange={(e) => {
        const value = Number(e.target.value);
        if (editShift) {
          setEditShift({
            ...editShift,
            hourlyWage: isNaN(value) ? 0 : value,
          });
        }
      }}
    />

    <TextField
      label="Workplace"
      fullWidth
      margin="normal"
      variant="filled"
      value={editShift?.workplace || ""}
      onChange={(e) => {
        if (editShift) {
          setEditShift({ ...editShift, workplace: e.target.value });
        }
      }}
    />

    <TextField
      label="Shift Name"
      fullWidth
      margin="normal"
      variant="filled"
      value={editShift?.shiftName || ""}
      onChange={(e) => {
        if (editShift) {
          setEditShift({ ...editShift, shiftName: e.target.value });
        }
      }}
    />

    <TextField
      label="Work Name"
      fullWidth
      margin="normal"
      variant="filled"
      value={editShift?.workName || ""}
      onChange={(e) => {
        if (editShift) {
          setEditShift({ ...editShift, workName: e.target.value });
        }
      }}
    />

    <TextField
      label="Comments"
      fullWidth
      margin="normal"
      variant="filled"
      value={editShift?.comments || ""}
      onChange={(e) => {
        if (editShift) {
          setEditShift({ ...editShift, comments: e.target.value });
        }
      }}
    />

    <Box sx={{ marginTop: 2 }}>
      <Button variant="contained" color="primary" onClick={handleEditSubmit}>
        Save Changes
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleCloseModal}
        sx={{ marginLeft: 2 }}
      >
        Cancel
      </Button>
    </Box>
  </Box>
</Modal>
    </>
  );
};

export default TableComponent;
