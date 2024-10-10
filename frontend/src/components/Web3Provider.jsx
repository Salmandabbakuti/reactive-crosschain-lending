import { useState, useEffect } from "react";
import { ThirdwebProvider } from "thirdweb/react";

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return <ThirdwebProvider>{mounted && children}</ThirdwebProvider>;
}
