import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import PropTypes from "prop-types";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState, useCallback } from "react";
import Iconify from "../../../components/iconify";
import { useAuth } from "../../../hooks/useAuth";

/* 🔥 AUTO DUE DATE CALCULATION */
const calculateDueDate = (borrowedDate, days = 14) => {
  if (!borrowedDate) return "";
  const date = new Date(borrowedDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const BorrowalForm = ({
  handleAddBorrowal,
  handleUpdateBorrowal,
  isUpdateForm,
  isModalOpen,
  handleCloseModal,
  borrowal,
  setBorrowal
}) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);

  /* ---------------- API CALLS ---------------- */
  const getAllMembers = useCallback(() => {
    axios
      .get("https://libreary.onrender.com/api/user/getAllMembers")
      .then((response) => {
        const memberList = user.isAdmin
          ? response.data.membersList
          : response.data.membersList.filter((member) => member._id === user._id);

        setMembers(memberList);
        setBorrowal((prev) => ({ ...prev, memberId: user._id }));
      })
      .catch(() => toast.error("Error fetching members"));
  }, [user, setBorrowal]);

  const getAllBooks = useCallback(() => {
    axios
      .get("https://libreary.onrender.com/api/book/getAll")
      .then((response) => setBooks(response.data.booksList))
      .catch(() => toast.error("Error fetching books"));
  }, []);

  useEffect(() => {
    getAllMembers();
    getAllBooks();
  }, [getAllMembers, getAllBooks]);

  /* ---------------- MODAL STYLE ---------------- */
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "white",
    borderRadius: "20px",
    boxShadow: 16,
    p: 4
  };

  return (
    <Modal open={isModalOpen} onClose={handleCloseModal}>
      <Box sx={style}>
        <Container>
          <Typography variant="h4" textAlign="center" pb={2} pt={1}>
            {isUpdateForm ? "Update Borrowal" : "Add Borrowal"}
          </Typography>

          <Stack spacing={3} py={2}>
            {/* MEMBER + BOOK */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Member</InputLabel>
                  <select
                    required
                    disabled={!user.isAdmin}
                    value={borrowal.memberId}
                    onChange={(e) =>
                      setBorrowal({ ...borrowal, memberId: e.target.value })
                    }
                  >
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Book</InputLabel>
                  <select
                    required
                    value={borrowal.bookId}
                    onChange={(e) =>
                      setBorrowal({ ...borrowal, bookId: e.target.value })
                    }
                  >
                    {books
                      .filter((book) => book.isAvailable)
                      .map((book) => (
                        <option key={book._id} value={book._id}>
                          {book.name}
                        </option>
                      ))}
                  </select>
                </FormControl>
              </Grid>
            </Grid>

            {/* BORROWED DATE + AUTO DUE DATE */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Borrowed Date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={borrowal.borrowedDate}
                  onChange={(e) => {
                    const borrowedDate = e.target.value;
                    setBorrowal({
                      ...borrowal,
                      borrowedDate,
                      dueDate: calculateDueDate(borrowedDate)
                    });
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Due Date (Auto)"
                  InputLabelProps={{ shrink: true }}
                  value={borrowal.dueDate}
                  disabled
                />
              </Grid>
            </Grid>

            {/* STATUS */}
            <TextField
              fullWidth
              label="Status"
              value={borrowal.status}
              onChange={(e) =>
                setBorrowal({ ...borrowal, status: e.target.value })
              }
            />

            {/* ACTION BUTTONS */}
            <Box textAlign="center" pt={2}>
              <Button
                size="large"
                variant="contained"
                onClick={isUpdateForm ? handleUpdateBorrowal : handleAddBorrowal}
                startIcon={<Iconify icon="bi:check-lg" />}
                sx={{ mr: 2 }}
              >
                Submit
              </Button>

              <Button
                size="large"
                variant="contained"
                color="inherit"
                onClick={handleCloseModal}
                startIcon={<Iconify icon="charm:cross" />}
              >
                Cancel
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Modal>
  );
};

BorrowalForm.propTypes = {
  isUpdateForm: PropTypes.bool,
  isModalOpen: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  borrowal: PropTypes.object,
  setBorrowal: PropTypes.func,
  handleAddBorrowal: PropTypes.func,
  handleUpdateBorrowal: PropTypes.func
};

export default BorrowalForm;
