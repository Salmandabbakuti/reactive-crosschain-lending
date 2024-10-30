# Reactive Dapp Template

## Overview

### Features

## Contracts

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
│    ├── <contracts-folder> # Dapp contracts
│         ├── ContractA.sol
│         ├── ContractB.sol
│         ├── ContractC.sol
```

Install dependencies and compile the contracts:

```bash
forge install

forge compile
```

### Deploy Contracts(Origin & Destination Chains)

### Callback Payment

To ensure a successful callback, the callback contract(both origin, destination contracts) must have an ETH balance. You can find more details [here](https://dev.reactive.network/system-contract#callback-payments). To fund the callback contracts, run the following command:

```bash

```

### Deploy Reactive Contract

### Test the Setup

### Deployed Contracts

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

### Dapp Workflow

#### Workflow Example

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
