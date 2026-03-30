# Integration Patterns & Examples

## Standard Mini App Setup

```typescript
import React, { useEffect, useState } from 'react';
import {
  isLemonWebView,
  authenticate,
  ChainId,
  TransactionResult,
  ClaimKey,
  type Address,
} from '@lemoncash/mini-app-sdk';

export const App: React.FC = () => {
  const [wallet, setWallet] = useState<Address | null>(null);
  const [isLemon, setIsLemon] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const lemon = await isLemonWebView();
      setIsLemon(lemon);

      if (!lemon) {
        setLoading(false);
        return;
      }

      const result = await authenticate({
        chainId: ChainId.POLYGON_AMOY,
        requirements: {
          claims: [ClaimKey.NAME, ClaimKey.EMAIL, ClaimKey.LEMONTAG],
        },
      });

      if (result.result === TransactionResult.SUCCESS) {
        setWallet(result.data.wallet);
      }
      setLoading(false);
    };

    init();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isLemon) return <div>Please open this app in Lemon Cash</div>;

  return (
    <div>
      <h1>Mini App</h1>
      {wallet && <p>Connected: {wallet}</p>}
    </div>
  );
};
```

## Authentication with Backend Verification

```typescript
// Frontend: request auth with nonce from your backend
const nonce = await fetch('/api/auth/nonce').then(r => r.json());

const result = await authenticate({
  nonce: nonce.value,
  chainId: ChainId.POLYGON,
  requirements: {
    claims: [ClaimKey.NAME, ClaimKey.EMAIL],
  },
});

if (result.result === TransactionResult.SUCCESS) {
  // Send signature to backend for verification
  await fetch('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({
      signature: result.data.signature,
      message: result.data.message,
      wallet: result.data.wallet,
    }),
  });
}
```

```typescript
// Backend: verify SIWE signature using viem
import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

const client = createPublicClient({ chain: polygon, transport: http() });

const valid = await client.verifySiweMessage({
  message: messageFromFrontend,
  signature: signatureFromFrontend,
});
// Also validate: nonce exists, not expired, not already used
```

## Deposit & Withdraw

```typescript
import { deposit, withdraw, ChainId, TokenName, TransactionResult } from '@lemoncash/mini-app-sdk';

// Deposit (mainnet only - testnet deposits blocked)
const depositResult = await deposit({
  amount: '100',
  tokenName: TokenName.USDC,
  chainId: ChainId.POLYGON,
});

if (depositResult.result === TransactionResult.SUCCESS) {
  console.log('Deposit tx:', depositResult.data.txHash);
}

// Withdraw
const withdrawResult = await withdraw({
  amount: '50',
  tokenName: TokenName.USDC,
  chainId: ChainId.POLYGON,
});

if (withdrawResult.result === TransactionResult.SUCCESS) {
  console.log('Withdraw tx:', withdrawResult.data.txHash);
}
```

## Smart Contract: Single Call

```typescript
import { callSmartContract, ChainId, TransactionResult } from '@lemoncash/mini-app-sdk';

const result = await callSmartContract({
  contracts: [
    {
      contractAddress: '0x1234567890123456789012345678901234567890',
      functionName: 'transfer',
      functionParams: ['0xRecipientAddress...', '1000000'],
      value: '0',
      chainId: ChainId.POLYGON,
    },
  ],
});

if (result.result === TransactionResult.SUCCESS) {
  console.log('TX hash:', result.data.txHash);
} else if (result.result === TransactionResult.FAILED) {
  console.error('Error:', result.error.message, result.error.code);
} else {
  console.log('User cancelled');
}
```

## Smart Contract: Batch Transactions

Multiple contract calls executed in a single transaction:

```typescript
const result = await callSmartContract({
  contracts: [
    {
      contractAddress: '0xTokenAddress...',
      functionName: 'approve',
      functionParams: ['0xSpenderAddress...', '1000000000000000000'],
      value: '0',
      chainId: ChainId.POLYGON,
    },
    {
      contractAddress: '0xProtocolAddress...',
      functionName: 'deposit',
      functionParams: ['1000000000000000000'],
      value: '0',
      chainId: ChainId.POLYGON,
    },
  ],
});
```

## Smart Contract: With Permit2

Gasless token approvals using EIP-2612 Permit2:

```typescript
const result = await callSmartContract({
  contracts: [
    {
      contractAddress: '0xDeFiProtocol...',
      functionName: 'depositWithPermit',
      functionParams: ['1000000000000000000', 'PERMIT_PLACEHOLDER_0'],
      value: '0',
      chainId: ChainId.POLYGON,
      permits: [
        {
          owner: userWallet,           // User's wallet address
          token: '0xUSDCAddress...',   // ERC20 token
          spender: '0xDeFiProtocol...', // Contract to authorize
          amount: '1000000000000000000',
          deadline: '1735689600',       // Unix timestamp (seconds)
          nonce: '0',
        },
      ],
    },
  ],
});
```

The SDK automatically generates EIP-712 signatures and handles Permit2 contract approval if needed.

## Smart Contract: UI Text Interpolation

Customize the confirmation UI shown to users:

```typescript
const result = await callSmartContract({
  contracts: [
    {
      contractAddress: '0x1234...',
      functionName: 'swap',
      functionParams: ['100000000', '0xOutputToken...'],
      value: '0',
      chainId: ChainId.POLYGON,
    },
  ],
  titleValues: {
    amount: '100',
    token: 'USDC',
  },
  descriptionValues: {
    recipient: '0xRecipient...',
    network: 'Polygon',
  },
});
```

## Error Handling Pattern

```typescript
const handleSDKCall = async <T extends { result: TransactionResult }>(
  fn: () => Promise<T>,
): Promise<T | null> => {
  try {
    const result = await fn();

    switch (result.result) {
      case TransactionResult.SUCCESS:
        return result;
      case TransactionResult.FAILED:
        const error = (result as any).error as MiniAppError;
        console.error(`Failed: ${error.code} - ${error.message}`);
        return result;
      case TransactionResult.CANCELLED:
        console.log('User cancelled');
        return result;
    }
  } catch (err) {
    // Timeout or WebView not available
    console.error('SDK error:', err);
    return null;
  }
};
```

## Local Development & Testing

Expose localhost to test in the Lemon app:

```bash
# Start dev server
npm start

# Expose with ngrok
ngrok http 3000
# Returns: https://abc123.ngrok.io -> http://localhost:3000

# Configure the ngrok URL in Lemon's backoffice
# Then open the Mini App in the Lemon Cash app
```

## Deeplinks

Direct users to your Mini App:

```
# Mini App detail page
lemoncash://app/mini-apps/detail/:mini-app-id

# Launch Mini App directly
lemoncash://app/mini-apps/webview/:mini-app-id
```