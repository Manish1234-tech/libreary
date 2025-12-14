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
  Typography,
  TextField
} from "@mui/material";
import { Alert } from "@mui/lab";
import { styled } from "@mui/material/styles";
import { useAuth } from "../../../hooks/useAuth";

import Label from "../../../components/label";
import BookDialog from "./BookDialog";
import BookForm from "./BookForm";
import Iconify from "../../../components/iconify";
import { apiUrl, methods, routes } from "../../../constants";

// ----------------------------------------------------------------------

const StyledBookImage = styled("img")({
  top: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute"
});

const BookPage = () => {
  const { user } = useAuth();

  // ----------------------------------------------------------------------
  // STATES

  const [book, setBook] = useState({
    id: "",
    name: "",
    isbn: "",
    summary: "",
    isAvailable: true,
    authorId: "",
    genreId: "",
    photoUrl: ""
  });

  const [books, setBooks] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateForm, setIsUpdateForm] = useState(false);

  // ----------------------------------------------------------------------
  // API CALLS

  const getAllBooks = () => {
    axios
      .get(apiUrl(routes.BOOK, methods.GET_ALL))
      .then((response) => {
        setBooks(response.data.booksList);
        setIsTableLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const addBook = () => {
    axios
      .post(apiUrl(routes.BOOK, methods.POST), book)
      .then(() => {
        toast.success("Book added");
        handleCloseModal();
        getAllBooks();
        clearForm();
      })
      .catch(() => toast.error("Something went wrong"));
  };

  const updateBook = () => {
    axios
      .put(apiUrl(routes.BOOK, methods.PUT, selectedBookId), book)
      .then(() => {
        toast.success("Book updated");
        handleCloseModal();
        handleCloseMenu();
        getAllBooks();
        clearForm();
      })
      .catch(() => toast.error("Something went wrong"));
  };

  const deleteBook = (bookId) => {
    axios
      .delete(apiUrl(routes.BOOK, methods.DELETE, bookId))
      .then(() => {
        toast.success("Book deleted");
        handleCloseDialog();
        handleCloseMenu();
        getAllBooks();
      })
      .catch(() => toast.error("Something went wrong"));
  };

  // ----------------------------------------------------------------------

  const getSelectedBookDetails = () => {
    const selectedBook = books.find((b) => b._id === selectedBookId);
    setBook(selectedBook);
  };

  const clearForm = () => {
    setBook({
      id: "",
      name: "",
      isbn: "",
      summary: "",
      isAvailable: true,
      authorId: "",
      genreId: "",
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

  // ----------------------------------------------------------------------

  useEffect(() => {
    getAllBooks();
  }, []);

  // ----------------------------------------------------------------------
  // SEARCH FILTER

  const filteredBooks = books.filter((book) => {
    const search = filterText.toLowerCase();

    return (
      book.name.toLowerCase().includes(search) ||
      book.isbn.toLowerCase().includes(search) ||
      book.author?.name.toLowerCase().includes(search)
    );
  });

  // ----------------------------------------------------------------------

  return (
    <>
      <Helmet>
        <title>Books</title>
      </Helmet>

      <Container>
        {/* HEADER */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3">Books</Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search book / author / ISBN..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />

            {user.isAdmin && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => {
                  setIsUpdateForm(false);
                  handleOpenModal();
                }}
              >
                New Book
              </Button>
            )}
          </Stack>
        </Stack>

        {/* CONTENT */}
        {isTableLoading ? (
          <Grid textAlign="center" p={2}>
            <CircularProgress />
          </Grid>
        ) : filteredBooks.length > 0 ? (
          <Grid container spacing={4}>
            {filteredBooks.map((book) => (
              <Grid key={book._id} item xs={12} sm={6} md={4}>
                <Card>
                  <Box sx={{ pt: "80%", position: "relative" }}>
                    <Label
                      sx={{
                        zIndex: 9,
                        top: 16,
                        left: 16,
                        position: "absolute"
                      }}
                    >
                      {book.genre.name}
                    </Label>

                    {user.isAdmin && (
                      <IconButton
                        sx={{ position: "absolute", top: 8, right: 8, zIndex: 9 }}
                        onClick={(e) => {
                          setSelectedBookId(book._id);
                          handleOpenMenu(e);
                        }}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    )}

                    <StyledBookImage src={book.photoUrl} alt={book.name} />
                  </Box>

                  <Stack spacing={1} sx={{ p: 2 }}>
                    <Typography variant="h5" textAlign="center" noWrap>
                      {book.name}
                    </Typography>

                    <Typography variant="subtitle1" textAlign="center" sx={{ color: "#888" }} noWrap>
                      {book.author.name}
                    </Typography>

                    <Label color={book.isAvailable ? "success" : "error"}>
                      {book.isAvailable ? "Available" : "Not available"}
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

      {/* MENU */}
      <Popover open={Boolean(isMenuOpen)} anchorEl={isMenuOpen} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            setIsUpdateForm(true);
            getSelectedBookDetails();
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

      {/* MODAL + DIALOG */}
      <BookForm
        isUpdateForm={isUpdateForm}
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        id={selectedBookId}
        book={book}
        setBook={setBook}
        handleAddBook={addBook}
        handleUpdateBook={updateBook}
      />

      <BookDialog
        isDialogOpen={isDialogOpen}
        bookId={selectedBookId}
        handleDeleteBook={deleteBook}
        handleCloseDialog={handleCloseDialog}
      />
    </>
  );
};

export default BookPage;
