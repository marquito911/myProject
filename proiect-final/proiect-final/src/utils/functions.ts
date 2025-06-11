import { collection, collectionGroup, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { IUser } from "../interfaces/AuthContext";
import type { IConversation, IMessage } from "../interfaces/IMessage";

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

export const getMessagesForUser = async (userId: string): Promise<IMessage[]> => {
  const messagesQuery = query(
    collectionGroup(db, "messages"),
    where("receiverId", "==", userId),
    orderBy("timestamp", "desc")
  );

  const snapshot = await getDocs(messagesQuery);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<IMessage, "id">),
  }));
};

export const getConversationsForUser = async (userId: string): Promise<IConversation[]> => {
  const conversationsQuery = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTimestamp", "desc")
  );

  const snapshot = await getDocs(conversationsQuery);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<IConversation, "id">),
  }));
};

export const getUnreadMessagesForUser = async (userId: string): Promise<IMessage[]> => {
  const unreadMessages: IMessage[] = [];

  const unreadQuery = query(
    collectionGroup(db, "messages"),
    where("receiverId", "==", userId),
    where("read", "==", false),
    orderBy("timestamp", "desc")
  );

  const snapshot = await getDocs(unreadQuery);

  snapshot.forEach(doc => {
    unreadMessages.push({
      id: doc.id,
      ...(doc.data() as IMessage),
    });
  });

  return unreadMessages;
};

