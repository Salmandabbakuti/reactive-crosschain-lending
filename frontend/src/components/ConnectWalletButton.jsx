import { ConnectButton } from "thirdweb/react";
import { sepolia, polygon } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";
import { thirdwebClient } from "../utils";
import {
  POLYGON_XT_CONTRACT_ADDRESS,
  SEPOLIA_XT_CONTRACT_ADDRESS
} from "../utils/constants";

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
      // chain={polygon} // default chain to connect
      chains={[polygon, sepolia]} // chains to connect
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
          borderRadius: "15px"
        }
      }}
      detailsButton={{
        displayBalanceToken: {
          [sepolia.id]: SEPOLIA_XT_CONTRACT_ADDRESS, // token address to display balance for
          [polygon.id]: POLYGON_XT_CONTRACT_ADDRESS // token address to display balance for
        }
      }}
      supportedTokens={{
        [polygon.id]: [
          {
            address: POLYGON_XT_CONTRACT_ADDRESS,
            name: "CrossToken",
            symbol: "XT",
            icon: "https://example.com/icon.png"
          }
        ],
        [sepolia.id]: [
          {
            address: SEPOLIA_XT_CONTRACT_ADDRESS,
            name: "CrossToken",
            symbol: "XT",
            icon: "https://example.com/icon.png"
          }
        ]
      }}
      appMetadata={{
        name: "Reactive Bridge",
        description: "Reactive Bridge",
        url: "https://example.com",
        logoUrl: "https://example.com/logo.png"
      }}
      theme={"light"} // light | dark
    />
  );
}
