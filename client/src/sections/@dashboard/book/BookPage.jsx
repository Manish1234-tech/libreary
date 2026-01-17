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

  /* -------------------- STATES -------------------- */
  const [book, setBook] = useState({
    name: "",
    isbn: "",
    authorId: "",
    genreId: "",
    summary: "",
    isAvailable: true,
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

  /* -------------------- API CALLS -------------------- */
  const getAllBooks = async () => {
    try {
      const res = await axios.get(
        "https://libreary.onrender.com/api/book/getAll"
      );
      setBooks(res.data.booksList);
      setIsTableLoading(false);
    } catch {
      toast.error("Failed to fetch books");
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

  /* -------------------- HELPERS -------------------- */
  const getSelectedBookDetails = () => {
    const selectedBook = books.find((b) => b._id === selectedBookId);
    if (!selectedBook) return;

    setBook({
      name: selectedBook.name,
      isbn: selectedBook.isbn,
      authorId: selectedBook.author?._id,
      genreId: selectedBook.genre?._id,
      summary: selectedBook.summary,
      isAvailable: selectedBook.isAvailable,
      issuedTo: selectedBook.issuedTo || "",
      issuedAt: selectedBook.issuedAt || null,
    });
  };

  /* -------------------- HANDLERS -------------------- */
  const handleOpenMenu = (event) => setIsMenuOpen(event.currentTarget);
  const handleCloseMenu = () => setIsMenuOpen(null);

  const handleOpenModal = (update = false) => {
    setIsUpdateForm(update);
    setIsModalOpen(true);
    if (update) getSelectedBookDetails();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookId(null);
    setBook({
      name: "",
      isbn: "",
      authorId: "",
      genreId: "",
      summary: "",
      isAvailable: true,
      issuedTo: "",
      issuedAt: null,
    });
  };

  /* -------------------- EFFECT -------------------- */
  useEffect(() => {
    getAllBooks();
  }, []);

  /* -------------------- FILTER LOGIC -------------------- */
  const genres = ["ALL", ...new Set(books.map((b) => b.genre?.name))];

  const filteredBooks = books.filter((book) => {
    const search = filterText.toLowerCase();

    const matchesSearch =
      book.name.toLowerCase().includes(search) ||
      book.isbn.toLowerCase().includes(search) ||
      book.author?.name.toLowerCase().includes(search);

    const matchesGenre =
      selectedGenre === "ALL" || book.genre?.name === selectedGenre;

    const matchesAvailability =
      availability === "ALL" ||
      (availability === "AVAILABLE" && book.isAvailable) ||
      (availability === "ISSUED" && !book.isAvailable);

    return matchesSearch && matchesGenre && matchesAvailability;
  });

  /* -------------------- UI -------------------- */
  return (
    <>
      <Container>
        <Stack direction="row" justifyContent="space-between" mb={5} flexWrap="wrap">
          <Typography variant="h3">Books</Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search book / author / ISBN..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />

            <TextField
              select
              size="small"
              label="Category"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {genres.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Status"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              sx={{ minWidth: 150 }}
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
        ) : filteredBooks.length > 0 ? (
          <Grid container spacing={4}>
            {filteredBooks.map((book) => (
              <Grid key={book._id} item xs={12} sm={6} md={4}>
                <Card>
                  <Box sx={{ pt: "80%", position: "relative" }}>
                    <Label sx={{ position: "absolute", top: 16, left: 16 }}>
                      {book.genre?.name || "Unknown"}
                    </Label>

                    {user?.isAdmin && (
                      <IconButton
                        sx={{ position: "absolute", top: 8, right: 8 }}
                        onClick={(e) => {
                          setSelectedBookId(book._id);
                          handleOpenMenu(e);
                          handleOpenModal(true);
                        }}
                      >
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                    )}

                    <StyledBookImage src={book.photoUrl} alt={book.name} />
                  </Box>

                  <Stack spacing={1} sx={{ p: 2 }}>
                    <Typography variant="h5" textAlign="center" noWrap>
                      {book.name}
                    </Typography>
                    <Typography variant="subtitle1" textAlign="center" color="text.secondary">
                      {book.author?.name || "Unknown Author"}
                    </Typography>
                    <Label color={book.isAvailable ? "success" : "error"}>
                      {book.isAvailable ? "Available" : "Issued"}
                    </Label>
                    <Typography variant="subtitle2" textAlign="center">
                      ISBN: {book.isbn}
                    </Typography>
                    <Typography variant="body2">{book.summary}</Typography>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="warning">No books found</Alert>
        )}
      </Container>

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
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => {}}
      />
    </>
  );
};

export default BookPage;
