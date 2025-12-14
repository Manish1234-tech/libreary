import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { Alert } from "@mui/lab";
import {
  Avatar,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
  TextField
} from "@mui/material";

import Iconify from "../../../components/iconify";
import Scrollbar from "../../../components/scrollbar";
import Label from "../../../components/label";

import UserTableHead from "./UserListHead";
import UserForm from "./UserForm";
import UserDialog from "./UserDialog";
import { applySortFilter, getComparator } from "../../../utils/tableOperations";
import { apiUrl, methods, routes } from "../../../constants";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "photo", label: "Photo", alignRight: false },
  { id: "name", label: "Name", alignRight: false },
  { id: "dob", label: "DOB", alignRight: false },
  { id: "email", label: "Email", alignRight: false },
  { id: "phone", label: "Phone", alignRight: false },
  { id: "role", label: "Role", alignRight: false },
  { id: "", label: "", alignRight: false }
];

// ----------------------------------------------------------------------

const UserPage = () => {
  // TABLE STATES
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState("");

  // DATA STATES
  const [user, setUser] = useState({
    name: "",
    dob: "",
    email: "",
    password: "",
    phone: "",
    isAdmin: false,
    photoUrl: ""
  });

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateForm, setIsUpdateForm] = useState(false);

  // ----------------------------------------------------------------------
  // LOAD USERS

  useEffect(() => {
    getAllUsers();
  }, []);

  const getAllUsers = () => {
    axios
      .get(apiUrl(routes.USER, methods.GET_ALL))
      .then((response) => {
        setUsers(response.data.usersList);
        setIsTableLoading(false);
      })
      .catch((error) => console.log(error));
  };

  // ----------------------------------------------------------------------
  // CRUD

  const addUser = () => {
    axios
      .post(apiUrl(routes.USER, methods.POST), user)
      .then(() => {
        toast.success("User added");
        handleCloseModal();
        getAllUsers();
        clearForm();
      })
      .catch((error) => {
        if (error.response?.status === 403) {
          toast.error("User already exists");
        } else {
          toast.error("Something went wrong");
        }
      });
  };

  const updateUser = () => {
    axios
      .put(apiUrl(routes.USER, methods.PUT, selectedUserId), user)
      .then(() => {
        toast.success("User updated");
        handleCloseModal();
        handleCloseMenu();
        getAllUsers();
        clearForm();
      })
      .catch(() => toast.error("Something went wrong"));
  };

  const deleteUser = (userId) => {
    axios
      .delete(apiUrl(routes.USER, methods.DELETE, userId))
      .then(() => {
        toast.success("User deleted");
        handleCloseDialog();
        handleCloseMenu();
        getAllUsers();
      })
      .catch(() => toast.error("Something went wrong"));
  };

  // ----------------------------------------------------------------------

  const getSelectedUserDetails = () => {
    const selectedUser = users.find((u) => u._id === selectedUserId);
    setUser(selectedUser);
  };

  const clearForm = () => {
    setUser({
      name: "",
      dob: "",
      email: "",
      password: "",
      phone: "",
      isAdmin: false,
      photoUrl: ""
    });
  };

  // ----------------------------------------------------------------------
  // HANDLERS

  const handleOpenMenu = (event) => setIsMenuOpen(event.currentTarget);
  const handleCloseMenu = () => setIsMenuOpen(null);
  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ----------------------------------------------------------------------
  // SEARCH + SORT

  const filteredUsers = applySortFilter(
    users.filter((user) => {
      const search = filterText.toLowerCase();
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phone.toLowerCase().includes(search)
      );
    }),
    getComparator(order, orderBy)
  );

  // ----------------------------------------------------------------------

  return (
    <>
      <Helmet>
        <title>Users</title>
      </Helmet>

      <Container>
        {/* HEADER */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3">Users</Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search name / email / phone..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />

            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => {
                setIsUpdateForm(false);
                handleOpenModal();
              }}
            >
              New User
            </Button>
          </Stack>
        </Stack>

        {/* TABLE */}
        {isTableLoading ? (
          <Grid textAlign="center">
            <CircularProgress />
          </Grid>
        ) : (
          <Card>
            <Scrollbar>
              {filteredUsers.length > 0 ? (
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <UserTableHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={filteredUsers.length}
                      onRequestSort={handleRequestSort}
                    />

                    <TableBody>
                      {filteredUsers
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((user) => (
                          <TableRow hover key={user._id}>
                            <TableCell>
                              <Avatar src={user.photoUrl} alt={user.name} />
                            </TableCell>

                            <TableCell>{user.name}</TableCell>
                            <TableCell>
                              {new Date(user.dob).toLocaleDateString("en-US")}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>

                            <TableCell>
                              {user.isAdmin ? (
                                <Label color="warning">Librarian</Label>
                              ) : (
                                <Label color="success">Member</Label>
                              )}
                            </TableCell>

                            <TableCell align="right">
                              <IconButton
                                onClick={(e) => {
                                  setSelectedUserId(user._id);
                                  handleOpenMenu(e);
                                }}
                              >
                                <Iconify icon="eva:more-vertical-fill" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="warning">No users found</Alert>
              )}
            </Scrollbar>

            {filteredUsers.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </Card>
        )}
      </Container>

      {/* MENU */}
      <Popover open={Boolean(isMenuOpen)} anchorEl={isMenuOpen} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            setIsUpdateForm(true);
            getSelectedUserDetails();
            handleCloseMenu();
            handleOpenModal();
          }}
        >
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: "error.main" }} onClick={handleOpenDialog}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      {/* MODALS */}
      <UserForm
        isUpdateForm={isUpdateForm}
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        id={selectedUserId}
        user={user}
        setUser={setUser}
        handleAddUser={addUser}
        handleUpdateUser={updateUser}
      />

      <UserDialog
        isDialogOpen={isDialogOpen}
        userId={selectedUserId}
        handleDeleteUser={deleteUser}
        handleCloseDialog={handleCloseDialog}
      />
    </>
  );
};

export default UserPage;
