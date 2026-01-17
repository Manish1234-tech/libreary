import { Helmet } from "react-helmet-async";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
  TextField,
  Alert,
  Chip,
} from "@mui/material";

import { useAuth } from "../../../hooks/useAuth";

import Label from "../../../components/label";
import Iconify from "../../../components/iconify";
import Scrollbar from "../../../components/scrollbar";

import BorrowalListHead from "./BorrowalListHead";
import BorrowalForm from "./BorrowalForm";
import BorrowalDialog from "./BorrowalDialog";
import BorrowalFineModal from "./BorrowalFineModal";

import { applySortFilter, getComparator } from "../../../utils/tableOperations";
import { apiUrl, methods, routes } from "../../../constants";

const TABLE_HEAD = [
  { id: "member", label: "Member" },
  { id: "book", label: "Book" },
  { id: "borrowedDate", label: "Borrowed On" },
  { id: "dueDate", label: "Due Date" },
  { id: "status", label: "Status" },
  { id: "fine", label: "Fine (₹)" },
  { id: "receipt", label: "Receipt" },
  { id: "actions", label: "" },
];

const FINE_PER_DAY = 10;

export default function BorrowalPage() {
  const { user } = useAuth();

  const [borrowals, setBorrowals] = useState([]);
  const [borrowal, setBorrowal] = useState({
    memberId: "",
    bookId: "",
    borrowedDate: "",
    dueDate: "",
    status: "Issued",
  });

  const [selectedBorrowalId, setSelectedBorrowalId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("member");
  const [filterText, setFilterText] = useState("");

  const [fineModal, setFineModal] = useState(false);
  const [fineBorrowal, setFineBorrowal] = useState(null);

  /* ---------------- AUTO FINE ---------------- */
  const calculateFine = (dueDate, finePaid) => {
    if (!dueDate || finePaid) return 0;

    const today = new Date();
    const due = new Date(dueDate);

    if (today <= due) return 0;

    const daysLate = Math.ceil(
      (today - due) / (1000 * 60 * 60 * 24)
    );

    return daysLate * FINE_PER_DAY;
  };

  /* ---------------- LOAD BORROWALS ---------------- */
  const getAllBorrowals = useCallback(() => {
    setIsLoading(true);

    axios
      .get(apiUrl(routes.BORROWAL, methods.GET_ALL))
      .then((res) => {
        const list = Array.isArray(res.data.borrowalList)
          ? res.data.borrowalList
          : [];

        const enriched = list.map((b) => ({
          ...b,
          fineAmount: calculateFine(b.dueDate, b.finePaid),
        }));

        const filtered = user?.isAdmin
          ? enriched
          : enriched.filter((b) => b?.member?._id === user?._id);

        setBorrowals(filtered);
      })
      .catch(() => toast.error("Failed to load borrowals"))
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    getAllBorrowals();
  }, [getAllBorrowals]);

  /* ---------------- CRUD ---------------- */
  const addBorrowal = async () => {
    try {
      await axios.post(apiUrl(routes.BORROWAL, methods.POST), borrowal);
      toast.success("Borrowal added");
      setOpenForm(false);
      getAllBorrowals();
    } catch {
      toast.error("Failed to add borrowal");
    }
  };

  const updateBorrowal = async () => {
    try {
      await axios.put(
        apiUrl(routes.BORROWAL, methods.PUT, selectedBorrowalId),
        borrowal
      );
      toast.success("Borrowal updated");
      setOpenForm(false);
      getAllBorrowals();
    } catch {
      toast.error("Failed to update borrowal");
    }
  };

  const deleteBorrowal = async () => {
    try {
      await axios.delete(
        apiUrl(routes.BORROWAL, methods.DELETE, selectedBorrowalId)
      );
      toast.success("Borrowal deleted");
      setOpenDelete(false);
      getAllBorrowals();
    } catch {
      toast.error("Failed to delete borrowal");
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredBorrowals = applySortFilter(
    borrowals,
    getComparator(order, orderBy),
    filterText
  );

  return (
    <>
      <Helmet>
        <title>Borrowals</title>
      </Helmet>

      <Container>
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Borrowals</Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />

            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => {
                setBorrowal({
                  memberId: "",
                  bookId: "",
                  borrowedDate: "",
                  dueDate: "",
                  status: "Issued",
                });
                setIsUpdate(false);
                setOpenForm(true);
              }}
            >
              New Borrowal
            </Button>
          </Stack>
        </Stack>

        {isLoading ? (
          <Grid textAlign="center" py={5}>
            <CircularProgress />
          </Grid>
        ) : (
          <Card>
            <Scrollbar>
              {filteredBorrowals.length === 0 ? (
                <Alert severity="info">No borrowals found</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <BorrowalListHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      onRequestSort={(e, p) => setOrderBy(p)}
                    />

                    <TableBody>
                      {filteredBorrowals
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((b) => (
                          <TableRow key={b._id} hover>
                            <TableCell>{b.member?.name || "-"}</TableCell>
                            <TableCell>{b.book?.name || "-"}</TableCell>
                            <TableCell>
                              {b.borrowedDate
                                ? new Date(b.borrowedDate).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {b.dueDate
                                ? new Date(b.dueDate).toLocaleDateString()
                                : "-"}
                            </TableCell>

                            <TableCell>
                              {b.fineAmount > 0 && !b.finePaid ? (
                                <Label color="error">Overdue</Label>
                              ) : b.status === "Returned" ? (
                                <Label color="success">Returned</Label>
                              ) : (
                                <Label color="warning">Issued</Label>
                              )}
                            </TableCell>

                            <TableCell>
                              {b.fineAmount > 0 && !b.finePaid ? (
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setFineBorrowal(b);
                                    setFineModal(true);
                                  }}
                                >
                                  Pay ₹{b.fineAmount}
                                </Button>
                              ) : b.finePaid ? (
                                <Chip label="Paid" color="success" />
                              ) : (
                                "-"
                              )}
                            </TableCell>

                            <TableCell>{b.receiptNumber || "-"}</TableCell>

                            <TableCell align="right">
                              <IconButton
                                onClick={(e) => {
                                  setSelectedBorrowalId(b._id);
                                  setBorrowal(b);
                                  setMenuAnchor(e.currentTarget);
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
              )}
            </Scrollbar>

            <TablePagination
              component="div"
              count={filteredBorrowals.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(e, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Card>
        )}
      </Container>

      {/* MENU */}
      <Popover
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setIsUpdate(true);
            setOpenForm(true);
            setMenuAnchor(null);
          }}
        >
          Edit
        </MenuItem>

        <MenuItem
          sx={{ color: "error.main" }}
          onClick={() => {
            setOpenDelete(true);
            setMenuAnchor(null);
          }}
        >
          Delete
        </MenuItem>
      </Popover>

      {/* MODALS */}
      <BorrowalForm
        open={openForm}
        isUpdate={isUpdate}
        borrowal={borrowal}
        setBorrowal={setBorrowal}
        onClose={() => setOpenForm(false)}
        onAdd={addBorrowal}
        onUpdate={updateBorrowal}
      />

      <BorrowalDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={deleteBorrowal}
      />

      <BorrowalFineModal
        open={fineModal}
        borrowal={fineBorrowal}
        onClose={() => setFineModal(false)}
        refresh={getAllBorrowals}
      />
    </>
  );
}
