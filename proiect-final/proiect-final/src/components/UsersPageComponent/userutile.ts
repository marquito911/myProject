import type { NavigateFunction } from "react-router-dom";

export const createNavigateToUserProfile = (navigate: NavigateFunction) => {
  return (userId: string) => {
    if (userId) {
      navigate(`/user/${userId}`);
    }
  };
};
