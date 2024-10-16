import { createThirdwebClient, getContract } from "thirdweb";
import { avalanche, sepolia } from "thirdweb/chains";
import { CROSSLOAN_CONTRACT_ADDRESS, COLLATERAL_MANAGER_CONTRACT_ADDRESS } from "./constants";

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

export const thirdwebClient = createThirdwebClient({ clientId });

export const crossLoanContract = getContract({
  chain: sepolia,
  client: thirdwebClient,
  address: CROSSLOAN_CONTRACT_ADDRESS
});

export const collateralManagerContract = getContract({
  chain: avalanche,
  client: thirdwebClient,
  address: COLLATERAL_MANAGER_CONTRACT_ADDRESS
});