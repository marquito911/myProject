import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { useNavigate, useParams } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar'; // import Snackbar din MUI
import styles from './styles/ChatPageComponent.module.scss';

interface IMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any; 
}

const ChatPageComponent: React.FC = () => {
  const { flatId, ownerId } = useParams<{ flatId: string; ownerId: string }>();
  const { user } = useAuth();
  const [flatInfo, setFlatInfo] = useState<{ city?: string; streetName?: string; streetNumber?: number }>({});
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (ownerId === user?.uid) {
      setShowSnackbar(true);
       setTimeout(() => {
        navigate("/"); 
      }, 2000);
    }
  }, [ownerId, user, navigate]);

  if (!flatId || !ownerId || !user) {
    return <p>Incomplete data for chat</p>;
  }

  if (ownerId === user.uid) {
     return (
      <>
        <Snackbar
          open={showSnackbar}
          message="You can't send a message to yourself."
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={() => setShowSnackbar(false)}
          autoHideDuration={2000}
        />
      </>
    );
  }
 
  const sortedIds = [user.uid, ownerId].sort();
  const conversationId = sortedIds.join("_");
 
  useEffect(() => {
    const fetchData = async () => {
      const userDoc = await getDoc(doc(db, "users", ownerId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setReceiverName(`${data?.firstname ?? ""} ${data?.lastname ?? ""}`.trim());
      }
      
      if (flatId) {
        const flatDoc = await getDoc(doc(db, "flats", flatId));
        if (flatDoc.exists()) {
          const data = flatDoc.data();
          setFlatInfo({
            city: data?.city,
            streetName: data?.streetName,
            streetNumber: data?.streetNumber,
          });
        }
      }
    };
    fetchData();
  }, [ownerId, flatId]);

  useEffect(() => {
    const q = query(
      collection(db, "messages", conversationId, "messages"),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<IMessage, "id">),
      }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      const conversationDocRef = doc(db, "messages", conversationId);
      const conversationDoc = await getDoc(conversationDocRef);

      if (!conversationDoc.exists()) {
        await setDoc(conversationDocRef, {
          createdAt: serverTimestamp(),
        });
      }

      await addDoc(collection(db, "messages", conversationId, "messages"), {
        senderId: user.uid,
        receiverId: ownerId,
        content: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false,
      });

      const convoDocRef = doc(db, "conversations", conversationId);
      const convoDoc = await getDoc(convoDocRef);
      const participants = [user.uid, ownerId];
      const now = serverTimestamp();

      if (convoDoc.exists()) {
        await updateDoc(convoDocRef, {
          lastMessageTimestamp: now,
          lastMessageContent: newMessage.trim(),
          participants,
          flatId,
        });
      } else {
        await setDoc(convoDocRef, {
          participants,
          lastMessageTimestamp: now,
          lastMessageContent: newMessage.trim(),
          flatId,
        });
      }

      setNewMessage("");
    } catch (err) {
// err 
    }
  };

  const goToUserProfile = () => {
    navigate(`/user/${ownerId}`);
  };

  return (
    <div className={styles.chatContainer}>
      <h2 onClick={goToUserProfile} title="View profile user">
        {receiverName || "User"}{" "}
        {flatInfo.city && (
          <span>
            - {flatInfo.city}, {flatInfo.streetName} {flatInfo.streetNumber}
          </span>
        )}
      </h2>

      <div className={styles.messageList}>
        {messages.length === 0 && <p>Write new message.</p>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${
              msg.senderId === user.uid ? styles.myMessage : styles.theirMessage
            }`}
          >
            <strong>{msg.senderId === user.uid ? "Me" : receiverName}</strong>: {msg.content}
          </div>
        ))}
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Write a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          className={styles.messageInput}
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          Trimite
        </button>
      </div>
    </div>
  );
};

export default ChatPageComponent;
