import axios from "axios";

const api = axios.create({
  baseURL: 
    process.env.NODE_ENV === "production"
    ? "https://scango.giize.com/api"
    : "http://127.0.0.1:8000/api",
});

export default api;
