import { CircularProgress } from "@mui/material";
import type { User } from "firebase/auth";
import React, { type JSX } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface IProtectedRouteProps {
  user: User | undefined;
  isLoading: boolean;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
  user,
  isLoading,
}): JSX.Element => {
  if (isLoading) {
    return <CircularProgress />;
  }
  // return user  ? <Outlet /> : <Navigate to="/login" />;
  return isLoading ? (
    <CircularProgress />
  ) : user?.uid ? ( 
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
