// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AbstractCallback.sol";

contract CrossLoan is AbstractCallback {
    address owner;

    mapping(address => uint256) public loanAmountByAddr;

    event LoanIssued(
        address txOrigin,
        address caller,
        address user,
        uint256 amount
    );
    event LoanRepaid(
        address origin,
        uint256 chainId,
        address user,
        uint256 amount
    );

    receive() external payable {}

    constructor(
        address _callback_sender
    )
        AbstractCallback(_callback_sender) // Set desired callback address for secure bridging
    {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "No Permission!");
        _;
    }

    /*
     * @notice Issue loan to the user upon collateral deposit
     * @dev This function will be triggered by authorized reactive callback proxy contract
     * when the user deposits collateral on the source chain
     * @param sender Address of the sender - reactvm address
     * @param user Address of the user
     * @param amount Amount of loan to issue
     */
    function issueLoan(
        address sender,
        address user,
        uint256 amount
    ) external authorizedSenderOnly {
        require(sender == owner, "No Permission!"); // sender is the reactvm address(deployer)
        // Logic to issue loan
        loanAmountByAddr[user] = amount;
        (bool s, ) = user.call{value: amount}("");
        require(s, "Issuing loan failed!");
        emit LoanIssued(tx.origin, msg.sender, user, amount);
    }

    /**
     * @notice Repay the loan by the user
     * @dev emits LoanRepaid event, which will be listened by
     * reactive contract and trigger callback to release the collateral to user on source chain
     * @param amount Amount to repay
     */
    function repayLoan(uint256 amount) external payable {
        // Logic for repayment
        require(
            loanAmountByAddr[msg.sender] >= amount,
            "Repayment amount exceeds loan amount!"
        );
        require(msg.value == amount, "Incorrect repayment amount!");
        loanAmountByAddr[msg.sender] -= amount;
        emit LoanRepaid(address(this), block.chainid, msg.sender, amount);
    }

    /**
     * @notice Withdraws the contract balance to the owner
     * @param _amount Amount to withdraw
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Not enough balance!");
        (bool s, ) = owner.call{value: _amount}("");
        require(s, "Withdraw failed!");
    }
}
