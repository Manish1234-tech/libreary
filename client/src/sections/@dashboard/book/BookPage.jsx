import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Alert } from "@mui/lab";
import { styled } from "@mui/material/styles";

import { useAuth } from "../../../hooks/useAuth";
import Iconify from "../../../components/iconify";
import Label from "../../../components/label";
import BookDialog from "./BookDialog";
import BookForm from "./BookForm";

const StyledBookImage = styled("img")({
  top: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
});

const BookPage = () => {
  const { user } = useAuth();

  const [book, setBook] = useState({
    name: "",
    isbn: "",
    summary: "",
    isAvailable: true,
    authorId: "",
    genreId: "",
    photoUrl: "",
    issuedTo: "",
    issuedAt: null,
  });

  const [books, setBooks] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [availability, setAvailability] = useState("ALL");
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateForm, setIsUpdateForm] = useState(false);

  // ---------------- API ----------------
  const getAllBooks = async () => {
    try {
      const res = await axios.get(
        "https://libreary.onrender.com/api/book/getAll"
      );
      setBooks(res.data.booksList);
    } catch {
      toast.error("Failed to fetch books");
    } finally {
      setIsTableLoading(false);
    }
  };

  const addBook = async () => {
    try {
      await axios.post(
        "https://libreary.onrender.com/api/book/add",
        book
      );
      toast.success("Book added successfully");
      handleCloseModal();
      getAllBooks();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const updateBook = async () => {
    try {
      await axios.put(
        `https://libreary.onrender.com/api/book/update/${selectedBookId}`,
        book
      );
      toast.success("Book updated successfully");
      handleCloseModal();
      getAllBooks();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const deleteBook = async (id) => {
    try {
      await axios.delete(
        `https://libreary.onrender.com/api/book/delete/${id}`
      );
      toast.success("Book deleted");
      handleCloseDialog();
      getAllBooks();
    } catch {
      toast.error("Something went wrong");
    }
  };

  // ---------------- HELPERS ----------------
  const getSelectedBookDetails = () => {
    const selected = books.find((b) => b._id === selectedBookId);
    if (selected) setBook(selected);
  };

  const handleOpenMenu = (e) => setIsMenuOpen(e.currentTarget);
  const handleCloseMenu = () => setIsMenuOpen(null);
  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleOpenModal = (update = false) => {
    setIsUpdateForm(update);
    if (update) getSelectedBookDetails();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookId(null);
  };

  useEffect(() => {
    getAllBooks();
  }, []);

  // ---------------- FILTER ----------------
  const genres = ["ALL", ...new Set(books.map((b) => b.genre?.name))];

  const filteredBooks = books.filter((b) => {
    const search = filterText.toLowerCase();

    const matchesSearch =
      b.name.toLowerCase().includes(search) ||
      b.isbn.toLowerCase().includes(search) ||
      b.author?.name.toLowerCase().includes(search);

    const matchesGenre =
      selectedGenre === "ALL" || b.genre?.name === selectedGenre;

    const matchesAvailability =
      availability === "ALL" ||
      (availability === "AVAILABLE" && b.isAvailable) ||
      (availability === "ISSUED" && !b.isAvailable);

    return matchesSearch && matchesGenre && matchesAvailability;
  });

  // ---------------- UI ----------------
  return (
    <>
      <Helmet>
        <title>Books</title>
      </Helmet>

      <Container>
        <Stack direction="row" justifyContent="space-between" mb={5} flexWrap="wrap">
          <Typography variant="h3">Books</Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Search"
              size="small"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />

            <TextField
              select
              size="small"
              label="Genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {genres.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="AVAILABLE">Available</MenuItem>
              <MenuItem value="ISSUED">Issued</MenuItem>
            </TextField>

            {user?.isAdmin && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => handleOpenModal(false)}
              >
                New Book
              </Button>
            )}
          </Stack>
        </Stack>

        {isTableLoading ? (
          <Grid textAlign="center">
            <CircularProgress />
          </Grid>
        ) : filteredBooks.length ? (
          <Grid container spacing={4}>
            {filteredBooks.map((b) => (
              <Grid key={b._id} item xs={12} sm={6} md={4}>
                <Card>
                  <Box sx={{ pt: "80%", position: "relative" }}>
                    <Label sx={{ position: "absolute", top: 16, left: 16 }}>
                      {b.genre?.name || "Unknown"}
                    </Label>
                    {user?.isAdmin && (
                      <IconButton
                        sx={{ position: "absolute", top: 8, right: 8 }}
                        onClick={(e) => {
                          setSelectedBookId(b._id);
                          handleOpenMenu(e);
                        }}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    )}
                    <StyledBookImage src={b.photoUrl} alt={b.name} />
                  </Box>
                  <Stack spacing={1} sx={{ p: 2 }}>
                    <Typography variant="h5" textAlign="center" noWrap>
                      {b.name}
                    </Typography>
                    <Typography variant="subtitle2" textAlign="center">
                      ISBN: {b.isbn}
                    </Typography>
                    <Label color={b.isAvailable ? "success" : "error"}>
                      {b.isAvailable ? "Available" : "Issued"}
                    </Label>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="warning">No books found</Alert>
        )}
      </Container>

      <Popover open={Boolean(isMenuOpen)} anchorEl={isMenuOpen} onClose={handleCloseMenu}>
        <MenuItem onClick={() => handleOpenModal(true)}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem sx={{ color: "error.main" }} onClick={handleOpenDialog}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      <BookForm
        isUpdateForm={isUpdateForm}
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        book={book}
        setBook={setBook}
        handleAddBook={addBook}
        handleUpdateBook={updateBook}
      />

      <BookDialog
        isDialogOpen={isDialogOpen}
        handleDeleteBook={() => deleteBook(selectedBookId)}
        handleCloseDialog={handleCloseDialog}
      />
    </>
  );
};

export default BookPage;
