import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import "./App.css";
import AdminPage from "./pages/admin";
import Login from "./pages/login";


function PrivateRoute({ children }) {
  return localStorage.getItem("logined") === "true" ? (
    <>{children}</>
  ) : (
    <Navigate to="/signin" />
  );
}

function App() {
  return (
    <BrowserRouter>
      <div id="app">
        <Routes>
          <Route path="signin" element={<Login />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<meta httpEquiv="refresh" content="1; url=https://www.google.com/"/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


export default App;
