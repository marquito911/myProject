import React, { JSX } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePageComponent from "../components/HomePageComponent/HomePageComponent";
import NotFoundPageComponent from "../components/NotFoundPageComponent/NotFoundPageComponent";
import RegisterPageComponent from "../components/RegisterPageComponent/RegisterPageComponent";
import LoginPageComponent from "../components/LoginPageComponent/LoginPageComponent";
import NavbarComponent from "../components/NavbarComponent/NavbarComponent";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import MyProfilePageComponent from "../components/MyProfilePageComponent.tsx/MyProfilePageComponent";
import UsersPageComponent from "../components/UsersPageComponent/UsersPageComponent";
import AddShift from "../components/AddShiftComponents/AddShiftcomponents";
import MyShiftsPage from "../components/MyShiftComponent/MyShiftComponent";
import AdminRoute from "./AdminRoutes";
import WorkersTable from "../components/UsersPageComponent/UsersTableComponent/WorkersTable";

const RouterComponent: React.FC = (): JSX.Element => {
  const { user, isLoading, isAdmin } = useAuth();
  return (
    <Router>
      <NavbarComponent user={user} />
      <Routes>
        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute user={user || undefined} isLoading={isLoading} />
          }
        >

          <Route path="/" element={<HomePageComponent />} />
          <Route
            path="/profile/:userId"
            element={<MyProfilePageComponent user={user} />}
          />
          <Route path="/addshift" element={<AddShift />} />
          <Route path="/myshift" element={<MyShiftsPage />} />
          <Route element={<AdminRoute isAdmin={isAdmin} />}>
            <Route path="/users" element={<UsersPageComponent />} />
            <Route path="/workers" element={<WorkersTable shifts={[]}/>}/>
            
          </Route>
        </Route>
        {/* Public routes */}
        <Route
          element={<PublicRoute user={user || null} isLoading={isLoading} />}
        >
          <Route path="/register" element={<RegisterPageComponent />} />
          <Route path="/login" element={<LoginPageComponent />} />
        </Route>
        {/* 404 Page Not Found */}
        <Route path="*" element={<NotFoundPageComponent />} />
      </Routes>
    </Router>
  );
};

export default RouterComponent;
