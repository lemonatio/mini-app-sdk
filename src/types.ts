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
  IS_LEMON_WEBVIEW = 'IS_LEMON_WEBVIEW',
  AUTHENTICATE = 'AUTHENTICATE',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  CALL_SMART_CONTRACT = 'CALL_SMART_CONTRACT',
  TRANSFER_MONEY = 'TRANSFER_MONEY',
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
  chainId: ChainId;
  requirements?: {
    claims?: ClaimKey[];
    permissions?: string[];
  };
};

export type DepositMessage = WebViewMessage & {
  action: WebViewAction.DEPOSIT;
  data: DepositData;
};

export type DepositData = {
  amount: string;
  tokenName: TokenName;
  chainId: ChainId;
};

export type WithdrawMessage = WebViewMessage & {
  action: WebViewAction.WITHDRAW;
  data: WithdrawData;
};

export type WithdrawData = {
  amount: string;
  tokenName: TokenName;
  chainId: ChainId;
};

export type CallSmartContractMessage = WebViewMessage & {
  action: WebViewAction.CALL_SMART_CONTRACT;
  data: CallSmartContractData;
};

export type PaymentDestinationInformation = {
  paymentId: string;
  [key: string]: unknown;
};

export type TransferMoneyData = {
  amount: string;
  currency: Currency;
  name?: string;
  paymentDestinationInformation: PaymentDestinationInformation;
};

export type TransferMoneyMessage = WebViewMessage & {
  action: WebViewAction.TRANSFER_MONEY;
  data: TransferMoneyData;
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
  contracts: ContractParams[];
  titleValues?: Record<string, string>;
  descriptionValues?: Record<string, string>;
};

export type ContractParams = {
  contractAddress: Address;
  functionName: string;
  functionParams: unknown[];
  value?: string;
  contractStandard?: ContractStandard;
  chainId: ChainId;
  permits?: Permit[];
};

/**
 * ***************************************************
 *             App to WebView responses
 * ***************************************************
 */
export enum ActionResponse {
  IS_LEMON_WEBVIEW_RESPONSE = 'IS_LEMON_WEBVIEW_RESPONSE',
  AUTHENTICATE_RESPONSE = 'AUTHENTICATE_RESPONSE',
  DEPOSIT_RESPONSE = 'DEPOSIT_RESPONSE',
  WITHDRAW_RESPONSE = 'WITHDRAW_RESPONSE',
  CALL_SMART_CONTRACT_RESPONSE = 'CALL_SMART_CONTRACT_RESPONSE',
  TRANSFER_MONEY_RESPONSE = 'TRANSFER_MONEY_RESPONSE',
}

export enum TransactionResult {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ClaimKey {
  NAME = 'NAME',
  LAST_NAME = 'LAST_NAME',
  EMAIL = 'EMAIL',
  IS_PEP = 'IS_PEP',
  LEMONTAG = 'LEMONTAG',
  OPERATION_COUNTRY = 'OPERATION_COUNTRY',
}

export type AppMessage = {
  action: ActionResponse;
  result: TransactionResult;
};

export type IsLemonWebViewResponse = AppMessage & {
  action: ActionResponse.IS_LEMON_WEBVIEW_RESPONSE;
  result: TransactionResult.SUCCESS;
};

export type AuthenticateResponse = AppMessage &
  (
    | {
        action: ActionResponse.AUTHENTICATE_RESPONSE;
        result: TransactionResult.SUCCESS;
        data: {
          wallet: Address;
          claims: ClaimKey[];
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

export type TransferMoneyResponse = AppMessage &
  (
    | {
        action: ActionResponse.TRANSFER_MONEY_RESPONSE;
        result: TransactionResult.SUCCESS;
        data: { transferId: string };
      }
    | {
        action: ActionResponse.TRANSFER_MONEY_RESPONSE;
        result: TransactionResult.FAILED;
        error: MiniAppError;
      }
    | {
        action: ActionResponse.TRANSFER_MONEY_RESPONSE;
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
  AVALANCHE = 43114,
  BASE = 8453,
  BNB_SMART_CHAIN = 56,
  CELO = 42220,
  ETH = 1,
  GNOSIS = 100,
  OP_MAINNET = 10,
  POLYGON = 137,
  ROOTSTOCK = 30,

  // Testnet
  ARBITRUM_SEPOLIA = 421614,
  AVALANCHE_FUJI = 43113,
  BASE_SEPOLIA = 84532,
  BNB_SMART_CHAIN_TESTNET = 97,
  CELO_SEPOLIA = 11142220,
  ETH_HOODI = 560048,
  ETH_SEPOLIA = 11155111,
  GNOSIS_CHIADO_TESTNET = 10200,
  OPTIMISM_SEPOLIA = 11155420,
  POLYGON_AMOY = 80002,
  ROOTSTOCK_TESTNET = 31,
}

export enum TokenName {
  AAVE = 'AAVE',
  ARB = 'ARB',
  AVAX = 'AVAX',
  AXS = 'AXS',
  BNB = 'BNB',
  BTC = 'BTC',
  CELO = 'CELO',
  DAI = 'DAI',
  ETH = 'ETH',
  GNO = 'GNO',
  LINK = 'LINK',
  OP = 'OP',
  PAXG = 'PAXG',
  POL = 'POL',
  RIF = 'RIF',
  UNI = 'UNI',
  USDC = 'USDC',
  USDT = 'USDT',
  USDS = 'USDS',
  XDAI = 'XDAI',
}

export enum ContractStandard {
  ERC20 = 'ERC20',
}

export enum Currency {
  ARS = 'ARS',
  PEN = 'PEN',
}
