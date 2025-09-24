import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

// Configure Aptos wallets
const wallets = [new PetraWallet()];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
