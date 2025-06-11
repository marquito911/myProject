import React, { useEffect, useState, type JSX } from "react";
import styles from "./HomePageComponent.module.scss";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  TextField,
  TablePagination,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import type { IFlat } from "../../interfaces/IFlats";
import {
  fetchFlats,
  getUserDetails,
  filterFlats,
  sortFlats,
  formatDate,
  isFlatFavorite,
  toggleFavoriteFlat,
} from "../../utils/utils";
import { useAuth } from "../../contexts/AuthContext";
import { createNavigateToUserProfile } from "../UsersPageComponent/userutile";
import { useNavigate } from "react-router-dom";
import ContactButton from "../../utils/buttonfunctional";
import { useFavoriteFlats } from "../customHook/useFavoriteFlats";

const HomePageComponent: React.FC = (): JSX.Element => {
  const [flats, setFlats] = useState<IFlat[]>([]);
  const [selectedFlat, setSelectedFlat] = useState<IFlat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<{
    firstname: string;
    lastname: string;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [cityFilter, setCityFilter] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [minArea, setMinArea] = useState<number>(0);
  const [maxArea, setMaxArea] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>("city");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSuccessSnackbarOpen, setIsSuccessSnackbarOpen] =
    useState<boolean>(false);
  const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] =
    useState<boolean>(false);

  const { user } = useAuth();
  const { flats: favoriteFlats, removeFlat } = useFavoriteFlats(user?.uid);
  const navigate = useNavigate();
  const navigateToUserProfile = createNavigateToUserProfile(navigate);

  useEffect(() => {
    const loadFlats = async () => {
      try {
        const data = await fetchFlats(setErrorMessage);
        setFlats(data);
      } catch (error) {
        setErrorMessage(
          "An error occurred while fetching flats. Please try again later."
        );
      }
    };
    loadFlats();
  }, [user]);

  const uniqueCities = Array.from(new Set(flats.map((flat) => flat.city)));

  const viewFlatDetails = async (flat: IFlat) => {
    if (flat.userId) {
      try {
        const user = await getUserDetails(flat.userId, setErrorMessage);
        setUserDetails(user);
      } catch (error) {
        setErrorMessage("An error occurred while fetching user details.");
      }
    }
    setSelectedFlat(flat);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFlat(null);
    setUserDetails(null);
  };

  const changePage = (
    _e: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const changeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleFavoriteFlatStatus = async (flat: IFlat) => {
    if (!user) return;

    const isFavorite = isFlatFavorite(favoriteFlats, flat);
    const updatedFlat = { ...flat, isFavorite: !isFavorite };

    setFlats((prevFlats) =>
      prevFlats.map((f) => (f.id === flat.id ? updatedFlat : f))
    );

    try {
      if (isFavorite) {
        await removeFlat(flat.id);
        setSuccessMessage("Removed from favorites");
  setFlats((prevFlats) =>
        prevFlats.map((f) => (f.id === flat.id ? flat : f))
      );

      } else {
        await toggleFavoriteFlat(user.uid, flat, false, setErrorMessage);
        setSuccessMessage("Added to favorites");

          setFlats((prevFlats) =>
        prevFlats.map((f) => (f.id === flat.id ? flat : f))
      );
      }
    
  setFlats((prevFlats) =>
        prevFlats.map((f) => (f.id === flat.id ? flat : f))
      );
      setIsSuccessSnackbarOpen(true);
      setTimeout(() => {
        setIsSuccessSnackbarOpen(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        "An error occurred while updating favorites. Please try again."
      );
      setIsErrorSnackbarOpen(true);

      setTimeout(() => {
        setIsErrorSnackbarOpen(false);
        setErrorMessage("");
      }, 3000);
    }
  };

  const clearFilters = () => {
    setCityFilter("");
    setMinPrice(0);
    setMaxPrice(10000);
    setMinArea(0);
    setMaxArea(10000);
    setSortBy("city");
    setSortOrder("asc");
  };

  const filteredFlats = filterFlats(
    flats,
    cityFilter,
    minPrice,
    maxPrice,
    minArea,
    maxArea
  );
  const sortedFlats = sortFlats(filteredFlats, sortBy, sortOrder);

  return (
    <div className={styles.homePageContainer}>
      <h1 className={styles.title}>Available Flats</h1>

      {errorMessage && (
        <div className={styles.errorContainer}>
          <Alert severity="error">{errorMessage}</Alert>
        </div>
      )}

      <Box className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <Box display="flex" gap={1}>
              <TextField
                type="number"
                label="Min Price (€)"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                fullWidth
              />
              <TextField
                type="number"
                label="Max Price (€)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                fullWidth
              />
            </Box>
          </div>

          <div className={styles.filterItem}>
            <Box display="flex" gap={1}>
              <TextField
                type="number"
                label="Min Area (m²)"
                value={minArea}
                onChange={(e) => setMinArea(Number(e.target.value))}
                sx={{ flex: 1 }}
              />
              <TextField
                type="number"
                label="Max Area (m²)"
                value={maxArea}
                onChange={(e) => setMaxArea(Number(e.target.value))}
                sx={{ flex: 1 }}
              />
            </Box>
          </div>

          <div className={styles.filterItem}>
            <Typography>Sort By</Typography>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="city">City</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="area">Area Size</MenuItem>
            </Select>
          </div>

          <div className={styles.filterItem}>
            <Typography>Sort Order</Typography>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              label="Sort Order"
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </div>

          <div className={styles.filterItem}>
            <FormControl>
              <InputLabel>All city</InputLabel>
              <Select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                label="City"
              >
                <MenuItem value="">All Cities</MenuItem>
                {uniqueCities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        <Button
          onClick={clearFilters}
          variant="outlined"
          color="secondary"
          className={styles.clearFiltersButton}
        >
          Clear Filters
        </Button>
      </Box>

      <div className={styles.cardContainer}>
        {sortedFlats
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((flat) => (
            <div
              key={`${flat.city}-${flat.streetNumber}`}
              className={styles.card}
            >
              <div className={styles.cardImage}>
                {flat.imageUrl ? (
                  <img src={flat.imageUrl} alt="Flat" />
                ) : (
                  <p>No image available</p>
                )}
              </div>
              <div className={styles.cardDetails}>
                <h3>{flat.city}</h3>
                <p>
                  {flat.streetName} {flat.streetNumber}
                </p>
                <p>
                  <strong>Price:</strong> €{flat.rentPrice}
                </p>
                <p>
                  <strong>Size:</strong> {flat.areaSize} m²
                </p>
                <p>
                  <strong>Year Built:</strong> {flat.yearBuilt}
                </p>
                <p>
                  <strong>Available from:</strong>{" "}
                  {formatDate(flat.dateAvailable)}
                </p>
              </div>
              <div className={styles.cardFooter}>
                <Button
                  onClick={() => viewFlatDetails(flat)}
                  variant="contained"
                  color="primary"
                >
                  View Details
                </Button>
                <IconButton
                  onClick={() => toggleFavoriteFlatStatus(flat)}
                  color={
                    isFlatFavorite(favoriteFlats, flat) ? "error" : "default"
                  }
                >
                  <FavoriteIcon />
                </IconButton>
              </div>
            </div>
          ))}
      </div>

      <TablePagination
        rowsPerPageOptions={[7, 14, 21]}
        component="div"
        count={filteredFlats.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={changePage}
        onRowsPerPageChange={changeRowsPerPage}
      />

      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>Flat Details</DialogTitle>
        <DialogContent>
          {selectedFlat && (
            <div>
              <Typography variant="body1">City: {selectedFlat.city}</Typography>
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
                  <img
                    src={selectedFlat.imageUrl}
                    alt="Flat"
                    className={styles.modalImage}
                  />
                </div>
              )}
              {userDetails && (
                <Typography
                  variant="body1"
                  onClick={() =>
                    navigateToUserProfile(selectedFlat?.userId || "")
                  }
                  className={styles.clickText}
                >
                  Posted by: {userDetails.firstname} {userDetails.lastname}
                </Typography>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">
            Close
          </Button>
          {selectedFlat && (
            <ContactButton
              flatId={selectedFlat.id}
              ownerId={selectedFlat.userId}
              currentUserId={user?.uid}
            />
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={isSuccessSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setIsSuccessSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setIsSuccessSnackbarOpen(false)}
          severity="success"
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={isErrorSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setIsErrorSnackbarOpen(false)}
      >
        <Alert onClose={() => setIsErrorSnackbarOpen(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default HomePageComponent;
