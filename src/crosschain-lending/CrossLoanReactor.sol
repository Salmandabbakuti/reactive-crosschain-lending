// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.0;

import "../IReactive.sol";
import "../AbstractReactive.sol";
import "../ISystemContract.sol";

contract CrossLoanReactor is IReactive, AbstractReactive {
    event Event(
        uint256 indexed chain_id,
        address indexed _contract,
        uint256 indexed topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3,
        bytes data,
        uint256 counter
    );

    // event on origin chain
    uint256 private constant COLLATERAL_DEPOSITED_EVENT_TOPIC_0 =
        0xf05bb473a70941908f1fc5e323b18524b238370f80daa13ca595a83041403c82;
    // event on destination chain
    uint256 private constant LOAN_REPAID_EVENT_TOPIC_0 =
        0xc701461b765fed67c198ae04ba7565349a5cddf506bdb333ee116a3f28fc0832;
    // states for the contract
    uint256 private immutable originChainId;
    uint256 private immutable destinationChainId;
    // Gas limit for the callback. Update the gas limit according to the callback function
    uint64 private constant GAS_LIMIT = 1000000;
    address private immutable origin;
    address private immutable destination;

    // State specific to ReactVM instance of the contract

    uint256 public counter;

    constructor(
        address _service,
        address _origin,
        address _destination,
        uint256 _originChainId,
        uint256 _destinationChainId
    ) {
        originChainId = _originChainId;
        destinationChainId = _destinationChainId;
        origin = _origin;
        destination = _destination;
        service = ISystemContract(payable(_service));
        bytes memory payload1 = abi.encodeWithSignature(
            "subscribe(uint256,address,uint256,uint256,uint256,uint256)",
            _originChainId,
            _origin,
            COLLATERAL_DEPOSITED_EVENT_TOPIC_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
        (bool subscription_result1, ) = address(service).call(payload1);
        vm = !subscription_result1;
        bytes memory payload2 = abi.encodeWithSignature(
            "subscribe(uint256,address,uint256,uint256,uint256,uint256)",
            _destinationChainId,
            _destination,
            LOAN_REPAID_EVENT_TOPIC_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
        (bool subscription_result2, ) = address(service).call(payload2);
        vm = !subscription_result2;
    }

    receive() external payable {}

    // Methods specific to ReactVM instance of the contract

    /**
     * @notice Reacts to the event that meets the subscription criteria
     * @dev This function is called by the ReactVM only
     * @dev Decodes the respective event and encode the payload(function to call and input args) to be sent to the destination chain
     * @dev Emits Callback with necessary destination data. The emitted Callback event will be caught by the reactive network and forwarded to the destination chain with the payload
     * @param chain_id origin chain ID
     * @param _contract origin contract address
     * @param topic_0 Topic 0 of the event
     * @param topic_1 Topic 1 of the event
     * @param topic_2 Topic 2 of the event
     * @param topic_3 Topic 3 of the event
     * @param data Event data encoded as byte array
     */
    function react(
        uint256 chain_id,
        address _contract,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3,
        bytes calldata data,
        uint256 /* block_number */,
        uint256 /* op_code */
    ) external vmOnly {
        emit Event(
            chain_id,
            _contract,
            topic_0,
            topic_1,
            topic_2,
            topic_3,
            data,
            ++counter
        );
        if (topic_0 == COLLATERAL_DEPOSITED_EVENT_TOPIC_0) {
            // logic to handle collateral deposited event
            // Decoding collatoral deposited event data
            (, , address user, uint256 amount) = abi.decode(
                data,
                (address, uint256, address, uint256)
            );
            bytes memory payload = abi.encodeWithSignature(
                "issueLoan(address,address,uint256)", // first 160 bits will be replaced by reactvm address
                address(0), // Eventually be replaced with Reactvm address
                user,
                amount
            );
            emit Callback(destinationChainId, destination, GAS_LIMIT, payload);
        } else {
            // logic to handle loan repaid event
            // Decoding loan repaid event data
            (, , address user, uint256 amount) = abi.decode(
                data,
                (address, uint256, address, uint256)
            );
            bytes memory payload = abi.encodeWithSignature(
                "releaseCollateral(address,address,uint256)", // first 160 bits will be replaced by reactvm address
                address(0), // Eventually be replaced with Reactvm address
                user,
                amount
            );
            emit Callback(originChainId, origin, GAS_LIMIT, payload);
        }
    }

    // Methods for testing environment only

    function pretendVm() external {
        vm = true;
    }

    function subscribe(
        uint256 _chainId,
        address _contract,
        uint256 topic_0
    ) external {
        service.subscribe(
            _chainId,
            _contract,
            topic_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
    }

    function unsubscribe(
        uint256 _chainId,
        address _contract,
        uint256 topic_0
    ) external {
        service.unsubscribe(
            _chainId,
            _contract,
            topic_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
    }

    function resetCounter() external {
        counter = 0;
    }
}
