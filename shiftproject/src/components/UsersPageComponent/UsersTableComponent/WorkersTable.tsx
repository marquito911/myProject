import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import dayjs from "dayjs";
import { Box, CircularProgress, Typography } from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { IShift } from "../../../interfaces/IHomepageInteface";
import { useAuth } from "../../../contexts/AuthContext";

const WorkersTable: React.FC = () => {
  const { isLoading } = useAuth();
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();

  const fetchShifts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "shift"));
      const shiftsData: IShift[] = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as IShift),
        id: doc.id,
      }));
      setShifts(shiftsData);
    } catch (err) {
      setError("Failed to load shifts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const filterShifts = () => {
    return shifts.filter((shift) => {
      const shiftDate = dayjs(shift.date, "DD-MM-YYYY");
      return shiftDate.month() === currentMonth && shiftDate.year() === currentYear;
    });
  };

  const calculateWage = (shift: IShift) => {
    const [startH, startM] = shift.startTime.split(":").map(Number);
    const [endH, endM] = shift.endTime.split(":").map(Number);

    let start = new Date(0, 0, 0, startH, startM);
    let end = new Date(0, 0, 0, endH, endM);

    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    const hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hoursWorked * shift.hourlyWage;
  };

  const groupShiftsByUser = () => {
    const userWageMap: Record<string, { workName: string; totalWage: number }> = {};

    filterShifts().forEach((shift) => {
      const totalWage = calculateWage(shift);
      if (userWageMap[shift.userId]) {
        userWageMap[shift.userId].totalWage += totalWage;
      } else {
        userWageMap[shift.userId] = { workName: shift.workName, totalWage };
      }
    });

    return Object.keys(userWageMap).map((userId) => ({
      id: userId,
      workName: userWageMap[userId].workName,
      totalWage: userWageMap[userId].totalWage,
    }));
  };

  const rows = groupShiftsByUser();

  if (loading || isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const columns: GridColDef[] = [
    { field: "workName", headerName: "Work Name", width: 250 },
    { field: "totalWage", headerName: "Total Wage €", width: 250 },
  ];

  return (
    <Box   sx={{
        display: 'flex',
        justifyContent: 'center',   
       
      }}>
    <Paper sx={{ height: 550, width: "30%", textAlign: "center", alignContent: "center"}}>
      <Typography variant="h6" gutterBottom>
        Shifts for {dayjs().format("MMMM YYYY")}
      </Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
      />

      <Typography variant="h6" sx={{ mt: 2 }}>
        Total Monthly Income: {rows.reduce((acc, row) => acc + row.totalWage, 0).toFixed(2)} €
      </Typography>
    </Paper>
    </Box>
  );
};

export default WorkersTable;
