import React, { JSX, useEffect, useState } from "react";
import { IUser } from "../../interfaces/AuthContext";
import { getAllFirestoreUsers } from "../../utils/functions";
import UsersTableComponent from "./UsersTableComponent/UsersTableComponent";

const UsersPageComponent: React.FC = (): JSX.Element => {
  const [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = await getAllFirestoreUsers();
      if (fetchedUsers.length > 0) {
        setUsers(fetchedUsers);
      }
    };
    fetchUsers();
  }, []);

  return <UsersTableComponent
  users={users}
  updateUser={(updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  }}
/>
};

export default UsersPageComponent;
