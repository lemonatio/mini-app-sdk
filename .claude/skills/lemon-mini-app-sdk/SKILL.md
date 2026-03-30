---
name: lemon-mini-app-sdk
description: |
  Build, integrate, and debug Lemon Cash Mini Apps using @lemoncash/mini-app-sdk.
  Use when: building a mini app, integrating SDK functions (authenticate, deposit, withdraw, callSmartContract),
  adding WebView detection (isLemonWebView, isWebView), debugging SDK issues, working with Permit2,
  batch transactions, SIWE authentication, or multi-chain token operations.
  Triggers: "mini app", "lemon sdk", "authenticate", "deposit", "withdraw", "callSmartContract",
  "WebView", "SIWE", "Permit2", "batch transaction", "ChainId", "TokenName", "mini-app-sdk".
---

# Lemon Mini App SDK

SDK for integrating web-based Mini Apps with the Lemon Cash mobile application via React Native WebView.

## Prerequisites

```bash
npm install @lemoncash/mini-app-sdk
```

**Peer dependency:** React. **Node:** >= 18.0.0

## SDK Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `isLemonWebView()` | Async check if running inside Lemon app | `Promise<boolean>` |
| `isWebView()` | Sync check for any RN WebView (**deprecated**) | `boolean` |
| `authenticate(data)` | SIWE-based user auth + optional claims | `Promise<AuthenticateResponse>` |
| `deposit(data)` | Transfer tokens from Lemon Wallet to Mini App | `Promise<DepositResponse>` |
| `withdraw(data)` | Transfer tokens from Mini App to Lemon Wallet | `Promise<WithdrawResponse>` |
| `callSmartContract(data)` | Execute contract calls (single, batch, Permit2) | `Promise<CallSmartContractResponse>` |

## Response Pattern

All transactional functions return a discriminated union on `result`:

```typescript
if (response.result === TransactionResult.SUCCESS) {
  // response.data available (wallet, txHash, etc.)
} else if (response.result === TransactionResult.FAILED) {
  // response.error: { message: string, code: string }
} else if (response.result === TransactionResult.CANCELLED) {
  // User dismissed the action
}
```

## Quick Integration Pattern

```typescript
import {
  isLemonWebView,
  authenticate,
  deposit,
  withdraw,
  callSmartContract,
  ChainId,
  TokenName,
  TransactionResult,
  ClaimKey,
} from '@lemoncash/mini-app-sdk';

// 1. Detect environment
const isLemon = await isLemonWebView();

// 2. Authenticate
const auth = await authenticate({
  chainId: ChainId.POLYGON_AMOY,    // REQUIRED
  nonce: 'serverGeneratedNonce123',  // Optional but recommended
  requirements: {
    claims: [ClaimKey.NAME, ClaimKey.EMAIL, ClaimKey.LEMONTAG],
  },
});

// 3. Deposit (mainnet only - testnet deposits are blocked)
const dep = await deposit({
  amount: '100',
  tokenName: TokenName.USDC,
  chainId: ChainId.POLYGON,  // REQUIRED
});

// 4. Withdraw
const wd = await withdraw({
  amount: '50',
  tokenName: TokenName.USDC,
  chainId: ChainId.POLYGON,  // REQUIRED
});

// 5. Call smart contract
const tx = await callSmartContract({
  contracts: [{
    contractAddress: '0x1234...',
    functionName: 'transfer',
    functionParams: ['0xRecipient...', '1000000'],
    chainId: ChainId.POLYGON,  // REQUIRED
  }],
});
```

## Key Constraints

- **Testnet deposits are blocked** - use faucets to fund Mini App wallets on testnets
- **chainId is REQUIRED** on authenticate, deposit, withdraw, and each contract in callSmartContract
- **60s timeout** on all SDK calls (1s for isLemonWebView)
- **BigInt values** are auto-converted to strings for JSON serialization
- All functions throw if not running inside a React Native WebView

## Reference Files

- `references/sdk-api-reference.md` - Complete API with all types, enums, and function signatures
- `references/patterns-and-examples.md` - Common integration patterns, batch transactions, Permit2, SIWE verification
