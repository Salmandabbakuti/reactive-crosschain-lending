// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AbstractCallback.sol";

contract CrossLoan is AbstractCallback {
    address owner;

    mapping(address => uint256) public loanAmount;

    event LoanIssued(
        address indexed txOrigin,
        address indexed caller,
        address indexed user,
        uint256 amount
    );
    event LoanRepaid(
        address indexed origin,
        uint256 indexed chainId,
        address indexed user,
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

    function issueLoan(
        address sender,
        address user,
        uint256 amount
    ) external authorizedSenderOnly {
        require(sender == owner, "No Permission!"); // sender is the reactvm address(deployer)
        // Logic to issue loan
        loanAmount[user] = amount;
        emit LoanIssued(tx.origin, msg.sender, user, amount);
    }

    function repayLoan(uint256 amount) external {
        // Logic for repayment
        require(
            loanAmount[msg.sender] >= amount,
            "Repayment amount exceeds loan amount!"
        );
        loanAmount[msg.sender] -= amount;
        emit LoanRepaid(address(this), block.chainid, msg.sender, amount);
    }

    /**
     * @notice Withdraws the contract balance to the owner
     * @param _amount Amount to withdraw
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Not enough balance!");
        payable(owner).transfer(_amount);
    }
}
