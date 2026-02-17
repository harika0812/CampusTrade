import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/global.css";

import { AuthProvider } from "./app/authContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(

   
      <AuthProvider>
        <App />
      </AuthProvider>
  

);
