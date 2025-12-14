import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { Alert } from "@mui/lab";
import {
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
import { useAuth } from "../../../hooks/useAuth";

import Label from "../../../components/label";
import Iconify from "../../../components/iconify";
import Scrollbar from "../../../components/scrollbar";

import BorrowalListHead from "./BorrowalListHead";
import BorrowalForm from "./BorrowalForm";
import BorrowalsDialog from "./BorrowalDialog";
import { applySortFilter, getComparator } from "../../../utils/tableOperations";
import { apiUrl, methods, routes } from "../../../constants";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "memberName", label: "Member Name", alignRight: false },
  { id: "bookName", label: "Book Name", alignRight: false },
  { id: "borrowedDate", label: "Borrowed On", alignRight: false },
  { id: "dueDate", label: "Due On", alignRight: false },
  { id: "status", label: "Status", alignRight: false },
  { id: "", label: "", alignRight: false },
  { id: "", label: "", alignRight: true }
];

// ----------------------------------------------------------------------

const BorrowalPage = () => {
  const { user } = useAuth();

  // TABLE STATES
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("memberName");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState("");

  // DATA STATES
  const [borrowal, setBorrowal] = useState({
    bookId: "",
    memberId: "",
    borrowedDate: "",
    dueDate: "",
    status: ""
  });

  const [borrowals, setBorrowals] = useState([]);
  const [selectedBorrowalId, setSelectedBorrowalId] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateForm, setIsUpdateForm] = useState(false);

  // ----------------------------------------------------------------------
  // LOAD BORROWALS

  useEffect(() => {
    getAllBorrowals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllBorrowals = () => {
    axios
      .get(apiUrl(routes.BORROWAL, methods.GET_ALL))
      .then((response) => {
        const list = user.isAdmin
          ? response.data.borrowalsList
          : response.data.borrowalsList.filter(
              (b) => b.memberId === user._id
            );

        setBorrowals(list);
        setIsTableLoading(false);
      })
      .catch((error) => console.log(error));
  };

  // ----------------------------------------------------------------------
  // CRUD

  const addBorrowal = () => {
    axios
      .post(apiUrl(routes.BORROWAL, methods.POST), borrowal)
      .then(() => {
        toast.success("Borrowal added");
        handleCloseModal();
        getAllBorrowals();
        clearForm();
      })
      .catch(() => toast.error("Something went wrong"));
  };

  const updateBorrowal = () => {
    axios
      .put(
        apiUrl(routes.BORROWAL, methods.PUT, selectedBorrowalId),
        borrowal
      )
      .then(() => {
        toast.success("Borrowal updated");
        handleCloseModal();
        handleCloseMenu();
        getAllBorrowals();
        clearForm();
      })
      .catch(() => toast.error("Something went wrong"));
  };

  const deleteBorrowal = () => {
    axios
      .delete(
        apiUrl(routes.BORROWAL, methods.DELETE, selectedBorrowalId)
      )
      .then(() => {
        toast.success("Borrowal deleted");
        handleCloseDialog();
        handleCloseMenu();
        getAllBorrowals();
      })
      .catch(() => toast.error("Something went wrong"));
  };

  // ----------------------------------------------------------------------

  const getSelectedBorrowalDetails = () => {
    const selected = borrowals.find(
      (b) => b._id === selectedBorrowalId
    );
    setBorrowal(selected);
  };

  const clearForm = () => {
    setBorrowal({
      bookId: "",
      memberId: "",
      borrowedDate: "",
      dueDate: "",
      status: ""
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

  const filteredBorrowals = applySortFilter(
    borrowals.filter((b) => {
      const search = filterText.toLowerCase();
      return (
        b.member?.name.toLowerCase().includes(search) ||
        b.book?.name.toLowerCase().includes(search) ||
        b.status.toLowerCase().includes(search)
      );
    }),
    getComparator(order, orderBy)
  );

  // ----------------------------------------------------------------------

  return (
    <>
      <Helmet>
        <title>Borrowals</title>
      </Helmet>

      <Container>
        {/* HEADER */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3">Borrowals</Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search member / book / status..."
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
              New Borrowal
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
              {filteredBorrowals.length > 0 ? (
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <BorrowalListHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={filteredBorrowals.length}
                      onRequestSort={handleRequestSort}
                    />

                    <TableBody>
                      {filteredBorrowals
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((borrowal) => (
                          <TableRow hover key={borrowal._id}>
                            <TableCell>{borrowal.member.name}</TableCell>
                            <TableCell>{borrowal.book.name}</TableCell>
                            <TableCell>
                              {new Date(
                                borrowal.borrowedDate
                              ).toLocaleDateString("en-US")}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                borrowal.dueDate
                              ).toLocaleDateString("en-US")}
                            </TableCell>
                            <TableCell>{borrowal.status}</TableCell>

                            <TableCell>
                              {new Date(borrowal.dueDate) < new Date() && (
                                <Label color="error">Overdue</Label>
                              )}
                            </TableCell>

                            <TableCell align="right">
                              <IconButton
                                onClick={(e) => {
                                  setSelectedBorrowalId(borrowal._id);
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
                <Alert severity="warning">No borrowals found</Alert>
              )}
            </Scrollbar>

            {filteredBorrowals.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredBorrowals.length}
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
            getSelectedBorrowalDetails();
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
      <BorrowalForm
        isUpdateForm={isUpdateForm}
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        id={selectedBorrowalId}
        borrowal={borrowal}
        setBorrowal={setBorrowal}
        handleAddBorrowal={addBorrowal}
        handleUpdateBorrowal={updateBorrowal}
      />

      <BorrowalsDialog
        isDialogOpen={isDialogOpen}
        borrowalsId={selectedBorrowalId}
        handleDeleteBorrowal={deleteBorrowal}
        handleCloseDialog={handleCloseDialog}
      />
    </>
  );
};

export default BorrowalPage;
