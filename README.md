## Overview

This tutorial demonstrates how to create a decentralized vesting solution that allows projects to lock tokens and release them to recipients according to predefined schedules. Token vesting is a crucial component of many blockchain projects, especially for managing team, advisor, and investor token allocations.

## Features

- Implementation of smart contracts for token vesting
- Multi-chain deployment (Movement & Aptos)
- User interface for managing vesting schedules
- Admin panel for creating new vesting contracts
- Claiming mechanism for beneficiaries
- Time-locked release schedules

## Prerequisites

Before starting, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or later)
- [Yarn](https://yarnpkg.com/) package manager
- [Movement CLI](https://docs.movementlabs.xyz/) (for Movement deployments)
- [Aptos CLI](https://aptos.dev/en/build/cli) (for Aptos deployments)

## Getting Started

First, install the dependencies:

```bash
yarn install
```

## Deployment Options

### Movement Blockchain Deployment

To deploy your vesting contracts to the Movement blockchain:

```bash
yarn deploy:movement
```

This command will compile your vesting smart contracts and deploy them to the Movement blockchain network.

### Aptos Blockchain Deployment

To deploy your vesting contracts to the Aptos blockchain:

```bash
yarn deploy
```

## Running the dApp

After deploying your vesting contracts, you can start the decentralized application:

```bash
yarn start
```

or if you prefer npm:

```bash
npm start
```

The application will start and be available in your browser.

## Learning Outcomes

By completing this tutorial, you'll learn:

1. **Token Vesting Mechanics** - Understanding linear and cliff vesting models
2. **Smart Contract Development** - Creating secure vesting contracts in the Move language
3. **Blockchain Interaction** - Connecting frontend applications to blockchain contracts
4. **Multi-chain Development** - Adapting applications for different blockchain ecosystems
5. **User Experience Design** - Building intuitive interfaces for blockchain applications

## Key Components

- **Vesting Contract**: Core smart contract that locks and releases tokens according to schedules
- **Admin Interface**: For creating and managing vesting schedules
- **Beneficiary Dashboard**: For users to view and claim their vested tokens
- **Transaction History**: For tracking vesting-related activities

## Resources

- [Movement Documentation](https://docs.movementlabs.xyz/)
- [Aptos Documentation](https://aptos.dev/)
- [Move Language Documentation](https://move-language.github.io/move/)
