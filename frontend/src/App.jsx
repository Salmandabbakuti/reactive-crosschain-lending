import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Card,
  Typography,
  message,
  Statistic,
  Space
} from "antd";
import {
  useReadContract,
  useActiveAccount,
  useSendAndConfirmTransaction,
  useWalletBalance,
  useActiveWalletChain
} from "thirdweb/react";
import { sepolia, polygon } from "thirdweb/chains";
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

  const {
    data: polygonBalance,
    isLoading: isPolygonBalanceLoading,
    isError: isPolygonBalanceError,
    error: polygonBalanceError,
    failureReason: polygonBalanceFailureReason
  } = useWalletBalance({
    chain: polygon,
    address: account,
    client: thirdwebClient
  });
  console.log(
    "balance polygon",
    polygonBalance?.displayValue,
    polygonBalance?.symbol
  );

  const {
    data: sepoliaBalance,
    isLoading: isSepoliaBalanceLoading,
    isError: isSepoliaBalanceError,
    error: sepoliaBalanceError,
    failureReason: sepoliaBalanceFailureReason
  } = useWalletBalance({
    chain: sepolia,
    address: account,
    client: thirdwebClient
  });
  console.log(
    "balance sepolia",
    sepoliaBalance?.displayValue,
    sepoliaBalance?.symbol
  );

  const {
    data: depositedCollateral,
    isLoading: isCollateralAmountByAddrLoading,
    isError: isCollateralAmountByAddrError,
    failureReason: collateralAmountByAddrFailureReason
  } = useReadContract({
    contract: collateralManagerContract,
    method: "function collateralAmount(address) view returns (uint256)",
    params: [account]
  });

  const {
    data: loanAmount,
    isLoading: isLoanAmountLoading,
    isError: isLoanAmountError,
    failureReason: loanAmountFailureReason
  } = useReadContract({
    contract: crossLoanContract,
    method: "function loanAmount(address) view returns (uint256)",
    params: [account]
  });
  console.log("loanAmount", loanAmount);
  console.log("depositedCollateral", depositedCollateral);

  const {
    mutate: sendAndConfirmDepositCollateralTx,
    data: depositCollateralTxReceipt,
    error: depositCollateralTxError,
    failureReason: depositCollateralTxFailureReason,
    isPending: isDepositCollateralTxPending,
    isError: isDepositCollateralTxError,
    isSuccess: isDepositCollateralTxSuccess
  } = useSendAndConfirmTransaction();

  console.log(depositCollateralTxError, depositCollateralTxFailureReason);

  const {
    mutate: sendAndConfirmRepayLoanTx,
    data: repayLoanTxReceipt,
    error: repayLoanTxError,
    failureReason: repayLoanTxFailureReason,
    isPending: isRepayLoanTxPending,
    isError: isRepayLoanTxError,
    isSuccess: isRepayLoanTxSuccess
  } = useSendAndConfirmTransaction();

  console.log(repayLoanTxError, repayLoanTxFailureReason);

  useEffect(() => {
    // Fetch loan details from the blockchain (collateral, loanAmount) on component mount
    // fetchLoanDetails();
  }, []);

  // Simulate fetching loan details from the blockchain
  const fetchLoanDetails = async () => {
    // Fetch collateral and loan amount here
    setCollateral(2); // Example collateral value
    setLoanAmount(1); // Example loan value
  };

  const handleDepositCollateral = () => {
    if (!collateralAmountInput)
      return message.error("Please enter a valid amount");
    if (!account) return message.error("Please connect your wallet first!");
    if (activeChain?.id !== 11155111)
      return message.error("Please switch to Polygon network");
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
    if (activeChain?.id !== 11155111)
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
      <Card
        title="Loan and Collateral Details"
        bordered={false}
        style={{ marginBottom: "20px" }}
      >
        <div>
          <Text>Deposited Collateral: </Text>
          <Text strong> {toEther(depositedCollateral || 0n)} ETH</Text>
        </div>
        <div>
          <Text>Loan Amount: </Text>
          <Text strong>{toEther(loanAmount || 0n)} ETH</Text>
        </div>
      </Card>

      <Card
        title="Deposit Collateral(On Polygon)"
        extra={
          account && (
            <Statistic
              title="Balance"
              value={polygonBalance?.displayValue}
              suffix={polygonBalance?.symbol}
              valueStyle={{ color: "#3f8600", fontSize: "16px" }}
              precision={6}
            />
          )
        }
        bordered={false}
        style={{ marginBottom: "20px" }}
      >
        <Input
          placeholder="Enter collateral amount (ETH)"
          value={collateralAmountInput}
          onChange={(e) => setCollateralAmountInput(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <Button type="primary" onClick={handleDepositCollateral}>
          Deposit Collateral
        </Button>
      </Card>

      <Card
        title="Repay Loan(On Sepolia)"
        bordered={false}
        extra={
          account && (
            <Statistic
              title="Balance"
              value={sepoliaBalance?.displayValue || ""}
              suffix={sepoliaBalance?.symbol || ""}
              valueStyle={{ color: "#3f8600", fontSize: "16px" }}
              precision={6}
            />
          )
        }
      >
        <Input
          placeholder="Enter repayment amount (ETH)"
          value={repayAmountInput}
          onChange={(e) => setRepayAmountInput(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <Button type="primary" onClick={handleRepayLoan}>
          Repay Loan
        </Button>
      </Card>
      {/* logs div */}
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
                href={`https://polygonscan.com/tx/${depositCollateralTxReceipt.transactionHash}`}
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
            isRepayLoanTxPending && <Text>Repaying Loan in progress...</Text>
          }
          {isRepayLoanTxSuccess && (
            <Space direction="vertical">
              <Text strong>Loan repaid successfully!</Text>
              <Text type="primary">
                Note: It may take a few minutes for the collateral to be
                released on the source chain (Polygon)
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
                href={`https://polygonscan.com/address/${account}#internaltx`}
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
