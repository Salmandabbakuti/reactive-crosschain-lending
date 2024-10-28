import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SiteLayout from "./components/SiteLayout";
import Web3Provider from "./components/Web3Provider";
import App from "./App";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Web3Provider>
      <SiteLayout>
        <App />
      </SiteLayout>
    </Web3Provider>
  </StrictMode>
);
