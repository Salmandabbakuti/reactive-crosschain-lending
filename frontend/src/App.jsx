import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Card,
  Typography,
  message,
  Statistic,
  Space,
  Row,
  Col,
  Divider,
  Tooltip,
  Popover
} from "antd";
import {
  ExportOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import {
  useReadContract,
  useActiveAccount,
  useSendAndConfirmTransaction,
  useWalletBalance,
  useActiveWalletChain
} from "thirdweb/react";
import { sepolia, avalanche } from "thirdweb/chains";
import { toEther, toWei } from "thirdweb/utils";
import { prepareContractCall } from "thirdweb";
import {
  crossLoanContract,
  collateralManagerContract,
  thirdwebClient
} from "./utils";
import {
  COLLATERAL_MANAGER_CONTRACT_ADDRESS,
  CROSSLOAN_CONTRACT_ADDRESS
} from "./utils/constants";

const { Text } = Typography;

export default function App() {
  const [repayAmountInput, setRepayAmountInput] = useState("");
  const [collateralAmountInput, setCollateralAmountInput] = useState("");

  const { address: account } = useActiveAccount() || {};
  const activeChain = useActiveWalletChain() || {};

  const { data: avalancheBalance, error: avalancheBalanceError } =
    useWalletBalance({
      chain: avalanche,
      address: account,
      client: thirdwebClient
    });

  const { data: sepoliaBalance, error: sepoliaBalanceError } = useWalletBalance(
    {
      chain: sepolia,
      address: account,
      client: thirdwebClient
    }
  );

  const { data: depositedCollateral, error: depositedCollateralError } =
    useReadContract({
      contract: collateralManagerContract,
      method: "function collateralAmountByAddr(address) view returns (uint256)",
      params: [account]
    });

  const { data: loanAmount, error: loanAmountError } = useReadContract({
    contract: crossLoanContract,
    method: "function loanAmountByAddr(address) view returns (uint256)",
    params: [account]
  });

  console.log("avalancheBalance", avalancheBalance);
  console.log("sepoliaBalance", sepoliaBalance);
  console.log("depositedCollateral", depositedCollateral);
  console.log("loanAmount", loanAmount);
  console.error("avalancheBalanceError", avalancheBalanceError);
  console.error("sepoliaBalanceError", sepoliaBalanceError);
  console.error("depositedCollateralError", depositedCollateralError);
  console.error("loanAmountError", loanAmountError);

  const {
    mutate: sendAndConfirmDepositCollateralTx,
    isError: isDepositCollateralTxError,
    data: depositCollateralTxReceipt,
    error: depositCollateralTxError,
    isPending: isDepositCollateralTxPending,
    isSuccess: isDepositCollateralTxSuccess
  } = useSendAndConfirmTransaction();

  const {
    mutate: sendAndConfirmRepayLoanTx,
    isError: isRepayLoanTxError,
    data: repayLoanTxReceipt,
    error: repayLoanTxError,
    isPending: isRepayLoanTxPending,
    isSuccess: isRepayLoanTxSuccess
  } = useSendAndConfirmTransaction();

  const handleDepositCollateral = () => {
    if (!collateralAmountInput)
      return message.error("Please enter a valid amount");
    if (!account) return message.error("Please connect your wallet first!");
    if (activeChain?.id !== avalanche.id)
      return message.error("Please switch to Avalanche network");
    const tx = prepareContractCall({
      contract: collateralManagerContract,
      method: "function depositCollateral(uint256 _amount)",
      params: [toWei(collateralAmountInput)],
      value: toWei(collateralAmountInput)
    });
    sendAndConfirmDepositCollateralTx(tx);
  };

  const handleRepayLoan = () => {
    if (!repayAmountInput) return message.error("Please enter a valid amount");
    if (!account) return message.error("Please connect your wallet first!");
    if (activeChain?.id !== sepolia.id)
      return message.error("Please switch to Sepolia network");
    const tx = prepareContractCall({
      contract: crossLoanContract,
      method: "function repayLoan(uint256 _amount)",
      params: [toWei(repayAmountInput)],
      value: toWei(repayAmountInput)
    });
    sendAndConfirmRepayLoanTx(tx);
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            style={{
              maxWidth: 600,
              margin: "0 auto",
              borderRadius: "20px"
            }}
            title={
              <Space>
                <Text>Collateral Manager (Avalanche)</Text>
                <a
                  href={`https://snowtrace.io/address/${COLLATERAL_MANAGER_CONTRACT_ADDRESS}`}
                  target="_blank"
                >
                  <ExportOutlined />
                </a>
              </Space>
            }
            bordered
            hoverable
            cover={
              <img
                src="./avax-logo.svg"
                alt="avax-logo"
                width={40}
                height={40}
                style={{ marginTop: "10px" }}
              />
            }
            extra={
              account && (
                <Tooltip title="Balance on Avalanche">
                  <Statistic
                    title="Balance"
                    value={avalancheBalance?.displayValue || ""}
                    suffix={avalancheBalance?.symbol || ""}
                    precision={6}
                    valueStyle={{ color: "#3f8600", fontSize: "16px" }}
                  />
                </Tooltip>
              )
            }
          >
            <Statistic
              style={{ textAlign: "center" }}
              title={
                <Text>
                  Deposited Collateral{" "}
                  <Popover content="Collateral is released as you repay the loan">
                    <QuestionCircleOutlined />
                  </Popover>
                </Text>
              }
              value={toEther(depositedCollateral || 0n)}
              suffix="AVAX"
            />
            <Divider />
            <label>Deposit Collateral: </label>
            <br />
            <Text type="secondary">
              * For demo purposes, the collateral amount is limited to 0.1 AVAX
              to mitigate loss of real funds in case of any error
            </Text>
            <Input
              type="number"
              size="large"
              placeholder="Enter collateral amount (AVAX)"
              value={collateralAmountInput}
              onChange={(e) => setCollateralAmountInput(e.target.value)}
              style={{ margin: "10px 0" }}
              addonAfter={"AVAX"}
            />
            {/* note text */}
            <Button
              type="primary"
              size="large"
              shape="round"
              block
              loading={isDepositCollateralTxPending}
              onClick={handleDepositCollateral}
            >
              Deposit Collateral
            </Button>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            style={{
              maxWidth: 600,
              margin: "0 auto",
              borderRadius: "20px"
            }}
            title={
              <Space>
                <Text>Loan Manager (Sepolia)</Text>
                <a
                  href={`https://sepolia.etherscan.io/address/${CROSSLOAN_CONTRACT_ADDRESS}`}
                  target="_blank"
                >
                  <ExportOutlined />
                </a>
              </Space>
            }
            bordered
            hoverable
            cover={
              <img
                src="./eth-logo.svg"
                alt="eth-logo"
                width={45}
                height={45}
                style={{ marginTop: "10px" }}
              />
            }
            extra={
              account && (
                <Tooltip title="Balance on Sepolia">
                  <Statistic
                    title="Balance"
                    value={sepoliaBalance?.displayValue || ""}
                    suffix={sepoliaBalance?.symbol || ""}
                    precision={6}
                    valueStyle={{ color: "#3f8600", fontSize: "16px" }}
                  />
                </Tooltip>
              )
            }
          >
            <Statistic
              style={{ textAlign: "center" }}
              title={
                <Text>
                  Loan Amount{" "}
                  <Popover content="You'll receive a loan equal to your collateral on Avalanche">
                    <InfoCircleOutlined />
                  </Popover>
                </Text>
              }
              value={toEther(loanAmount || 0n)}
              suffix="ETH"
            />
            <Divider />
            <label>Repay Loan: </label>
            <Input
              type="number"
              size="large"
              placeholder="Enter repayment amount (ETH)"
              value={repayAmountInput}
              onChange={(e) => setRepayAmountInput(e.target.value)}
              style={{ margin: "27px 0" }}
              addonAfter={"ETH"}
            />
            <Button
              type="primary"
              size="large"
              shape="round"
              block
              loading={isRepayLoanTxPending}
              onClick={handleRepayLoan}
            >
              Repay Loan
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Transaction Logs */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Space direction="vertical" size="middle">
          {
            // Deposit Collateral Tx Logs
            isDepositCollateralTxPending && (
              <Text>Depositing Collateral in progress...</Text>
            )
          }
          {isDepositCollateralTxSuccess && (
            <Space direction="vertical">
              <Text strong>Collateral deposited successfully!</Text>
              <Text type="primary">
                Note: It may take a few minutes to issue loan on destination
                chain (Sepolia)
              </Text>
              <a
                href={`https://snowtrace.io/tx/${depositCollateralTxReceipt.transactionHash}`}
                target="_blank"
              >
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
                href={`https://sepolia.etherscan.io/address/${account}#internaltx`}
                target="_blank"
                rel="noreferrer"
              >
                {" "}
                View Destination Balance
              </a>
            </Space>
          )}
          {isDepositCollateralTxError && (
            <Text type="danger">
              Failed to deposit collateral: {depositCollateralTxError?.message}
            </Text>
          )}
          {
            // Repay Loan Tx Logs
            isRepayLoanTxPending && <Text>Repaying loan in progress...</Text>
          }
          {isRepayLoanTxSuccess && (
            <Space direction="vertical">
              <Text strong>Loan repaid successfully!</Text>
              <Text type="primary">
                Note: It may take a few minutes for the collateral to be
                released on the source chain (Avalanche)
              </Text>
              <a
                href={`https://sepolia.etherscan.io/tx/${repayLoanTxReceipt.transactionHash}`}
                target="_blank"
              >
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
                href={`https://snowtrace.io/address/${account}/internalTx`}
                target="_blank"
                rel="noreferrer"
              >
                {" "}
                View Destination Balance
              </a>
            </Space>
          )}
          {isRepayLoanTxError && (
            <Text type="danger">
              Failed to repay loan: {repayLoanTxError?.message}
            </Text>
          )}
        </Space>
      </div>
    </>
  );
}
