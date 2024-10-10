import { createThirdwebClient, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { POLYGON_XT_CONTRACT_ADDRESS } from "./constants";

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

export const thirdwebClient = createThirdwebClient({ clientId });

export const contract = getContract({
  chain: polygon,
  client: thirdwebClient,
  address: POLYGON_XT_CONTRACT_ADDRESS
});