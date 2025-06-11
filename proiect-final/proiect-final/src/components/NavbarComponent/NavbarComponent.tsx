import React, { useEffect, useState } from "react";
import { Button, Menu, MenuItem, CircularProgress, Divider, Badge } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MessageIcon from '@mui/icons-material/Message';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import logo from "./logo2.png";
import { useAuth } from "../../contexts/AuthContext";
import { getUnreadMessagesForUser, getUserFromFirestore } from "../../utils/functions";
import type { User } from "firebase/auth";
import type { IUser } from "../../interfaces/AuthContext";
import styles from "./NavbarComponent.module.scss";
import type { IMessage } from "../../interfaces/IMessage";

interface NavbarProps {
  user: User | null;
}

const NavbarComponent: React.FC<NavbarProps> = ({ user }) => {
  const [currentUserData, setCurrentUserData] = useState<IUser | undefined>();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState<IMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUserDataAndMessages() {
      if (!user) {
        setCurrentUserData(undefined);
        setUnreadMessages([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const userData = await getUserFromFirestore(user.uid);
        setCurrentUserData(userData || undefined);

        const messages = await getUnreadMessagesForUser(user.uid);
        setUnreadMessages(messages);

        setUnreadCount(messages.length);
      } catch {
        setUnreadMessages([]);
        setUnreadCount(0);
      }

      setIsLoading(false);
    }

    loadUserDataAndMessages();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setMenuAnchor(null);
    }
  }, [user]);

  const signOutUser = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      if (error instanceof FirebaseError) {
       }
    }
  };

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (!menuAnchor) {
      setMenuAnchor(event.currentTarget);
    }
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  if (isLoading) {
    return (
      <div className={styles.navbarContainer}>
        <CircularProgress color="inherit" />
      </div>
    );
  }

  return (
    <div className={styles.navbarContainer}>
      <div className={styles.logoWrapper}>
        <img
          src={logo}
          alt="Logo"
          className={styles.logo}
          onClick={() => navigate("/")}
        />
      </div>

      <div className={styles.buttonContainer}>
        {user && currentUserData ? (
          <>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              startIcon={<HomeIcon />}
            >
              Home
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/addflat")}
              startIcon={<AddCircleIcon />}
            >
              Add Flat
            </Button>

            <Button
              variant="contained"
              onClick={openMenu}
              startIcon={<AccountCircleIcon />}
            >
              <span className={styles.userName}>
                {currentUserData.firstname} {currentUserData.lastname}
              </span>
            </Button>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={closeMenu}
            ><div>
              <MenuItem onClick={() => { navigate("/myflat"); closeMenu(); }}>
                <ApartmentIcon /> My Flats
              </MenuItem>
              <MenuItem onClick={() => { navigate("/myfavoriteflat"); closeMenu(); }}>
                <FavoriteIcon /> My Favorite Flat
              </MenuItem>
              <MenuItem onClick={() => { navigate(`/profile/${user.uid}`); closeMenu(); }}>
                <AccountCircleIcon /> My Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate("/chatlist"); closeMenu(); }}>
                <Badge
                  color="error"
                  variant="dot"
                  invisible={unreadMessages.length === 0}
                  sx={{ mr: 1 }}
                >
                  <MessageIcon />
                </Badge>
                Messages
              </MenuItem>
              <Divider />
              {currentUserData.isAdmin && (
                <>
                  <MenuItem onClick={() => { navigate("/users"); closeMenu(); }}>
                    <PeopleIcon /> All Users
                  </MenuItem>
                  <Divider />
                </>
              )}
              <MenuItem onClick={() => { signOutUser(); closeMenu(); }}>
                <ExitToAppIcon /> Logout
              </MenuItem></div>
            </Menu>
          </>
        ) : (
          <> 
          </>
        )}
      </div>
    </div>
  );
};

export default NavbarComponent;
