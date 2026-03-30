# SDK API Reference

## Functions

### isLemonWebView()

```typescript
async function isLemonWebView(): Promise<boolean>
```

Detects if the WebView is running inside Lemon Cash app. Sends a handshake message and waits for response (1s timeout, typically ~1ms).

### isWebView() [DEPRECATED]

```typescript
function isWebView(): boolean
```

Synchronous check for any React Native WebView. Checks `window.ReactNativeWebView`, user agent, and document root class.

### authenticate(data)

```typescript
async function authenticate(data: AuthenticateData): Promise<AuthenticateResponse>
```

**AuthenticateData:**
```typescript
{
  chainId: ChainId;           // REQUIRED
  nonce?: string;             // Min 8 alphanumeric chars, generate on backend
  requirements?: {
    claims?: ClaimKey[];      // User data to request
    permissions?: string[];   // Permissions to request
  };
}
```

**Success response data:**
```typescript
{
  wallet: Address;      // '0x...' user's wallet address
  claims: ClaimKey[];   // Granted claims
  signature: Hex;       // SIWE signed message
  message: string;      // The signed SIWE message (verify on backend)
}
```

### deposit(data)

```typescript
async function deposit(data: DepositData): Promise<DepositResponse>
```

**DepositData:**
```typescript
{
  amount: string;          // Amount to deposit
  tokenName: TokenName;    // Token symbol enum
  chainId: ChainId;        // REQUIRED
}
```

**Success response data:** `{ txHash: Hex }`

**Note:** Testnet deposits are blocked. Use faucets for testnet funding.

### withdraw(data)

```typescript
async function withdraw(data: WithdrawData): Promise<WithdrawResponse>
```

**WithdrawData:**
```typescript
{
  amount: string;          // Amount to withdraw
  tokenName: TokenName;    // Token symbol enum
  chainId: ChainId;        // REQUIRED
}
```

**Success response data:** `{ txHash: Hex }`

### callSmartContract(data)

```typescript
async function callSmartContract(data: CallSmartContractData): Promise<CallSmartContractResponse>
```

**CallSmartContractData:**
```typescript
{
  contracts: ContractParams[];                  // Array of calls (batch supported)
  titleValues?: Record<string, string>;         // UI title interpolation
  descriptionValues?: Record<string, string>;   // UI description interpolation
}
```

**ContractParams:**
```typescript
{
  contractAddress: Address;             // '0x...' contract address
  functionName: string;                 // Function to call
  functionParams: unknown[];            // Parameters array
  chainId: ChainId;                     // REQUIRED
  value?: string;                       // Native token amount (default '0')
  contractStandard?: ContractStandard;  // e.g. ContractStandard.ERC20
  permits?: Permit[];                   // Permit2 gasless approvals
}
```

**Permit (for Permit2):**
```typescript
{
  owner: Address;     // User's wallet
  token: Address;     // ERC20 token address
  spender: Address;   // Contract to authorize
  amount: string;     // Amount in smallest unit (wei)
  deadline: string;   // Unix timestamp in seconds
  nonce: string;      // Unique nonce for replay protection
}
```

**Success response data:** `{ txHash: Hex }`

---

## Enums

### ChainId

**Mainnets:**
| Name | Value |
|------|-------|
| `ARBITRUM_ONE` | 42161 |
| `AVALANCHE` | 43114 |
| `BASE` | 8453 |
| `BNB_SMART_CHAIN` | 56 |
| `CELO` | 42220 |
| `ETH` | 1 |
| `GNOSIS` | 100 |
| `OP_MAINNET` | 10 |
| `POLYGON` | 137 |
| `ROOTSTOCK` | 30 |

**Testnets:**
| Name | Value |
|------|-------|
| `ARBITRUM_SEPOLIA` | 421614 |
| `AVALANCHE_FUJI` | 43113 |
| `BASE_SEPOLIA` | 84532 |
| `BNB_SMART_CHAIN_TESTNET` | 97 |
| `CELO_SEPOLIA` | 11142220 |
| `ETH_HOODI` | 560048 |
| `ETH_SEPOLIA` | 11155111 |
| `GNOSIS_CHIADO_TESTNET` | 10200 |
| `OPTIMISM_SEPOLIA` | 11155420 |
| `POLYGON_AMOY` | 80002 |
| `ROOTSTOCK_TESTNET` | 31 |

### TokenName

`AAVE`, `ARB`, `AVAX`, `AXS`, `BNB`, `BTC`, `CELO`, `DAI`, `ETH`, `GNO`, `LINK`, `OP`, `PAXG`, `POL`, `RIF`, `UNI`, `USDC`, `USDT`, `USDS`, `XDAI`

### ClaimKey

| Key | Description |
|-----|-------------|
| `NAME` | User's first name |
| `LAST_NAME` | User's last name |
| `EMAIL` | User's email |
| `IS_PEP` | Politically Exposed Person (Argentina only) |
| `LEMONTAG` | Lemon Cash username |
| `OPERATION_COUNTRY` | Country of operation |

### TransactionResult

`SUCCESS`, `FAILED`, `CANCELLED`

### ContractStandard

`ERC20`

---

## Utility Types

```typescript
type Address = `0x${string}`;
type Hex = `0x${string}`;
type MiniAppError = { message: string; code: string };
```

---

## Exports Summary

**Functions:** `isLemonWebView`, `isWebView`, `authenticate`, `deposit`, `withdraw`, `callSmartContract`

**Enums:** `WebViewAction`, `ActionResponse`, `ChainId`, `TransactionResult`, `TokenName`, `ContractStandard`

**Types:** `Address`, `Hex`, `WebViewMessage`, `AppMessage`, `MiniAppError`, `AuthenticateMessage`, `DepositMessage`, `WithdrawMessage`, `CallSmartContractMessage`, `AuthenticateData`, `DepositData`, `WithdrawData`, `CallSmartContractData`, `ContractParams`, `IsLemonWebViewResponse`, `AuthenticateResponse`, `DepositResponse`, `WithdrawResponse`, `CallSmartContractResponse`, `Permit`
