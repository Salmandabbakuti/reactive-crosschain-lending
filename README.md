# Crosschain Lending

## Overview

This project illustrates a basic use case of the Reactive Network, showcasing a cross-chain lending scenario. The demo involves three contracts, one each for the origin chain(Avalanche), destination chain(Sepolia), and a Reactive Contract that listens for events on both chains and triggers callbacks to facilitate cross-chain interactions. The demo allows users to deposit collateral on the origin chain(Avalanche) to request a loan on the destination chain(Sepolia). The Reactive Contract listens for the `CollateralDeposited` event on the origin chain(Avalanche) and triggers a callback to the destination chain(Sepolia) to issue the loan amount to the user's address on the destination chain(Sepolia). Users can repay the total loan amount at once or in installments. The Reactive Contract listens for the `LoanRepaid` event on the destination chain(Sepolia) and triggers a callback to the origin chain(Avalanche) to release the collateral to the user's address on the origin chain(Avalanche).

![Screenshot 2024-10-18 190821](https://github.com/user-attachments/assets/9bc4bfd4-9e29-4b3e-a4bf-50f6badeb4df)

### Features

- **Collateral Management:** Users can deposit collateral on the origin chain(Avalanche) to request a loan on the destination chain(Sepolia). The Reactive Contract listens for the `CollateralDeposited` event on the origin chain(Avalanche) and triggers a callback to the destination chain(Sepolia) to issue the loan amount to the user's address on the destination chain(Sepolia).

- **Loan Repayment:** Users can repay the total loan amount at once or in installments. The Reactive Contract listens for the `LoanRepaid` event on the destination chain(Sepolia) and triggers a callback to the origin chain(Avalanche) to release the collateral to the user's address on the origin chain(Avalanche).

- **Intuitive UI:** The demo includes a user-friendly UI to interact with the contracts. Users can connect their wallets, deposit collateral, request loans, repay loans, and track the statuses.

- **Realtime Updates:** The UI updates user balances, collateral and loan amounts in real-time to reflect the latest contract interactions.

![crosslending-flow](https://github.com/user-attachments/assets/8992897b-e3ea-45f0-8614-970ba29339a5)

## Contracts

The demo involves three contracts. Can be found in `src/crosschain-lending` directory:

1. **CollateralManager(Origin) Contract:** `CollateralManager.sol` This contract allows users to deposit collateral on the origin chain(Avalanche) to request a loan on the destination chain(Sepolia). It emits a `CollateralDeposited` event when a user deposits collateral. The event contains the user's address and the amount of collateral deposited. The contract also has a `releaseCollateral` function that releases the collateral to the user's address on the origin chain(Avalanche) when called by authorized callback proxy contract.

2. **CrossLoan Contract(Destination):** `CrossLoan.sol` This Contract issues loan on the destination chain(Sepolia) to the user's address when triggered by the Reactive Contract. It also allows users to repay the total loan amount at once or in installments. The contract emits a `LoanRepaid` event when a user repays the loan amount. The event contains the user's address and the amount of loan repaid in which triggers a callback to the origin chain(Avalanche) to release the collateral to the user's address on the origin chain(Avalanche).

3. **CrossLoanReactor:** `CrossLoanReactor.sol` is a Reactive Contract that listens for the `CollateralDeposited` event on the origin chain(Avalanche) and triggers a callback to the destination chain(Sepolia) to issue the loan amount to the user's address on the destination chain(Sepolia). It also listens for the `LoanRepaid` event on the destination chain(Sepolia) and triggers a callback to the origin chain(Avalanche) to release the collateral to the user's address on the origin chain(Avalanche).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)

- [Foundry](https://book.getfoundry.sh/)

To set up foundry environment, run:

```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

- Etherem wallet with Some funds on origin and destination chains

To deploy contracts, follow these steps, making sure you substitute the appropriate keys, addresses, and endpoints where necessary. You will need the following environment variables configured appropriately to follow this script:

```.env
ORIGIN_RPC=
DESTINATION_RPC=
REACTIVE_RPC=
PRIVATE_KEY=
ORIGIN_ADDR=
DESTINATION_ADDR=
ORIGIN_CHAINID=
DESTINATION_CHAINID=
SYSTEM_CONTRACT_ADDR=
ORIGIN_CALLBACK_SENDER_ADDR=
DESTINATION_CALLBACK_SENDER_ADDR=
```

You can use the recommended Sepolia RPC URL: `https://rpc2.sepolia.org`.

Load the environment variables:

```bash
source .env
```

### Compile & Deploy Contracts

This project is scaffolded using Foundry, a smart contract development toolchain. Please refer to the [Foundry documentation](https://book.getfoundry.sh/) for more details.

Directory Structure:

```bash
├── README.md
├── frontend
├── lib # Foundry library
├── src
│    ├── crosschain-lending # Crosschain lending contracts
│         ├── CollateralManager.sol
│         ├── CrossLoan.sol
│         ├── CrossLoanReactor.sol
```

Install dependencies and compile the contracts:

```bash
forge install

forge compile
```

Deploy the `CollateralManager` contract with authorized callback sender on origin(i.e Avalanche) and assign the `Deployed to` address from the response to `ORIGIN_ADDR`.

```bash
forge create --rpc-url $ORIGIN_RPC --private-key $PRIVATE_KEY src/crosschain-lending/CollateralManager.sol:CollateralManager --constructor-args $ORIGIN_CALLBACK_SENDER_ADDR
```

Deploy the `CrossLoan` contract with authorized callback sender on destination(i.e. Sepolia) and assign the `Deployed to` address from the response to `DESTINATION_ADDR`.

```bash
forge create --rpc-url $DESTINATION_RPC --private-key $PRIVATE_KEY src/crosschain-lending/CrossLoan.sol:CrossLoan --constructor-args $DESTINATION_CALLBACK_SENDER_ADDR
```

### Callback Payment

To ensure a successful callback and issue loans, the callback contract(both origin, destination contracts) must have an ETH balance. You can find more details [here](https://dev.reactive.network/system-contract#callback-payments). To fund the callback contracts, run the following command:

```bash
cast send $ORIGIN_ADDR --rpc-url $ORIGIN_RPC --private-key $PRIVATE_KEY --value 0.005ether

cast send $DESTINATION_ADDR --rpc-url $DESTINATION_RPC --private-key $PRIVATE_KEY --value 0.5ether # More funds required for issuing loans
```

### Deploy Reactive Contract

Deploy the `CrossLoanReactor.sol` (reactive contract), configuring it to listen to `CollateralDeposited` event on origin contract and `LoanRepaid` event on destination contract, Triggering respective callbacks(to either origin or destination contracts).

```bash
forge create --rpc-url $REACTIVE_RPC --private-key $PRIVATE_KEY src/crosschain-lending/CrossLoanReactor.sol:CrossLoanReactor --constructor-args $SYSTEM_CONTRACT_ADDR $ORIGIN_ADDR $DESTINATION_ADDR $ORIGIN_CHAINID $DESTINATION_CHAINID
```

### Test the Setup

To test the setup, deposit some collateral on the origin chain(Avalanche).

```bash
cast send --rpc-url $ORIGIN_RPC --private-key $PRIVATE_KEY $ORIGIN_ADDR "depositCollateral(uint256)" 5000000000000000
```

> **Note:** Destination contract should be deployed on Sepolia chain and should have enough funds to issue loans.

This should trigger a callback to the destination chain(Sepolia) to issue loan amount to the caller address on the destination chain.

### Deployed Contracts

- **CollateralManager(Origin):** [0xd231fE46b4A8500d4aDD5AD98EC3c4ca56E7dee4](https://snowtrace.io/address/0xd231fE46b4A8500d4aDD5AD98EC3c4ca56E7dee4)
- **CrossLoan(Destination):** [0xAe66deFEfF27a8F82168D999d809E34a002f9627](https://sepolia.etherscan.io/address/0xAe66deFEfF27a8F82168D999d809E34a002f9627)
- **CrossLoanReactor Contract:** [0x9F857f28B81aBDC0c9bFd94eA3CDAB04f893B8Ab](https://kopli.reactscan.net/rvms/0xc7203561EF179333005a9b81215092413aB86aE9?screen=info)
- **RVM:** [0xc7203561EF179333005a9b81215092413aB86aE9](https://kopli.reactscan.net/rvms/0xc7203561EF179333005a9b81215092413aB86aE9)

### Running the Demo

> Copy the `frontend/.env.example` file to `frontend/.env` and update the environment variables accordingly. Update contract addresses in `frontend/src/utils/constants.js` file.

Install dependencies and start the frontend:

```bash
cd frontend

npm install

npm run dev
```

Open your browser and navigate to `http://localhost:3000` to view the demo.

### Demo

https://github.com/user-attachments/assets/82e21e79-a70e-4f86-a24e-f793ef0cdada

### Crosschain Lending Workflow

1. **Connect Wallet:** Connect your wallet to the frontend. Make sure you have some funds on Avalanche.

2. **Deposit Collateral:** Deposit some collateral on the origin chain(Avalanche) to receive a loan of the same amount on destination chain(Sepolia).

3. Reactive Contract listens for the `CollateralDeposited` event on the origin chain(Avalanche) and triggers a callback to the destination chain(Sepolia) to issue the loan amount to the user's address on the destination chain(Sepolia).

4. The Frontend will display the collateral deposited on origin Chain and the loan amount issued on the destination chain(Sepolia).

5. **Repay Loan:** Repay the total loan amount at once or in installments on the destination chain(Sepolia).

6. Reactive Contract listens for the `LoanRepaid` event on the destination chain(Sepolia) and triggers a callback to the origin chain(Avalanche) to release the collateral to the user's address on the origin chain(Avalanche).

7. The Frontend will display the loan repaid on the destination chain(Sepolia) and the collateral released on the origin chain(Avalanche).

#### Workflow Example

1. User deposits 0.004 AVAX as collateral on the origin chain(Avalanche).

https://snowtrace.io/tx/0xdf283239f64a65a9fe79c6ae3616b009c7a879c424347dc44a738300cf57c5c0

2. Reactive Contract listens for the `CollateralDeposited` event on the origin chain(Avalanche) and triggers a callback to the destination chain(Sepolia)

https://kopli.reactscan.net/rvm/0xc7203561ef179333005a9b81215092413ab86ae9/45

3. User receives a loan of 0.004 ETH on the destination chain(Sepolia).

https://sepolia.etherscan.io/tx/0xa64aceff981f2a89f8533cce34baad1fd742712ad941c780af13b52f3f025d4b

4. User repays the partial loan amount of 0.002 ETH on the destination chain(Sepolia).

https://sepolia.etherscan.io/tx/0x47f31d40b36e932ea07df3fb36d31f816d34c8c935df53629c5dd76e7215bfb3

5. Reactive Contract listens for the `LoanRepaid` event on the destination chain(Sepolia) and triggers a callback to the origin chain(Avalanche) to release the collateral to the user's address on the origin chain(Avalanche).

https://kopli.reactscan.net/rvm/0xc7203561ef179333005a9b81215092413ab86ae9/46

6. User receives the collateral of 0.002 AVAX on the origin chain(Avalanche).

https://snowtrace.io/tx/0x601f804645eeb465f9aae3921c46c41d383f5278f12181975e5d0870585fca7c

## Built With

- [Reactive Network](https://reactive.network) - Facilitates seamless cross-chain and multi-chain interactions, breaking down barriers for true blockchain interoperability.
- [Foundry](https://book.getfoundry.sh/) - A smart contract development toolchain. It provides a set of tools to help you build, test, and deploy smart contracts.
- [Solidity](https://docs.soliditylang.org/en/v0.8.24/) - Ethereum's smart contract programming language
- [Thirdweb](https://thirdweb.com) - Full-stack, open-source web3 development platform. Frontend, backend, and onchain tools to build complete web3 apps — on every EVM chain.
- [Antd](https://ant.design/) - A design system for enterprise-level products. Create an efficient and enjoyable work experience.
- [React + Vite](https://vitejs.dev/) - Frontend development environment for building fast and modern web apps

## Safety & Security

This is experimental software and subject to change over time.

This is a proof of concept and is not ready for production use. It is not audited and has not been tested for security. Use at your own risk. I do not give any warranties and will not be liable for any loss incurred through any use of this codebase.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
