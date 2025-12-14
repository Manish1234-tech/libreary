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
  TextField,
  Typography
} from "@mui/material";

import { useAuth } from "../../../hooks/useAuth";
import Iconify from "../../../components/iconify";
import Scrollbar from "../../../components/scrollbar";

import AuthorTableHead from "./AuthorListHead";
import AuthorForm from "./AuthorForm";
import AuthorDialog from "./AuthorDialog";
import { applySortFilter, getComparator } from "../../../utils/tableOperations";
import { apiUrl, methods, routes } from "../../../constants";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "photo", label: "Photo", alignRight: false },
  { id: "name", label: "Name", alignRight: false },
  { id: "description", label: "Description", alignRight: false },
  { id: "", label: "", alignRight: false }
];

// ----------------------------------------------------------------------

const AuthorPage = () => {
  const { user } = useAuth();

  // Table states
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterName, setFilterName] = useState("");

  // Data states
  const [author, setAuthor] = useState({
    id: "",
    name: "",
    description: "",
    photoUrl: ""
  });

  const [authors, setAuthors] = useState([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateForm, setIsUpdateForm] = useState(false);

  // ----------------------------------------------------------------------

  useEffect(() => {
    getAllAuthors();
  }, []);

  // ----------------------------------------------------------------------
  // API CALLS

  const getAllAuthors = () => {
    axios
      .get(apiUrl(routes.AUTHOR, methods.GET_ALL))
      .then((response) => {
        setAuthors(response.data.authorsList);
        setIsTableLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const addAuthor = () => {
    axios
      .post(apiUrl(routes.AUTHOR, methods.POST), author)
      .then(() => {
        toast.success("Author added");
        handleCloseModal();
        getAllAuthors();
        clearForm();
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  };

  const updateAuthor = () => {
    axios
      .put(apiUrl(routes.AUTHOR, methods.PUT, selectedAuthorId), author)
      .then(() => {
        toast.success("Author updated");
        handleCloseModal();
        handleCloseMenu();
        getAllAuthors();
        clearForm();
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  };

  const deleteAuthor = (authorId) => {
    axios
      .delete(apiUrl(routes.AUTHOR, methods.DELETE, authorId))
      .then(() => {
        toast.success("Author deleted");
        handleCloseDialog();
        handleCloseMenu();
        getAllAuthors();
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  };

  const getSelectedAuthorDetails = () => {
    const selectedAuthor = authors.find(
      (item) => item._id === selectedAuthorId
    );
    setAuthor(selectedAuthor);
  };

  const clearForm = () => {
    setAuthor({ id: "", name: "", description: "", photoUrl: "" });
  };

  // ----------------------------------------------------------------------
  // HANDLERS

  const handleOpenMenu = (event) => {
    setIsMenuOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(null);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // ----------------------------------------------------------------------
  // FILTER + SORT

  const filteredAuthors = applySortFilter(
    authors,
    getComparator(order, orderBy),
    filterName
  );

  // ----------------------------------------------------------------------

  return (
    <>
      <Helmet>
        <title>Library App | Authors</title>
      </Helmet>

      <Container>
        {/* HEADER */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
        >
          <Typography variant="h3">Authors</Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search author..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
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
                New Author
              </Button>
            )}
          </Stack>
        </Stack>

        {/* TABLE */}
        {isTableLoading ? (
          <Grid padding={2} textAlign="center">
            <CircularProgress />
          </Grid>
        ) : (
          <Card>
            <Scrollbar>
              {filteredAuthors.length > 0 ? (
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <AuthorTableHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={filteredAuthors.length}
                      onRequestSort={handleRequestSort}
                    />

                    <TableBody>
                      {filteredAuthors
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row) => {
                          const { _id, name, description, photoUrl } = row;

                          return (
                            <TableRow hover key={_id}>
                              <TableCell align="center">
                                <Avatar src={photoUrl} alt={name} />
                              </TableCell>

                              <TableCell>
                                <Typography variant="subtitle2" noWrap>
                                  {name}
                                </Typography>
                              </TableCell>

                              <TableCell>{description}</TableCell>

                              <TableCell align="right">
                                {user.isAdmin && (
                                  <IconButton
                                    onClick={(e) => {
                                      setSelectedAuthorId(_id);
                                      handleOpenMenu(e);
                                    }}
                                  >
                                    <Iconify icon="eva:more-vertical-fill" />
                                  </IconButton>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="warning">No authors found</Alert>
              )}
            </Scrollbar>

            {filteredAuthors.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredAuthors.length}
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
      <Popover
        open={Boolean(isMenuOpen)}
        anchorEl={isMenuOpen}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            setIsUpdateForm(true);
            getSelectedAuthorDetails();
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
      <AuthorForm
        isUpdateForm={isUpdateForm}
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        id={selectedAuthorId}
        author={author}
        setAuthor={setAuthor}
        handleAddAuthor={addAuthor}
        handleUpdateAuthor={updateAuthor}
      />

      <AuthorDialog
        isDialogOpen={isDialogOpen}
        authorId={selectedAuthorId}
        handleDeleteAuthor={deleteAuthor}
        handleCloseDialog={handleCloseDialog}
      />
    </>
  );
};

export default AuthorPage;
