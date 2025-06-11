import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import type { IMessage } from "../../interfaces/IMessage";
import { useNavigate } from "react-router-dom";
import styles from './styles/MessageListComponent.module.scss'

interface MessageListProps {
  flatId: string;
  receiverId: string;
}

const MessageListComponent: React.FC<MessageListProps> = ({ flatId, receiverId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [receiverName, setReceiverName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const sortedIds = [user.uid, receiverId].sort();
    const conversationId = `${flatId}_${sortedIds.join("_")}`;

    const q = query(
      collection(db, "messages", conversationId, "messages"),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as IMessage & { id: string })
      );
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [flatId, receiverId, user]);

  useEffect(() => {
    const fetchReceiverName = async () => {
      const userDoc = await getDoc(doc(db, "users", receiverId));
      if (userDoc.exists()) {
        const data = userDoc.data();
setReceiverName(`${data?.firstname ?? ""} ${data?.lastname ?? ""}`.trim());
      }
    };

    fetchReceiverName();
  }, [receiverId]);

  const navigateToUserProfile = (userId: string) => {
navigate(`/user/${userId}`);
  };

return (
  <div className={styles.container}>
    {messages.map((msg) => (
      <div
        key={msg.id}
        className={`${styles.message} ${
          msg.senderId === user?.uid ? styles.me : styles.them
        }`}
      >
        <strong>
          {msg.senderId === user?.uid ? (
            "Eu"
          ) : (
            <span
              onClick={() => navigateToUserProfile(receiverId)}
              className={styles.clickText}
            >
              {receiverName || "User"}
            </span>
          )}
        </strong>
        : {msg.content}
      </div>
    ))}
  </div>
);

};

export default MessageListComponent;
