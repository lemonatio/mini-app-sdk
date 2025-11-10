/**
 * ***************************************************
 *             Global declarations
 * ***************************************************
 */

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

/**
 * ***************************************************
 *             General types
 * ***************************************************
 */

export type MiniAppError = {
  message: string;
  code: string;
};

export type Address = `0x${string}`;
export type Hex = `0x${string}`;

/**
 * ***************************************************
 *             WebView to App actions
 * ***************************************************
 */
export enum WebViewAction {
  AUTHENTICATE = 'AUTHENTICATE',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  CALL_SMART_CONTRACT = 'CALL_SMART_CONTRACT',
}

export type WebViewMessage = {
  action: WebViewAction;
};

export type AuthenticateMessage = WebViewMessage & {
  action: WebViewAction.AUTHENTICATE;
  data?: AuthenticateData;
};

export type AuthenticateData = {
  nonce?: string;
  chainId?: ChainId;
};

export type DepositMessage = WebViewMessage & {
  action: WebViewAction.DEPOSIT;
  data: DepositData;
};

export type DepositData = {
  amount: string;
  tokenName: TokenName;
  chainId?: ChainId;
};

export type WithdrawMessage = WebViewMessage & {
  action: WebViewAction.WITHDRAW;
  data: WithdrawData;
};

export type WithdrawData = {
  amount: string;
  tokenName: TokenName;
};

export type CallSmartContractMessage = WebViewMessage & {
  action: WebViewAction.CALL_SMART_CONTRACT;
  data: CallSmartContractData;
};

export type Permit = {
  owner: Address;
  token: Address;
  spender: Address;
  amount: string;
  deadline: string; // Unix timestamp (in seconds)
  nonce: string;
};

export type CallSmartContractData = {
  contractAddress: Address;
  functionName: string;
  functionParams: unknown[];
  titleValues?: Record<string, string>;
  descriptionValues?: Record<string, string>;
  value?: string;
  contractStandard?: ContractStandard;
  chainId?: ChainId;
  permits?: Permit[];
};

/**
 * ***************************************************
 *             App to WebView responses
 * ***************************************************
 */
export enum ActionResponse {
  AUTHENTICATE_RESPONSE = 'AUTHENTICATE_RESPONSE',
  DEPOSIT_RESPONSE = 'DEPOSIT_RESPONSE',
  WITHDRAW_RESPONSE = 'WITHDRAW_RESPONSE',
  CALL_SMART_CONTRACT_RESPONSE = 'CALL_SMART_CONTRACT_RESPONSE',
}

export enum TransactionResult {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export type AppMessage = {
  action: ActionResponse;
  result: TransactionResult;
};

export type AuthenticateResponse = AppMessage &
  (
    | {
        action: ActionResponse.AUTHENTICATE_RESPONSE;
        result: TransactionResult.SUCCESS;
        data: {
          wallet: Address;
          claims: string[];
          signature: Hex;
          message: string;
        };
      }
    | {
        action: ActionResponse.AUTHENTICATE_RESPONSE;
        result: TransactionResult.FAILED;
        error: MiniAppError;
      }
    | {
        action: ActionResponse.AUTHENTICATE_RESPONSE;
        result: TransactionResult.CANCELLED;
      }
  );

export type DepositResponse = AppMessage &
  (
    | {
        action: ActionResponse.DEPOSIT_RESPONSE;
        result: TransactionResult.SUCCESS;
        data: {
          txHash: Hex;
        };
      }
    | {
        action: ActionResponse.DEPOSIT_RESPONSE;
        result: TransactionResult.FAILED;
        error: MiniAppError;
      }
    | {
        action: ActionResponse.DEPOSIT_RESPONSE;
        result: TransactionResult.CANCELLED;
      }
  );

export type WithdrawResponse = AppMessage &
  (
    | {
        action: ActionResponse.WITHDRAW_RESPONSE;
        result: TransactionResult.SUCCESS;
        data: {
          txHash: Hex;
        };
      }
    | {
        action: ActionResponse.WITHDRAW_RESPONSE;
        result: TransactionResult.FAILED;
        error: MiniAppError;
      }
    | {
        action: ActionResponse.WITHDRAW_RESPONSE;
        result: TransactionResult.CANCELLED;
      }
  );

export type CallSmartContractResponse = AppMessage &
  (
    | {
        action: ActionResponse.CALL_SMART_CONTRACT_RESPONSE;
        result: TransactionResult.SUCCESS;
        data: {
          txHash: Hex;
        };
      }
    | {
        action: ActionResponse.CALL_SMART_CONTRACT_RESPONSE;
        result: TransactionResult.FAILED;
        error: MiniAppError;
      }
    | {
        action: ActionResponse.CALL_SMART_CONTRACT_RESPONSE;
        result: TransactionResult.CANCELLED;
      }
  );

/**
 * ***************************************************
 *             Enums
 * ***************************************************
 */

export enum ChainId {
  // Mainnet
  ARBITRUM_ONE = 42161,
  BASE = 8453,
  CELO = 42220,
  ETH = 1,
  GNOSIS = 100,
  OP_MAINNET = 10,
  POLYGON = 137,

  // Testnet
  ARBITRUM_SEPOLIA = 421614,
  BASE_SEPOLIA = 84532,
  ETH_HOODI = 560048,
  ETH_SEPOLIA = 11155111,
  OPTIMISM_SEPOLIA = 11155420,
  POLYGON_AMOY = 80002,
}

export enum TokenName {
  ETH = 'ETH',
  POL = 'POL',
  DAI = 'DAI',
  USDC = 'USDC',
  USDT = 'USDT',
}

export enum ContractStandard {
  ERC20 = 'ERC20',
}
