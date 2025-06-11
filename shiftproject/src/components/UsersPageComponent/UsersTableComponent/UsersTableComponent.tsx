import React, { JSX, useState } from "react";
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
import { IUser } from "../../../interfaces/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

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

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

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
  const tableHeaders = ["First name", "Last name", "Email", "Admin", "Active"];
  const [selectedUser, setSelectedUser] = useState<IUser | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [alertOpen, setAlertOpen] = useState(false);
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const handleChangePage = (
    e: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleManageUser = (user: IUser) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.id === "closeModal") {
      setOpen(false);
      setSelectedUser(undefined);
    }
  };

  const showOwnerAlert = () => {
    setAlertOpen(true);
  };

  const toggleAdmin = async () => {
    if (selectedUser) {
      if (selectedUser.Owner) {
        showOwnerAlert();
        return;
      }

      const updatedUser = { ...selectedUser, isAdmin: !selectedUser.isAdmin };
      setSelectedUser(updatedUser);
      updateUser(updatedUser);

      try {
        const userRef = doc(db, "users", selectedUser.id);
        await updateDoc(userRef, { isAdmin: updatedUser.isAdmin });
      } catch (error) { 
      }
    }
  };

  const toggleActiveStatus = async () => {
    if (selectedUser) {
      if (selectedUser.Owner) {
        showOwnerAlert();
        return;
      }

      const updatedUser = { ...selectedUser, isActive: !selectedUser.isActive };
      setSelectedUser(updatedUser);
      updateUser(updatedUser);

      try {
        const userRef = doc(db, "users", selectedUser.id);
        await updateDoc(userRef, { isActive: updatedUser.isActive });
      } catch (error) { 
      }
    }
  };

  const style = {
    position: "absolute",
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
        <Table sx={{ minWidth: 500, mt: 2 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              {tableHeaders.map((value, index) => (
                <TableCell key={index} align="center" sx={{ bgcolor: grey[200] }}>
                  {value}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ bgcolor: grey[200] }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : users
            ).map((user) => (
              <TableRow key={user.id}>
                <TableCell align="center">{user.firstname}</TableCell>
                <TableCell align="center">{user.lastname}</TableCell>
                <TableCell align="center">{user.email}</TableCell>
                <TableCell align="center">{user.isAdmin ? "Yes" : "No"}</TableCell>
                <TableCell align="center">{user.isActive ? "Yes" : "No"}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleManageUser(user)}>
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
                colSpan={tableHeaders.length + 1}
                count={users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                slotProps={{
                  select: {
                    inputProps: { "aria-label": "rows per page" },
                    native: true,
                  },
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box id="userModal" sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {selectedUser?.email}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <Button onClick={toggleAdmin} variant="contained" color="primary">
              {selectedUser?.isAdmin ? "Remove Admin" : "Make Admin"}
            </Button>
            <Button
              onClick={toggleActiveStatus}
              variant="contained"
              color="secondary"
              sx={{ mt: 2 }}
            >
              {selectedUser?.isActive ? "Deactivate" : "Activate"} Account
            </Button>
          </Typography>
          <Button variant="contained" id="closeModal" onClick={handleClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setAlertOpen(false)} severity="warning" sx={{ width: "100%" }}>
          Owner can not be modified.
        </Alert>
      </Snackbar>
    </>
  );
};

export default UsersTableComponent;
