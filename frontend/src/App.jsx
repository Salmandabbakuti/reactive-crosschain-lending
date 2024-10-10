import { useState } from "react";
import {
  useActiveAccount,
  useActiveWalletChain,
  useWalletBalance,
  useSendAndConfirmTransaction
} from "thirdweb/react";
import {
  Card,
  Select,
  Input,
  Button,
  Typography,
  Divider,
  Space,
  message
} from "antd";
import { SwapOutlined, SettingOutlined } from "@ant-design/icons";
import { sepolia, polygon } from "thirdweb/chains";
import { prepareContractCall } from "thirdweb";
import { toWei } from "thirdweb/utils";
import { thirdwebClient, contract } from "./utils";
import {
  POLYGON_XT_CONTRACT_ADDRESS,
  SEPOLIA_XT_CONTRACT_ADDRESS
} from "./utils/constants";

const { Option } = Select;
const { Text } = Typography;

export default function App() {
  const [bridgeAmountInput, setBridgeAmountInput] = useState(null);
  const [fromToken, setFromToken] = useState("xt-p");
  const [toToken, setToToken] = useState("xt-s");
  const [log, setLog] = useState({
    message: "",
    type: ""
  });

  const accountObj = useActiveAccount() || {};
  const account = accountObj?.address?.toLowerCase();
  const activeChain = useActiveWalletChain() || {};
  const {
    mutate: sendAndConfirmBridgeRequestTx,
    data: bridgeRequestTxReceipt,
    error: bridgeRequestTxError,
    failureReason: bridgeRequestTxFailureReason,
    isPending: isBridgeRequestPending,
    isError: isBridgeRequestError,
    isSuccess: isBridgeRequestSuccess
  } = useSendAndConfirmTransaction();

  const {
    mutate: sendAndConfirmMintTx,
    data: mintTransactionReceipt,
    error: mintTxError,
    failureReason: mintTxFailureReason,
    isPending: isMintPending,
    isError: isMintError
  } = useSendAndConfirmTransaction();

  console.log("bridge tx->", {
    bridgeRequestTxReceipt,
    bridgeRequestTxError,
    bridgeRequestTxFailureReason,
    isBridgeRequestPending,
    isBridgeRequestError,
    isBridgeRequestSuccess
  });

  const {
    data: sepoliaXT,
    isLoading: isSepoliaXTLoading,
    isError: isSepoliaXTError
  } = useWalletBalance({
    chain: sepolia,
    address: account,
    client: thirdwebClient,
    tokenAddress: SEPOLIA_XT_CONTRACT_ADDRESS
  });
  console.log(
    "Sepolia XT balance",
    sepoliaXT,
    isSepoliaXTLoading,
    isSepoliaXTError
  );

  const {
    data: polygonXT,
    isLoading: isPolygonXTLoading,
    isError: isPolygonXTError
  } = useWalletBalance({
    chain: polygon,
    address: account,
    client: thirdwebClient,
    tokenAddress: POLYGON_XT_CONTRACT_ADDRESS
  });
  console.log(
    "Polygon XT balance",
    polygonXT,
    isPolygonXTLoading,
    isPolygonXTError
  );

  const handleBridgeRequest = () => {
    console.log("Bridge Requested");
    setLog({ message: "", type: "" });
    if (!bridgeAmountInput) {
      return setLog({
        message: "Please enter an amount to bridge",
        type: "warning"
      });
    }
    if (!account) {
      return setLog({
        message: "Please connect your wallet",
        type: "warning"
      });
    }
    if (activeChain?.id !== 137) {
      return setLog({
        message: "Please connect to Polygon Network",
        type: "warning"
      });
    }
    const bridgeAmountInWei = toWei(bridgeAmountInput);
    if (bridgeAmountInWei > polygonXT?.value)
      return setLog({
        message: "Insufficient Balance",
        type: "warning"
      });
    try {
      const tx = prepareContractCall({
        contract,
        method: "function bridgeRequest(uint256 _amount)",
        params: [bridgeAmountInWei]
      });
      sendAndConfirmBridgeRequestTx(tx);
    } catch (error) {
      console.error("Bridge Request Error", error);
      setLog({ message: "Bridge Request Failed", type: "danger" });
    }
  };

  const handleMint = () => {
    console.log("Mint Requested");
    setLog({ message: "", type: "" });
    if (!account) {
      return setLog({
        message: "Please connect your wallet",
        type: "warning"
      });
    }
    if (activeChain?.id !== 137) {
      return setLog({
        message: "Please connect to Polygon Network",
        type: "warning"
      });
    }
    const tx = prepareContractCall({
      contract,
      method: "function mint(address _receiver, uint256 _amount)",
      params: [account, toWei("50")]
    });
    sendAndConfirmMintTx(tx);
  };

  return (
    <Card
      title="Bridge"
      extra={
        <Space>
          {
            // if bridge amount is greater than account balance, show mint button
            toWei(bridgeAmountInput || "0") > polygonXT?.value && (
              <Text type="secondary">
                Not enough XT on Polygon to bridge?{" "}
                <Button
                  title="Mints 50 XT on Polygon for testing"
                  type="link"
                  onClick={handleMint}
                  loading={isMintPending}
                >
                  Mint
                </Button>
              </Text>
            )
          }
          <SettingOutlined />
        </Space>
      }
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "20px",
        borderRadius: "20px"
      }}
      actions={[
        <Button
          size="large"
          type="primary"
          key="bridge-btn"
          loading={isBridgeRequestPending}
          disabled={isBridgeRequestPending}
          onClick={handleBridgeRequest}
          block
        >
          Bridge
        </Button>
      ]}
    >
      {/* From Section */}
      <div>
        <Text type="secondary">Send</Text>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Input
            value={bridgeAmountInput}
            type="number"
            onChange={(e) => setBridgeAmountInput(e.target.value)}
            placeholder="0.00"
            variant="borderless"
            style={{ fontSize: "28px", fontWeight: "bold" }}
          />
          <Select
            defaultValue="xt-p"
            value={fromToken}
            style={{ maxWidth: 300 }}
            onChange={setFromToken}
          >
            <Option value="xt-p">
              <img src="./xt-logo.png" alt="xt" width="15" /> XT on{" "}
              <img src="./poly-logo.svg" alt="polygon" width="15" /> Polygon
            </Option>
            <Option value="xt-s" disabled>
              <img src="./xt-logo.png" alt="xt" width="15" /> XT on{" "}
              <img src="./eth-logo.svg" alt="sepolia" width="10" /> Sepolia
            </Option>
          </Select>
        </div>
        <Text type="secondary">XT on Polygon</Text>
        {/* Dummy exchange rate for ETH */}
        <Space
          style={{
            float: "right",
            marginTop: "10px"
          }}
        >
          <Text type="secondary">Balance: {polygonXT?.displayValue || 0}</Text>
          <Button
            type="link"
            onClick={() => {
              setBridgeAmountInput(polygonXT?.displayValue);
            }}
          >
            Max
          </Button>
        </Space>
      </div>

      <Divider>
        <Button
          icon={
            <SwapOutlined
              style={{
                fontSize: "20px",
                transform: "rotate(90deg) scaleY(-1)"
              }}
            />
          }
          shape="circle"
          onClick={() => message.info("Two-way bridging is coming soon!")}
        />
      </Divider>

      {/* To Section */}
      <div>
        <Text type="secondary">Receive</Text>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Input
            readOnly
            value={bridgeAmountInput}
            placeholder="0.00"
            variant="borderless"
            style={{ fontSize: "28px", fontWeight: "bold" }}
          />
          <Select
            defaultValue="xt-s"
            value={toToken}
            style={{ maxWidth: 300 }}
            onChange={setToToken}
          >
            <Option value="xt-s">
              <img src="./xt-logo.png" alt="xt" width="15" /> XT on{" "}
              <img src="./eth-logo.svg" alt="sepolia" width="10" /> Sepolia
            </Option>
            <Option value="xt-p" disabled>
              <img src="./xt-logo.png" alt="xt" width="15" /> XT on{" "}
              <img src="./poly-logo.svg" alt="polygon" width="15" /> Polygon
            </Option>
          </Select>
        </div>
        <Text
          type="secondary"
          style={{
            float: "right"
          }}
        >
          Balance: {sepoliaXT?.displayValue || 0}
        </Text>
      </div>
      <Text type="secondary">XT on Sepolia</Text>

      {/* Log Messages */}
      <Divider />
      <div style={{ textAlign: "center", color: "red", marginTop: "20px" }}>
        <Space direction="vertical">
          {/* General Check Logs */}
          {log?.message && <Text type={log?.type}>{log.message}</Text>}
          {/* Mint Logs */}
          {isMintPending && (
            <Text type="secondary">Minting in progress...</Text>
          )}
          {isMintError && (
            <Text type="danger">
              Minting failed! {mintTxError?.message || mintTxFailureReason}
            </Text>
          )}
          {mintTransactionReceipt &&
            mintTransactionReceipt?.transactionHash && (
              <Text type="success">Minted 50 XT on Polygon successfully!</Text>
            )}
          {/* Bridge Logs */}
          {isBridgeRequestPending && (
            <Text type="secondary">Bridge Transaction in progress...</Text>
          )}
          {isBridgeRequestSuccess && (
            <Text type="success">Transaction successful!</Text>
          )}
          {isBridgeRequestError && (
            <Text type="danger">
              Transaction failed! {bridgeRequestTxError?.message}
            </Text>
          )}
          {bridgeRequestTxReceipt?.transactionHash && (
            <Space direction="vertical">
              <Text type="primary">
                Note: It may take a few minutes for the balances to reflect on
                the destination chain.
              </Text>
              <a
                href={`https://polygonscan.com/tx/${bridgeRequestTxReceipt?.transactionHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {" "}
                View Source Transaction
              </a>
              <a
                href={
                  "https://kopli.reactscan.net/rvms/0xc7203561EF179333005a9b81215092413aB86aE9"
                }
                target="_blank"
                rel="noreferrer"
              >
                {" "}
                View Reactive Transaction
              </a>
              <a
                href={`https://sepolia.etherscan.io/token/${SEPOLIA_XT_CONTRACT_ADDRESS}?a=${account}`}
                target="_blank"
                rel="noreferrer"
              >
                {" "}
                View Destination Balance
              </a>
            </Space>
          )}
        </Space>
      </div>
    </Card>
  );
}
