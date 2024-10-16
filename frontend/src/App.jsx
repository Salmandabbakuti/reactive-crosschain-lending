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
  Tooltip
} from "antd";
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
            title="Collateral Details (Avalanche)"
            bordered={false}
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
                    value={avalancheBalance?.displayValue}
                    suffix={avalancheBalance?.symbol}
                    precision={6}
                    valueStyle={{ color: "#3f8600", fontSize: "16px" }}
                  />
                </Tooltip>
              )
            }
          >
            <div>
              <Text>Deposited Collateral: </Text>
              <Text strong> {toEther(depositedCollateral || 0n)} AVAX</Text>
            </div>
            <Divider />
            <Input
              type="number"
              placeholder="Enter collateral amount (ETH)"
              value={collateralAmountInput}
              onChange={(e) => setCollateralAmountInput(e.target.value)}
              style={{ marginBottom: "10px" }}
              addonAfter={"AVAX"}
            />
            {/* note text */}
            <Button
              type="primary"
              block
              loading={isDepositCollateralTxPending}
              onClick={handleDepositCollateral}
            >
              Deposit Collateral
            </Button>
            <Text type="primary">
              Note: *For demo purposes, the collateral amount is limited to 0.1
              AVAX to mitigate loss of real funds in case of any error
            </Text>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title="Loan Details (Sepolia)"
            bordered={false}
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
            <div>
              <Text>Loan Amount: </Text>
              <Text strong>{toEther(loanAmount || 0n)} ETH</Text>
            </div>
            <Divider />
            <Input
              // variant="borderless"
              type="number"
              placeholder="Enter repayment amount (ETH)"
              value={repayAmountInput}
              onChange={(e) => setRepayAmountInput(e.target.value)}
              style={{ marginBottom: "10px" }}
              addonAfter={"ETH"}
            />
            <Button
              type="primary"
              block
              loading={isRepayLoanTxPending}
              onClick={handleRepayLoan}
            >
              Repay Loan
            </Button>
            <Text type="primary">
              Note: *You will receive same amount of loan as collateral
              deposited on Avalanche. As you repay the loan, the collateral will
              be released back to you
            </Text>
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
                Note: It may take a few minutes for the collateral to reflect on
                destination chain (Sepolia) to issue loan
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
                href={`https://snowtrace.io/address/${account}#internaltx`}
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
