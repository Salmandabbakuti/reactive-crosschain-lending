import { ConnectButton } from "thirdweb/react";
import { sepolia, polygon } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";
import { thirdwebClient } from "../utils";

const thirdwebWallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("com.trustwallet.app"),
  createWallet("walletConnect"),
  createWallet("org.uniswap")
];

export default function ConnectWalletButton() {
  return (
    <ConnectButton
      client={thirdwebClient}
      chain={sepolia} // default chain to connect
      chains={[sepolia, polygon]} // chains to connect
      wallets={thirdwebWallets}
      recommendedWallets={[
        thirdwebWallets[0],
        thirdwebWallets[1],
        thirdwebWallets[5]
      ]}
      autoConnect={true}
      connectModal={{
        size: "wide",
        title: "Connect",
        termsOfServiceUrl: "https://example.com/terms",
        privacyPolicyUrl: "https://example.com/privacy"
      }}
      connectButton={{
        label: "Connect Wallet",
        style: {
          borderRadius: "15px",
          backgroundColor: "#1890ff"
        }
      }}
      appMetadata={{
        name: "Reactive Dapp Template",
        description: "Reactive Dapp Template",
        url: "https://example.com",
        logoUrl: "https://example.com/logo.png"
      }}
      theme={"light"} // light | dark
    />
  );
}
