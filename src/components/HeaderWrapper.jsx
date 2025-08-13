import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { Header } from "./Header";

const HeaderWrapper = () => {
  const { authenticate, handleDisconnect, address } = useContext(AuthContext);

  // Override handleConnect to trigger authentication or disconnection
  const handleConnectOverride = () => {
    if (address) {
      handleDisconnect();
    } else {
      authenticate();
    }
  };

  return <Header handleConnect={handleConnectOverride} />;
};

export default HeaderWrapper;
