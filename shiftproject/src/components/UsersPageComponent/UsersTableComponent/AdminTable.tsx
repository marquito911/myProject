import React, { JSX, useEffect, useState } from "react";
import { Button, Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from "@mui/material";
import { IShift } from "../../../interfaces/IHomepageInteface";
import { db } from "../../../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

interface ShiftApprovalProps {
  shiftRequests: IShift[];
}

const ShiftApproval: React.FC<ShiftApprovalProps> = ({ shiftRequests }): JSX.Element => {
  const [pendingShifts, setPendingShifts] = useState<IShift[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false);
  const [currentShift, setCurrentShift] = useState<IShift | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShiftRequests = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "shiftRequests"));
        const shifts: IShift[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          shifts.push({ ...data, id: doc.id } as IShift);
        });

        setPendingShifts(shifts);
      } catch (err) {
        setError("Error loading shift requests.");
        console.error("Error fetching shift requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftRequests();
  }, []);

  const handleOpenModal = (shift: IShift, action: 'approve' | 'reject') => {
    setCurrentShift(shift);
    setActionType(action);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentShift(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!currentShift || !actionType) return;

    try {
      const shiftRef = doc(db, "shift", currentShift.id);
      if (actionType === 'approve') {
        await updateDoc(shiftRef, { ...currentShift, status: "approved" });
      } else {
        await updateDoc(shiftRef, { status: "rejected" });
      }

      const shiftRequestRef = doc(db, "shiftRequests", currentShift.id);
      await updateDoc(shiftRequestRef, { status: actionType });

      setPendingShifts(pendingShifts.filter((shift) => shift.id !== currentShift.id));
      handleCloseModal();
    } catch (error) {
      console.error("Error updating shift status:", error);
      setError("Error processing the request.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pending Shift Requests
      </Typography>
      {error && (
        <Typography color="error" variant="body1" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {pendingShifts.length > 0 ? (
        pendingShifts.map((shift) => (
          <Box key={shift.id} sx={{ mb: 2, border: "1px solid #ddd", p: 2 }}>
            <Typography variant="body1">
              {shift.date} - {shift.shiftName} at {shift.workplace}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal(shift, 'approve')}
              sx={{ mr: 2 }}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleOpenModal(shift, 'reject')}
            >
              Reject
            </Button>
          </Box>
        ))
      ) : (
        <Typography variant="body1">No shift requests pending approval.</Typography>
      )}

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>{actionType === 'approve' ? 'Approve Shift?' : 'Reject Shift?'}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to {actionType} this shift request?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            No
          </Button>
          <Button onClick={handleConfirmAction} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftApproval;
