import React, { useState, useMemo, useCallback, type JSX } from "react";
import {
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { useAuth } from "../../contexts/AuthContext"; 
import { formatDate, getUserDetails, sortFlats } from "../../utils/utils";
import { useNavigate } from "react-router-dom";
import { createNavigateToUserProfile } from "../UsersPageComponent/userutile";
import ContactButton from "../../utils/buttonfunctional";

import styles from "../HomePageComponent/HomePageComponent.module.scss";
import type { IFlat } from "../../interfaces/IFlats";
import { useFavoriteFlats } from "../customHook/useFavoriteFlats";

const MyFavoriteFlatsPage: React.FC = ():JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const goToUserProfile = createNavigateToUserProfile(navigate);

  const { flats: favoriteFlats, loading, error, removeFlat } = useFavoriteFlats(user?.uid);

  const [selectedFlat, setSelectedFlat] = useState<IFlat | null>(null);
  const [posterDetails, setPosterDetails] = useState<{ firstname: string; lastname: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);

   const [sortBy, setSortBy] = useState<"city" | "price" | "area">("city");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const sortedFlats = useMemo(() => {
    return sortFlats(favoriteFlats, sortBy, sortOrder);
  }, [favoriteFlats, sortBy, sortOrder]);

  const paginatedFlats = useMemo(() => {
    return sortedFlats.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedFlats, page, rowsPerPage]);

  const removeFromFavorites = useCallback(
    async (flatId: string) => {
      const success = await removeFlat(flatId);
      if (success) {
        setSnackbarMessage("Favorite removed successfully.");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Failed to remove favorite.");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    },
    [removeFlat]
  );

  const showFlatDetails = useCallback(
    async (flat: IFlat) => {
      if (flat.userId) {
        try {
          const user = await getUserDetails(flat.userId, console.error);
          setPosterDetails(user);
        } catch {
          setPosterDetails(null);
        }
      }
      setSelectedFlat(flat);
      setModalOpen(true);
    },
    []
  );

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFlat(null);
    setPosterDetails(null);
  };

  const updatePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const updateRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className={styles.homePageContainer}>
      <h2 className={styles.title}>My Favorite Flats</h2>

     
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
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : favoriteFlats.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          You have no favorites yet.
        </Typography>
      ) : (
        <>
          <div className={styles.cardContainer}>
            {paginatedFlats.map((flat) => (
              <div key={flat.id} className={styles.card}>
                <div className={styles.cardImage}>
                  {flat.imageUrl ? <img src={flat.imageUrl} alt="Flat" /> : <p>No image available</p>}
                </div>
                <div className={styles.cardDetails}>
                  <h3>{flat.city}</h3>
                  <p>
                    {flat.streetName} {flat.streetNumber}
                  </p>
                  <p>Price: €{flat.rentPrice}</p>
                  <p>Size: {flat.areaSize} m²</p>
                  <p>Year Built: {flat.yearBuilt}</p>
                  <p>Available from: {formatDate(flat.dateAvailable)}</p>
                </div>
                <div className={styles.cardFooter}>
                  <Button onClick={() => showFlatDetails(flat)} variant="contained" color="primary">
                    View Details
                  </Button>
                  <IconButton onClick={() => removeFromFavorites(flat.id!)} color="error">
                    <FavoriteIcon />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>

          <TablePagination
            rowsPerPageOptions={[7, 14, 21]}
            component="div"
            count={favoriteFlats.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={updatePage}
            onRowsPerPageChange={updateRowsPerPage}
          />
        </>
      )}

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>Flat Details</DialogTitle>
        <DialogContent>
          {selectedFlat && (
            <>
              <Typography>City: {selectedFlat.city}</Typography>
              <Typography>Street: {selectedFlat.streetName} {selectedFlat.streetNumber}</Typography>
              <Typography>Size: {selectedFlat.areaSize} m²</Typography>
              <Typography>Rent: €{selectedFlat.rentPrice}</Typography>
              <Typography>Year Built: {selectedFlat.yearBuilt}</Typography>
              <Typography>Available: {formatDate(selectedFlat.dateAvailable)}</Typography>
              <Typography>Has AC: {selectedFlat.hasAC ? "Yes" : "No"}</Typography>
              {selectedFlat.description && <Typography>Description: {selectedFlat.description}</Typography>}
              {selectedFlat.imageUrl && (
                <div className={styles.modalImageWrapper}>
                  <img src={selectedFlat.imageUrl} alt="Flat" className={styles.modalImage} />
                </div>
              )}
              {posterDetails && (
                <Typography
                  className={styles.clickText}
                  onClick={() => goToUserProfile(selectedFlat.userId || "")}
                >
                  Posted by: {posterDetails.firstname} {posterDetails.lastname}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">Close</Button>
          <ContactButton
            flatId={selectedFlat?.id || ""}
            ownerId={selectedFlat?.userId || ""}
            currentUserId={user?.uid}
          />
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={closeSnackbar}>
        <Alert severity={snackbarSeverity} onClose={closeSnackbar}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MyFavoriteFlatsPage;
