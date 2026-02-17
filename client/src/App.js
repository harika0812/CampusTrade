import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";
import MyListings from "./pages/MyListings";
import CreateListing from "./pages/CreateListing";
import Chat from "./pages/Chat";
function App() {
  return (
    <BrowserRouter>
      <Navbar /> {/* ✅ ONE GLOBAL NAVBAR */}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
