const backendApiUrl = "https://libreary-gqj4.vercel.app/api";

const routes = {
  AUTHOR: "author",
  AUTH: "auth",
  BOOK: "book",
  BORROWAL: "borrowal",
  GENRE: "genre",
  USER: "user"
};

const methods = {
  GET: "get",
  GET_ALL: "getAll",
  POST: "add",
  PUT: "update",
  DELETE: "delete"
};

const apiUrl = (route, method, id = "") => `${backendApiUrl}/${route}/${method}${id && `/${id}`}`;

module.exports = { routes, methods, apiUrl };
