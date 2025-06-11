import React, { JSX } from "react";

import RouterComponent from "./router/RouterComponent";
import { AuthProvider } from "./contexts/AuthContext";

const App: React.FC = (): JSX.Element => {
  return (
    <AuthProvider>
      <RouterComponent />
    </AuthProvider>
  );
};

export default App;
