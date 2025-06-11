import React, { JSX, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { Button, Menu, MenuItem, CircularProgress, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

import styles from "./NavbarComponent.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { IUser } from "../../interfaces/AuthContext";
import { getUserFromFirestore } from "../../utils/functions";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logo from "./logo.png"
import { FirebaseError } from "firebase/app";

interface INavbarComponentProps {
  user: User | null;
}

const NavbarComponent: React.FC<INavbarComponentProps> = ({
  user,
}): JSX.Element => {
  const [firestoreUser, setFirestoreUser] = useState<IUser | undefined>(undefined);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      if(error instanceof FirebaseError) {
        throw new Error (error.code)
      }
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const fetchedUser = await getUserFromFirestore(user.uid);
        if (fetchedUser) {
          setFirestoreUser(fetchedUser);
        } else {
          setFirestoreUser(undefined);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [user]);

  if (loading) {
    return (
      <div className={styles["navbar-container"]}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={styles["navbar-container"]}>
      <img src={logo} alt="Logo" className={styles.logo}  onClick={() => navigate("/")}/> 
      
      <div className={styles["button-container"]}>
      
        {user ? (
          <>
            <Button variant="contained" onClick={() => navigate("/")}>
              HomePage
            </Button>
            <Button variant="contained" onClick={() => navigate("/addshift")}>
              Add Shift
            </Button>

            <Button variant="contained" onClick={handleClick} startIcon={<AccountCircleIcon />}>
              <span className="font-semibold">
                {firestoreUser?.firstname} {firestoreUser?.lastname}
              </span>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => navigate("/myshift")}>My Shift</MenuItem>
              <MenuItem onClick={() => navigate(`/profile/${user.uid}`)}>
                My Profile
              </MenuItem>
              <Divider />
              {firestoreUser?.isAdmin && user && (<>
          <MenuItem onClick={() => navigate("/users")}>
            All users
            
          </MenuItem>
          </>
        )}
        
       
          {firestoreUser?.isAdmin && user && (<>            
          <MenuItem onClick={() => navigate("/workers")}>
           Income Wave
           <Divider />
          </MenuItem>
          <Divider/>
          </>

        )}
        
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
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
