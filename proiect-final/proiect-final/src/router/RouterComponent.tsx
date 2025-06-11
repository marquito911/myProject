import React, { type JSX } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import AdminRoute from "./AdminRoutes";
import NavbarComponent from "../components/NavbarComponent/NavbarComponent";
import HomePageComponent from "../components/HomePageComponent/HomePageComponent";
import MyProfilePageComponent from "../components/MyProfilePageComponent.tsx/MyProfilePageComponent";
import RegisterPageComponent from "../components/RegisterPageComponent/RegisterPageComponent";
import LoginPageComponent from "../components/LoginPageComponent/LoginPageComponent";
import NotFoundPageComponent from "../components/NotFoundPageComponent/NotFoundPageComponent";
import AddFlatForm from "../components/AddFlatsComponent/AddFlatsComponent";
import MyFlatsComponent from "../components/MyFlatsComponent/MyFlatsComponent";
import MyFavoriteFlatsPage from "../components/MyFavoriteFlatsComponent/MyFavoriteFlatComponent";
import UsersPageComponent from "../components/UsersPageComponent/UsersPageComponent";
import UserDetailsPage from "../components/UsersPageComponent/UserDetailsPage";
import ChatPageComponent from "../components/UserMessageComponent/ChatPageComponent";
import MessageListComponent from "../components/UserMessageComponent/MessageListComponent";
import ChatListPageComponent from "../components/UserMessageComponent/ChatListPageComponent ";
import FooterComponent from "../components/FooterComponent/FooterComponent";

const RouterComponent: React.FC = (): JSX.Element => {
  const { user, isLoading, isAdmin } = useAuth();
  
  return (
    <Router>
      <div className={"appContainer"}> 
        <NavbarComponent user={user} />
        <div className="content"> 
          <Routes>
            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute user={user || undefined} isLoading={isLoading} />
              }
            >
              <Route path="/" element={<HomePageComponent />} />
              <Route path="addflat" element={<AddFlatForm />} />
              <Route
                path="/profile/:userId"
                element={<MyProfilePageComponent user={user} />}
              />
              <Route
                path="/chat/:flatId/:ownerId"
                element={<ChatPageComponent />}
              />
              <Route path="/chatlist" element={<ChatListPageComponent />} />
              <Route
                path="/messages"
                element={
                  <MessageListComponent
                    flatId="someFlatId"
                    receiverId="someReceiverId"
                  />
                }
              />
              <Route path="/myfavoriteflat" element={<MyFavoriteFlatsPage />} />
              <Route path="/myflat" element={<MyFlatsComponent />} />
              <Route path="/user/:userId" element={<UserDetailsPage />} />

              <Route element={<AdminRoute isAdmin={isAdmin} />}>
                <Route path="/users" element={<UsersPageComponent />} />
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
        </div>
        <FooterComponent />  
      </div>
    </Router>
  );
};

export default RouterComponent;
