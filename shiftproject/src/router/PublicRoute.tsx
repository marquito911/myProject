import { CircularProgress } from "@mui/material";
import { User } from "firebase/auth";
import React, { JSX } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface IPublicRouteProps {
  user: User | null;
  isLoading: boolean;
}

const PublicRoute: React.FC<IPublicRouteProps> = ({
  user,
  isLoading,
}): JSX.Element => {
  if (isLoading) {
    return <CircularProgress />;
  }

  return !user ? <Outlet /> : <Navigate to="/" />;
};

export default PublicRoute;
