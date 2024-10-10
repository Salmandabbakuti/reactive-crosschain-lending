import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SiteLayout from "./components/SiteLayout.jsx";
import Web3Provider from "./components/Web3Provider.jsx";
import App from "./App.jsx";

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
