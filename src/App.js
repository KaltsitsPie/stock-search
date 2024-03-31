import "./App.css";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  // Redirect,
} from "react-router-dom";
import MyNavbar from "./components/MyNavbar";
import Footer from "./components/Footer";
import Search from "./pages/Search";
import SearchDetail from "./pages/SearchDetails";
import Watchlist from "./pages/Watchlist";
import Portfolio from "./pages/Portfolio";

function App() {
  return (
    <BrowserRouter>
      <MyNavbar />
      <Routes>
        <Route path="/" element={<Navigate replace to="/search/home" />} />
        <Route path="/search" element={<Search />}>
          <Route path="home" element={<div></div>} />
          <Route path=":ticker" element={<SearchDetail />} />
        </Route>
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
      <Footer />
    </BrowserRouter>

    
  );
}

export default App;
