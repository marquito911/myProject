import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getConversationsForUser } from "../../utils/functions";
import type { IConversation } from "../../interfaces/IMessage";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./styles/ChatListPageComponent.module.scss"

interface ConversationWithName extends IConversation {
  otherUserName: string;
}

const ChatListPageComponent: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithName[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversationsWithNames = async () => {
      if (!user) return;

      const rawConversations = await getConversationsForUser(user.uid);

      const enrichedConversations = await Promise.all(
        rawConversations.map(async (conv) => {
          const otherUserId = conv.participants.find((id) => id !== user.uid);
          let otherUserName = "Unknown user";

          if (otherUserId) {
            const userDoc = await getDoc(doc(db, "users", otherUserId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              otherUserName = `${userData.firstname ?? ""} ${userData.lastname ?? ""}`.trim();
            }
          }

          return { ...conv, otherUserName };
        })
      );

      setConversations(enrichedConversations);
    };

    fetchConversationsWithNames();
  }, [user]);

  if (!user) {
    return <p>You must be logged in to see your conversations.</p>;
  }

  

 return (
  <div className={styles.container}>
    <h1 className={styles.title}>Your Conversations</h1>
    {conversations.length === 0 ? (
      <p className={styles.noConversations}>No conversations found.</p>
    ) : (
      <ul className={styles.list}>
        {conversations.map((conv) => (
          <li key={conv.id} className={styles.listItem}>
            <button
              className={styles.button}
              onClick={() =>
                navigate(`/chat/${conv.flatId}/${conv.participants.find(id => id !== user.uid)}`)
              }
            >
              {conv.otherUserName}
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);
};

export default ChatListPageComponent;
