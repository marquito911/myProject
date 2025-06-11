import React, { useEffect, useState, type JSX } from "react";
import styles from "./MyFlatsComponent.module.scss";
import {
  Button,
  Typography,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  TextField,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { fetchFlats, formatDate, updateFlatDetails, deleteFlat } from "../../utils/utils";
import { getAuth } from "firebase/auth";
import type { IFlat } from "../../interfaces/IFlats";
import DatePicker from "react-datepicker";
import { validateFlat } from "../../utils/validateFlat";
import { sortFlats } from "../../utils/utils"; 


const MyFlatsPageComponent: React.FC = (): JSX.Element => {
  const [flats, setFlats] = useState<IFlat[]>([]);
  const [selectedFlat, setSelectedFlat] = useState<IFlat | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [flatToDelete, setFlatToDelete] = useState<IFlat | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [loading, setLoading] = useState<boolean>(true);
  const [editData, setEditData] = useState<IFlat | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [errors, setErrors] = useState<any>({});
 const [sortBy, setSortBy] = useState<string>("city");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");


  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const loadFlats = async () => {
      setLoading(true);
      try {
        const data = await fetchFlats();
        const userFlats = data.filter((flat) => flat.userId === userId);
        setFlats(userFlats);
      } catch {
        setSnackbarSeverity("error");
        setSnackbarMessage("Failed to load flats from Firestore.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    loadFlats();
  }, [userId]);

  const openDetails = (flat: IFlat) => {
    setSelectedFlat(flat);
    setOpenModal(true);
  };

  const closeDetails = () => {
    setOpenModal(false);
    setSelectedFlat(null);
  };

  const openEdit = (flat: IFlat) => {
    setEditData({ ...flat });
    setOpenEditModal(true);
  };

  const closeEdit = () => {
    setOpenEditModal(false);
    setEditData(null);
    setErrors({});
  };

  const saveEdit = async () => {
    if (!editData) return;

    const validationErrors = validateFlat(editData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      await updateFlatDetails(editData);
      setFlats(flats.map((flat) => (flat.id === editData.id ? editData : flat)));
      setSnackbarSeverity("success");
      setSnackbarMessage("Flat details updated successfully.");
      setSnackbarOpen(true);
      closeEdit();
    } catch {
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to update flat details.");
      setSnackbarOpen(true);
    }
  };

  const openDeleteConfirm = (flat: IFlat) => {
    setFlatToDelete(flat);
    setOpenDeleteModal(true);
  };

  const closeDeleteConfirm = () => {
    setOpenDeleteModal(false);
    setFlatToDelete(null);
  };

  const confirmDelete = async () => {
    if (!flatToDelete) return;

    try {
      await deleteFlat(flatToDelete.id);
      setFlats(flats.filter((flat) => flat.id !== flatToDelete.id));
      setSnackbarSeverity("success");
      setSnackbarMessage("Flat deleted successfully.");
      setSnackbarOpen(true);
      closeDeleteConfirm();
    } catch {
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to delete flat.");
      setSnackbarOpen(true);
    }
  };

  const changePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const changeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

   

  return (
    <div className={styles.homePageContainer}>
      <h1 className={styles.title}>My Flats</h1>
    <div className={styles.sortControlsContainer}>
        <FormControl variant="filled" className={styles.formControl}>
          <InputLabel id="sort-by-label">Sort by</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "city" | "price" | "area")}
            label="Sort by"
            variant="filled"
          >
            <MenuItem value="city">City</MenuItem>
            <MenuItem value="price">Price</MenuItem>
            <MenuItem value="area">Area</MenuItem>
          </Select>
        </FormControl>

  <FormControl variant="filled" className={styles.formControl}>
          <InputLabel id="sort-order-label">Order</InputLabel>
          <Select
            labelId="sort-order-label"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            label="Order"
            variant="filled"
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <CircularProgress />
        </div>
      ) : flats.length === 0 ? (
        <div className={styles.noFlatsMessage}>
          <Typography variant="h6">
            You don't have any flats at the moment. <a href="/addflat">Post one! </a>
          </Typography>
        </div>
      ) : (
      <div className={styles.cardContainer}>
          {sortFlats(flats, sortBy, sortOrder)
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((flat) => (
              <div key={flat.id} className={styles.card}>
              <div className={styles.cardImage}>
                {flat.imageUrl ? <img src={flat.imageUrl} alt="Flat" /> : <p>No image available</p>}
              </div>
              <div className={styles.cardDetails}>
                <h3>{flat.city}</h3>
                <p>
                  {flat.streetName} {flat.streetNumber}
                </p>
                <p>
                  Price: €{flat.rentPrice}
                </p>
                <p>
                  Size: {flat.areaSize} m²
                </p>
                <p>
                  Year Built: {flat.yearBuilt}
                </p>
                <p>
                  Available from: {formatDate(flat.dateAvailable)}
                </p>
              </div>
              <div className={styles.cardFooter}>
                <Button onClick={() => openDetails(flat)} variant="contained" color="primary">
                  View Details
                </Button>
                <Button onClick={() => openEdit(flat)} variant="outlined" color="secondary">
                  Edit
                </Button>
                <Button onClick={() => openDeleteConfirm(flat)} variant="outlined" color="error">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TablePagination
        rowsPerPageOptions={[7, 14, 21]}
        component="div"
        count={flats.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={changePage}
        onRowsPerPageChange={changeRowsPerPage}
      />

      <Dialog open={openModal} onClose={closeDetails} maxWidth="md" fullWidth>
        <DialogTitle>{selectedFlat ? "Flat Details" : "No Flat Selected"}</DialogTitle>
        <DialogContent>
          {selectedFlat && (
            <div>
              <Typography variant="body1">
                City: {selectedFlat.city}
              </Typography>
              <Typography variant="body1">
                Street Name: {selectedFlat.streetName}
              </Typography>
              <Typography variant="body1">
                Street Number: {selectedFlat.streetNumber}
              </Typography>
              <Typography variant="body1">
                Area Size (m²): {selectedFlat.areaSize}
              </Typography>
              <Typography variant="body1">
                Rent Price (€): €{selectedFlat.rentPrice}
              </Typography>
              <Typography variant="body1">
                Year Built: {selectedFlat.yearBuilt}
              </Typography>
              <Typography variant="body1">
                Date Available: {formatDate(selectedFlat.dateAvailable)}
              </Typography>
              <Typography variant="body1">
                Has AC: {selectedFlat.hasAC ? "Yes" : "No"}
              </Typography>
              {selectedFlat.description && (
                <Typography variant="body1">
                  Description: {selectedFlat.description}
                </Typography>
              )}
              {selectedFlat.imageUrl && (
                <div className={styles.modalImageWrapper}>
                  <img src={selectedFlat.imageUrl} alt="Flat" className={styles.modalImage} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetails} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditModal} onClose={closeEdit} maxWidth="md" fullWidth>
        <DialogTitle>Edit Flat Details</DialogTitle>
      <DialogContent>
  {editData && (
    <div>
    
      <TextField
        label="Rent Price (€)"
        type="number"
        value={editData.rentPrice}
        onChange={(e) => setEditData({ ...editData, rentPrice: parseFloat(e.target.value) || 0 })}
        fullWidth
        margin="normal"
        error={!!errors.rentPrice}
        helperText={errors.rentPrice}
      />

      <FormControlLabel
        control={
          <Switch
            checked={editData.hasAC}
            onChange={(e) => setEditData({ ...editData, hasAC: e.target.checked })}
            color="primary"
          />
        }
        label="Has AC"
      />

     <div>
  <label>Date Available</label>
  <DatePicker
    selected={editData.dateAvailable ? new Date(editData.dateAvailable) : null}
    onChange={(date: Date | null) => setEditData({ ...editData, dateAvailable: date })}
    dateFormat="dd-MM-yyyy"
    className={styles.inputField}
    
  />
  
  {errors.dateAvailable && <p className={styles.errorText}>{errors.dateAvailable}</p>}
</div>

<TextField
  label="Description"
  value={editData.description || ""}
  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
  fullWidth
  margin="normal"
  multiline
  rows={4}
  error={!!errors.description}
  helperText={errors.description}
/>

<TextField
  label="Image URL"
  value={editData.imageUrl || ""}
  onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
  fullWidth
  margin="normal"
  error={!!errors.imageUrl}
  helperText={errors.imageUrl}
      />
      {editData.imageUrl && (
        <div className={styles.imagePreviewWrapper}>
          <img
            src={editData.imageUrl}
            alt="Image preview"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "";
            }}
          />
        </div>
      )}
    </div>
  )}
</DialogContent>

        <DialogActions>
          <Button onClick={closeEdit} color="secondary">
            Cancel
          </Button>
          <Button onClick={saveEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteModal} onClose={closeDeleteConfirm} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this flat? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MyFlatsPageComponent;
  