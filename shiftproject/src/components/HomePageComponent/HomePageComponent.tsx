import React, { JSX, useEffect, useState } from "react";
import { Button, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";

import { IShift } from "../../interfaces/IHomepageInteface";
import TableComponent from "../TableComponents/TableComponents";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";


dayjs.extend(customParseFormat);

const HomePageComponent: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "shift"));
      const shiftsData: IShift[] = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as IShift),
        id: doc.id,
      }));
      setShifts(shiftsData);
    } catch (err) {
      setError("Failed to load shifts. Please try again later.");
      console.error("Error fetching shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const today = dayjs().startOf("day");

  const filterShifts = (shiftType: "past" | "future") => {
    return shifts.filter((shift) => {
      const shiftDate = dayjs(shift.date, "DD-MM-YYYY");
      if (shiftType === "past") {
        return shiftDate.isBefore(today) || shiftDate.isSame(today);
      }
      return shiftDate.isAfter(today);
    });
  };

  if (loading || isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (shifts.length === 0) {
    return (
      <div>
        <Typography variant="body1">No shifts available.</Typography>
        <Button onClick={() => navigate("/addshift")} variant="contained">
          Add Shift
        </Button>
      </div>
    );
  }

  const pastShifts = filterShifts("past");
  const futureShifts = filterShifts("future");

  return (
    <div>
      <Typography variant="h6"  sx={{
        display: 'flex',
        justifyContent: 'center',   
       
      }}> 
        Past Shifts
      </Typography>
      {pastShifts.length > 0 ? (
        <TableComponent
          shifts={pastShifts}
          isAdmin={isAdmin}
          onShiftUpdated={fetchShifts}
        />
      ) : (
        <Typography>No past shifts found.</Typography>
      )}

      <br />

      <Typography variant="h6" gutterBottom  sx={{
        display: 'flex',
        justifyContent: 'center',   
       
      }}> 
        Future Shifts
      </Typography>
      {futureShifts.length > 0 ? (
        <TableComponent
          shifts={futureShifts}
          isAdmin={isAdmin}
          onShiftUpdated={fetchShifts}
        />
      ) : (
        <Typography>No future shifts available.</Typography>
      )}

      <br />
      <Button variant="contained" onClick={() => navigate("/addshift")}>
        Add Shift
      </Button>
    </div>
  );
};

export default HomePageComponent;
