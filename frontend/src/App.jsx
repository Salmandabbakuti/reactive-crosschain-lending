import { useState, useEffect } from "react";
import { Input, Button, Card, Typography } from "antd";
import {
  useReadContract,
  useActiveAccount,
  useSendAndConfirmTransaction
} from "thirdweb/react";
import { toEther, toWei } from "thirdweb/utils";
import { prepareContractCall } from "thirdweb";
import { crossLoanContract, collateralManagerContract } from "./utils";

const { Text } = Typography;

export default function App() {
  const [repayAmountInput, setRepayAmountInput] = useState("");
  const [collateralAmountInput, setCollateralAmountInput] = useState("");

  const { address: account } = useActiveAccount() || {};

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
    const tx = prepareContractCall({
      contract: collateralManagerContract,
      method: "function depositCollateral(uint256 _amount)",
      params: [toWei(collateralAmountInput)],
      value: toWei(collateralAmountInput)
    });
    sendAndConfirmDepositCollateralTx(tx);
  };

  const handleRepayLoan = () => {
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
        title="Deposit Collateral"
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

      <Card title="Repay Loan" bordered={false}>
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
    </>
  );
}
