import React, { useEffect, useState, type JSX } from "react";
import {
  db,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "../../firebase";
import { CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import type { IUser } from "../../interfaces/AuthContext";
import styles from "./UserDetailsPage.module.css";

const UserDetailsPage: React.FC = (): JSX.Element => {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState<IUser | null>(null);
  const [postsCount, setPostsCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as IUser;
          setUserDetails(userData);

          const flatsRef = collection(db, "flats");
          const q = query(flatsRef, where("userId", "==", userId));
          const querySnapshot = await getDocs(q);
          setPostsCount(querySnapshot.size);
        } else {
          setError("User does not exist.");
        }
      } catch (error: any) {
        setError(`Error getting data: ${error.message}`);
      }
    };

    fetchUserData();
  }, [userId]);

  if (error) return <div>{error}</div>;
  if (!userDetails) return <CircularProgress />;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.card}>
        <div className={styles.cardImage}>
          <img
            src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
            alt="profile"
            className={styles.profileImage}
          />
        </div>
        <div className={styles.cardInfo}>
          <h1>
            {userDetails.firstname} {userDetails.lastname}
          </h1>
          <p>
            Email: {userDetails.email}
          </p>
          <p>
            Age: {userDetails.age || "N/A"}
          </p>
          <p>
            Posted flats: {postsCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
