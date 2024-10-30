import { createThirdwebClient, getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { CONTRACT_ADDRESS } from "./constants";

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

export const thirdwebClient = createThirdwebClient({ clientId });

export const contract = getContract({
  chain: sepolia,
  client: thirdwebClient,
  address: CONTRACT_ADDRESS
});