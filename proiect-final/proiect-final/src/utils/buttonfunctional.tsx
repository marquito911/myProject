import React, { type JSX } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ContactButtonProps {
  flatId: string;
  ownerId: string;
  currentUserId?: string;
}

const ContactButton: React.FC<ContactButtonProps> = ({ flatId, ownerId, currentUserId }):JSX.Element => {
  const navigate = useNavigate();

  const ContactButtonFct = () => {
    if (!currentUserId) {
      alert("You must be logged in to contact the owner.");
      return;
    }
    if (!flatId || !ownerId) {
      alert("Invalid flat or owner information.");
      return;
    }
    navigate(`/chat/${flatId}/${ownerId}`);
  };

  return (
    <Button onClick={ContactButtonFct} color="primary" variant="contained">
      Contact
    </Button>
  );
};

export default ContactButton;
