import React, { type JSX } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface IProtectedRouteProps {
  isAdmin: boolean;
}

const AdminRoute: React.FC<IProtectedRouteProps> = ({
  isAdmin,
}): JSX.Element => { 
  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
