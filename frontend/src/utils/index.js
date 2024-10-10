import { createThirdwebClient, getContract } from "thirdweb";
import { polygon, sepolia } from "thirdweb/chains";
import { LENDING_CONTRACT_ADDRESS, COLLATERAL_CONTRACT_ADDRESS } from "./constants";

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

export const thirdwebClient = createThirdwebClient({ clientId });

export const lendingContract = getContract({
  chain: polygon,
  client: thirdwebClient,
  address: LENDING_CONTRACT_ADDRESS
});

export const collateralContract = getContract({
  chain: sepolia,
  client: thirdwebClient,
  address: COLLATERAL_CONTRACT_ADDRESS
});