// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.0;

import "../../IReactive.sol";
import "../../AbstractReactive.sol";
import "../../ISystemContract.sol";

contract ReactiveBridge is IReactive, AbstractReactive {
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

    uint256 private constant BRIDGE_REQUEST_EVENT_TOPIC_0 =
        0x36509f74dad6985a78ccd85a0c2061d37ebaefb95118163c8d01dd0ba8580f96;
    uint256 public origin1ChainId;
    uint256 public origin2ChainId;
    uint64 private constant GAS_LIMIT = 1000000;
    address public origin1;
    address public origin2;

    // State specific to reactive network instance of the contract

    // State specific to ReactVM instance of the contract

    uint256 public counter;

    constructor(
        address _service,
        address _origin1,
        address _origin2,
        uint256 _origin1ChainId,
        uint256 _origin2ChainId
    ) {
        origin1ChainId = _origin1ChainId;
        origin2ChainId = _origin2ChainId;
        origin1 = _origin1;
        origin2 = _origin2;
        service = ISystemContract(payable(_service));
        bytes memory payload1 = abi.encodeWithSignature(
            "subscribe(uint256,address,uint256,uint256,uint256,uint256)",
            _origin1ChainId,
            _origin1,
            BRIDGE_REQUEST_EVENT_TOPIC_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
        (bool subscription_result1, ) = address(service).call(payload1);
        vm = !subscription_result1;
        bytes memory payload2 = abi.encodeWithSignature(
            "subscribe(uint256,address,uint256,uint256,uint256,uint256)",
            _origin2ChainId,
            _origin2,
            BRIDGE_REQUEST_EVENT_TOPIC_0,
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
     * @dev decodes receiver and amount from the event data and encode them in payload to bridgeMint tokens on the destination chain
     * @dev gets the destination chain ID and address from reverse mapping and emits Callback event
     * @dev The emitted Callback event will be caught by the reactive network and forwarded to the destination chain with the payload
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
        // Decoding receiver and amount from the event data
        (, , address receiver, uint256 amount) = abi.decode(
            data,
            (address, uint256, address, uint256)
        );
        bytes memory payload = abi.encodeWithSignature(
            "bridgeMint(address,address,uint256)", // first 160 bits will be replaced by reactvm address
            address(0), // Eventually be replaced with Reactvm address
            receiver,
            amount
        );
        // Getting the destination chain ID and address. retrieve opposite chain ID and address from the current `chain_id` and `origin`
        uint256 destinationChainId = chain_id == origin1ChainId
            ? origin2ChainId
            : origin1ChainId;
        address destination = _contract == origin1 ? origin2 : origin1;
        emit Callback(destinationChainId, destination, GAS_LIMIT, payload);
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
