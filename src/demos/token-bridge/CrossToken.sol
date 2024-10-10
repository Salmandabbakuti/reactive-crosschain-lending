// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../../AbstractCallback.sol";

contract CrossToken is ERC20, AbstractCallback {
    address owner;

    event BridgeRequest(
        address origin,
        uint256 chainId,
        address receiver,
        uint256 amount
    );

    event BridgeMint(
        address txOrigin,
        address caller,
        address receiver,
        uint256 amount
    );

    receive() external payable {}

    constructor(
        uint256 initialSupply,
        address _callback_sender
    )
        ERC20("CrossToken", "XT")
        AbstractCallback(_callback_sender) // Set desired callback address for secure bridging
    {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "No Permission!");
        _;
    }

    /**
     * @notice Withdraws the contract balance to the owner
     * @param _amount Amount to withdraw
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Not enough balance");
        payable(owner).transfer(_amount);
    }

    /**
     * @notice Mints `_amount` of tokens to the `_receiver` by callback proxy contract
     * @dev Only authorized sender can call this function i.e callback proxy contract
     * @dev if zero address is passed as _callback_sender in constructor, then anyone can call this function
     * @dev Sender is the reactvm address(deployer) to make sure that callback is coming from deployer reactvm
     * @param sender Sender address (reactvm address)
     * @param _receiver Receiver address
     * @param _amount Amount to mint
     */
    function bridgeMint(
        address sender,
        address _receiver,
        uint256 _amount
    ) external authorizedSenderOnly {
        require(sender == owner, "No Permission!"); // sender is the reactvm address(deployer)
        _mint(_receiver, _amount);
        emit BridgeMint(tx.origin, msg.sender, _receiver, _amount);
    }

    /**
     * @notice Mint tokens to the receiver by the owner
     * @dev Only owner can should call this function to mint tokens to the receiver
     * @dev For demo purposes, this function didn't have any access control. In production, access control should be added
     * @dev This function let users to mint tokens themselves. Then, they can bridge the tokens to the other chain
     * @param _receiver Receiver address
     * @param _amount Amount to mint
     */
    function mint(address _receiver, uint256 _amount) external {
        _mint(_receiver, _amount);
    }

    /**
     * @notice Bridge request to send tokens to the other chain
     * @dev Burns the tokens from the sender and emits BridgeRequest event
     * @dev ReactiveBridge contract listens to this event and mints the tokens on the other chain
     * @param _amount Amount to bridge
     */
    function bridgeRequest(uint256 _amount) external {
        _burn(msg.sender, _amount);
        emit BridgeRequest(address(this), block.chainid, msg.sender, _amount);
    }
}
