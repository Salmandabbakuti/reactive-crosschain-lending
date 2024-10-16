// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AbstractCallback.sol";

contract CollateralManager is AbstractCallback {
    address owner;
    mapping(address => uint256) public collateralAmountByAddr;

    event CollateralDeposited(
        address origin,
        uint256 chainId,
        address user,
        uint256 amount
    );
    event CollateralReleased(
        address txOrigin,
        address caller,
        address user,
        uint256 amount
    );

    constructor(
        address _callback_sender
    )
        AbstractCallback(_callback_sender) // Set desired callback address for secure bridging
    {
        owner = msg.sender;
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "No Permission!");
        _;
    }

    function depositCollateral(uint256 amount) external payable {
        // Transfer collateral to contract and lock
        require(msg.value == amount, "Incorrect collateral amount!");
        require(msg.value <= 0.1 ether, "Collateral amount exceeds limit!");
        collateralAmountByAddr[msg.sender] += amount;
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
        collateralAmountByAddr[user] -= amount;
        (bool s, ) = user.call{value: amount}("");
        require(s, "Releasing Collateral failed!");
        emit CollateralReleased(tx.origin, msg.sender, user, amount);
    }

    /**
     * @notice Withdraws the contract balance to the owner
     * @param _amount Amount to withdraw
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Not enough balance");
        (bool s, ) = owner.call{value: _amount}("");
        require(s, "Withdraw failed!");
    }
}
