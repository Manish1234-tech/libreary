import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import PropTypes from "prop-types";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Iconify from "../../../components/iconify";

// ---------------- MODAL STYLE ----------------
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 2
};

const BookForm = ({
  isUpdateForm,
  isModalOpen,
  handleCloseModal,
  book,
  setBook,
  handleAddBook,
  handleUpdateBook
}) => {
  const [isModalLoading, setIsModalLoading] = useState(true);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);

  // ---------------- API CALLS ----------------
  const getAllAuthors = () => {
    axios
      .get("https://libreary.onrender.com/api/author/getAll")
      .then((res) => setAuthors(res.data.authorsList))
      .catch(() => toast.error("Error fetching authors"));
  };

  const getAllGenres = () => {
    axios
      .get("https://libreary.onrender.com/api/genre/getAll")
      .then((res) => {
        setGenres(res.data.genresList);
        setIsModalLoading(false);
      })
      .catch(() => toast.error("Error fetching genres"));
  };

  useEffect(() => {
    if (isModalOpen) {
      getAllAuthors();
      getAllGenres();
    }
  }, [isModalOpen]);

  const isIssued = book.isAvailable === false;

  return (
    <Modal open={isModalOpen} onClose={handleCloseModal}>
      <Box sx={style}>
        <Container>
          <Typography variant="h4" textAlign="center" pb={2}>
            {isUpdateForm ? "Update Book" : "Add Book"}
          </Typography>

          {isModalLoading ? (
            <Grid p={4} textAlign="center">
              <CircularProgress />
            </Grid>
          ) : (
            <Stack spacing={3} py={2} px={3} maxHeight="70vh" overflow="auto">
              {/* BOOK NAME */}
              <TextField
                label="Book Name"
                value={book.name || ""}
                required
                onChange={(e) =>
                  setBook({ ...book, name: e.target.value })
                }
              />

              {/* ISBN */}
              <TextField
                label="ISBN"
                value={book.isbn || ""}
                required
                onChange={(e) =>
                  setBook({ ...book, isbn: e.target.value })
                }
              />

              {/* AUTHOR */}
              <FormControl fullWidth>
                <InputLabel>Author</InputLabel>
                <Select
                  value={book.authorId || ""}
                  label="Author"
                  onChange={(e) =>
                    setBook({ ...book, authorId: e.target.value })
                  }
                >
                  {authors.map((author) => (
                    <MenuItem key={author._id} value={author._id}>
                      {author.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* GENRE */}
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={book.genreId || ""}
                  label="Genre"
                  onChange={(e) =>
                    setBook({ ...book, genreId: e.target.value })
                  }
                >
                  {genres.map((genre) => (
                    <MenuItem key={genre._id} value={genre._id}>
                      {genre.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* AVAILABILITY */}
              <FormControl>
                <FormLabel>Availability</FormLabel>
                <RadioGroup
                  row
                  value={String(book.isAvailable)}
                  onChange={(e) =>
                    setBook({
                      ...book,
                      isAvailable: e.target.value === "true",
                      issuedTo:
                        e.target.value === "true" ? "" : book.issuedTo,
                      issuedAt:
                        e.target.value === "true" ? null : book.issuedAt
                    })
                  }
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Available"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="Issued"
                  />
                </RadioGroup>
              </FormControl>

              {/* ISSUE DETAILS */}
              {isIssued && (
                <>
                  <TextField
                    label="Issued To"
                    value={book.issuedTo || ""}
                    required
                    onChange={(e) =>
                      setBook({ ...book, issuedTo: e.target.value })
                    }
                  />

                  <TextField
                    label="Issue Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={book.issuedAt || ""}
                    required
                    onChange={(e) =>
                      setBook({ ...book, issuedAt: e.target.value })
                    }
                  />
                </>
              )}

              {/* SUMMARY */}
              <TextField
                label="Summary"
                value={book.summary || ""}
                multiline
                rows={3}
                onChange={(e) =>
                  setBook({ ...book, summary: e.target.value })
                }
              />

              {/* ACTION BUTTONS */}
              <Box textAlign="center" pt={2}>
                <Button
                  size="large"
                  variant="contained"
                  onClick={isUpdateForm ? handleUpdateBook : handleAddBook}
                  startIcon={<Iconify icon="bi:check-lg" />}
                  sx={{ mr: 2 }}
                >
                  Submit
                </Button>

                <Button
                  size="large"
                  variant="outlined"
                  onClick={handleCloseModal}
                  startIcon={<Iconify icon="charm:cross" />}
                >
                  Cancel
                </Button>
              </Box>
            </Stack>
          )}
        </Container>
      </Box>
    </Modal>
  );
};

BookForm.propTypes = {
  isUpdateForm: PropTypes.bool,
  isModalOpen: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  book: PropTypes.object,
  setBook: PropTypes.func,
  handleAddBook: PropTypes.func,
  handleUpdateBook: PropTypes.func
};

export default BookForm;
