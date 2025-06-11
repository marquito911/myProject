import React, {
  createContext,
  type JSX,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { FirebaseError } from "firebase/app";

import type { IAuthContext, IUser } from "../interfaces/AuthContext";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const firestoreUser: IUser = docSnap.data() as IUser;

       
          if (!firestoreUser.isActive) {
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
            setIsOwner(false);
            setIsLoading(false);
            return;
          }

          setUser(currentUser);
          setIsAdmin(firestoreUser.isAdmin);
          setIsOwner(firestoreUser.Owner);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      const userDocRef = doc(db, "users", userId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const firestoreUser: IUser = userSnap.data() as IUser;

        if (!firestoreUser.isActive) { 
          await signOut(auth);
          throw new Error("");
        }

        setUser(userCredential.user);
        setIsAdmin(firestoreUser.isAdmin);
      } else {
        throw new Error("");
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw error;
      } else {
        throw new Error((error as Error).message);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (error) { 
    }
  };

  return (
    <AuthContext.Provider value={{ login, user, isLoading, logout, isAdmin, isOwner }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Must be used inside an AuthProvider");
  }
  return context;
};
