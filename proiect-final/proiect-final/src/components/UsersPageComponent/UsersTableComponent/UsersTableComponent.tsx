import React, { type JSX, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TablePagination,
  TableRow,
  Paper,
  IconButton,
  Modal,
  Typography,
  Button,
  TableHead,
  Snackbar,
  Alert,
} from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { grey } from "@mui/material/colors";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import type { IUser } from "../../../interfaces/AuthContext";
import { useNavigate } from "react-router-dom"; 
import styles from "./UserTableComponent.module.scss";

interface IUsersTableComponentProps {
  users: IUser[];
  updateUser: (user: IUser) => void;
}

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
}

function PaginationActions({ count, page, rowsPerPage, onPageChange }: TablePaginationActionsProps) {
  const theme = useTheme();

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={(e) => onPageChange(e, 0)}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={(e) => onPageChange(e, page - 1)}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={(e) => onPageChange(e, page + 1)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={(e) => onPageChange(e, Math.max(0, Math.ceil(count / rowsPerPage) - 1))}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

const UsersTableComponent: React.FC<IUsersTableComponentProps> = ({
  users,
  updateUser,
}): JSX.Element => {
  const headers = ["First name", "Last name", "Email", "Admin", "Active"];
  const [currentUser, setCurrentUser] = useState<IUser | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [rowsCount, setRowsCount] = useState(5);
  const [ownerAlertVisible, setOwnerAlertVisible] = useState(false);
  const emptyRows = pageNumber > 0 ? Math.max(0, (1 + pageNumber) * rowsCount - users.length) : 0;

  const navigate = useNavigate();

  const switchPage = (e: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPageNumber(newPage);
  };

  const updateRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsCount(parseInt(e.target.value, 10));
    setPageNumber(0);
  };

  const openUserModal = (user: IUser) => {
    setCurrentUser(user);
    setModalOpen(true);
  };

  const closeUserModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.id === "closeModal") {
      setModalOpen(false);
      setCurrentUser(undefined);
    }
  };

  const showOwnerWarning = () => {
    setOwnerAlertVisible(true);
  };

  const switchAdminStatus = async () => {
    if (!currentUser) return;

    if (currentUser.Owner) {
      showOwnerWarning();
      return;
    }

    const updated = { ...currentUser, isAdmin: !currentUser.isAdmin };
    setCurrentUser(updated);
    updateUser(updated);

    try {
      const userDocRef = doc(db, "users", currentUser.id);
      await updateDoc(userDocRef, { isAdmin: updated.isAdmin });
    } catch {
// console.log();
    }
  };

  const switchActiveStatus = async () => {
    if (!currentUser) return;

    if (currentUser.Owner) {
      showOwnerWarning();
      return;
    }

    const updated = { ...currentUser, isActive: !currentUser.isActive };
    setCurrentUser(updated);
    updateUser(updated);

    try {
      const userDocRef = doc(db, "users", currentUser.id);
      await updateDoc(userDocRef, { isActive: updated.isActive });
    } catch {
// console.log();
    }
  };

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 500, mt: 2 }} aria-label="users table">
          <TableHead>
            <TableRow>
              {headers.map((header, i) => (
                <TableCell key={i} align="center" sx={{ bgcolor: grey[200] }}>
                  {header}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ bgcolor: grey[200] }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(rowsCount > 0
              ? users.slice(pageNumber * rowsCount, pageNumber * rowsCount + rowsCount)
              : users
            ).map((user) => (
              <TableRow key={user.id}>
                <TableCell align="center">{user.firstname}</TableCell>
                <TableCell align="center">{user.lastname}</TableCell>
                <TableCell align="center">{user.email}</TableCell>
                <TableCell align="center">{user.isAdmin ? "Yes" : "No"}</TableCell>
                <TableCell align="center">{user.isActive ? "Yes" : "No"}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => openUserModal(user)}>
                    <ManageAccountsIcon titleAccess="Manage account" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, { label: "All", value: -1 }]}
                colSpan={headers.length + 1}
                count={users.length}
                rowsPerPage={rowsCount}
                page={pageNumber}
                slotProps={{
                  select: {
                    inputProps: { "aria-label": "rows per page" },
                    native: true,
                  },
                }}
                onPageChange={switchPage}
                onRowsPerPageChange={updateRowsPerPage}
                ActionsComponent={PaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Modal
        open={modalOpen}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box id="userModal" sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {currentUser?.email}
          </Typography>

          <div className={styles.modalButtonGroup}>
            <Button onClick={switchAdminStatus} variant="contained" color="primary">
              {currentUser?.isAdmin ? "Remove Admin" : "Make Admin"}
            </Button>

            <Button onClick={switchActiveStatus} variant="contained" color="secondary">
              {currentUser?.isActive ? "Deactivate" : "Activate"} Account
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                if (currentUser) {
                  navigate(`/user/${currentUser.id}`);
                }
              }}
            >
              View Profile
            </Button>

            <Button variant="contained" id="closeModal" onClick={closeUserModal} color="inherit">
              Close
            </Button>
          </div>
        </Box>
      </Modal>

      <Snackbar
        open={ownerAlertVisible}
        autoHideDuration={4000}
        onClose={() => setOwnerAlertVisible(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOwnerAlertVisible(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          Owner can not be modified.
        </Alert>
      </Snackbar>
    </>
  );
};

export default UsersTableComponent;
