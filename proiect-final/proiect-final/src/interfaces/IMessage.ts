export interface IMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any;
  read?: boolean;
}

export interface IConversation {
   id: string;
  participants: string[];
  flatId: string;
  lastMessage: string;
  lastMessageTimestamp: any;
}

export interface IDisplayConversation {
  id: string;
  flatId: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  otherUserName: string;
  otherUserId: string;
}