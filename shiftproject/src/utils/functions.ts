import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { IUser } from "../interfaces/AuthContext";

export const getUserFromFirestore = async (
  userId: string
): Promise<IUser | undefined> => {
  const querySnapshot = await getDoc(doc(db, "users", userId));
  if (querySnapshot.exists()) {
    return querySnapshot.data() as IUser;
  }
  return undefined;
};

export const getAllFirestoreUsers = async () => {
  const users: IUser[] = [];
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => users.push(doc.data() as IUser));
  return users;
};
