// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AbstractCallback.sol";

contract Collateral is AbstractCallback {
    mapping(address => uint256) public collateralAmount;

    event CollateralDeposited(
        address indexed origin,
        uint256 indexed chainId,
        address indexed user,
        uint256 amount
    );
    event CollateralReleased(
        address indexed txOrigin,
        address indexed caller,
        address indexed user,
        uint256 amount
    );

    constructor(
        address _callback_sender
    )
        AbstractCallback(_callback_sender) // Set desired callback address for secure bridging
    {
        owner = msg.sender;
    }

    function depositCollateral(uint256 amount) external {
        // Transfer collateral to contract and lock
        collateralAmount[msg.sender] += amount;
        emit CollateralDeposited(
            address(this),
            block.chainid,
            msg.sender,
            amount
        );
    }

    function releaseCollateral(
        address sender,
        address user,
        uint256 amount
    ) external authorizedSenderOnly {
        require(sender == owner, "No Permission!"); // sender is the reactvm address(deployer)
        // Logic to release collateral after repayment
        collateralAmount[user] -= amount;
        emit CollateralReleased(tx.origin, msg.sender, user, amount);
    }
}
