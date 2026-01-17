// constants.js
const backendApiUrl = "https://libreary.onrender.com/api";

export const routes = {
  AUTHOR: "author",
  AUTH: "auth",
  BOOK: "book",
  BORROWAL: "borrowal", 
  GENRE: "genre",
  USER: "user"
};

export const methods = {
  GET: "get",
  GET_ALL: "getAll",
  POST: "add",
  PUT: "update",
  DELETE: "delete",
  PAY_FINE_OFFLINE: "pay-fine"
};

export const apiUrl = (route, method, id = "") =>
  `${backendApiUrl}/${route}/${method}${id && `/${id}`}`;
