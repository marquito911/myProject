import React, { type JSX } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import RouterComponent from "./router/RouterComponent";



const App: React.FC = (): JSX.Element => {
  return (
    <AuthProvider>
      <RouterComponent />
    </AuthProvider>
  );
};

export default App;
