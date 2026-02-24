// Core SDK functions
export {
  isLemonWebView,
  isWebView,
  authenticate,
  deposit,
  withdraw,
  callSmartContract,
} from './functions';

// Types
export type {
  // Utility types
  Address,
  Hex,

  // Base message interfaces
  WebViewMessage,
  AppMessage,
  MiniAppError,

  // WebView to App message types
  AuthenticateMessage,
  DepositMessage,
  WithdrawMessage,
  CallSmartContractMessage,

  // Action data types
  AuthenticateData,
  DepositData,
  WithdrawData,
  CallSmartContractData,
  ContractParams,

  // App to WebView response types
  IsLemonWebViewResponse,
  AuthenticateResponse,
  DepositResponse,
  WithdrawResponse,
  CallSmartContractResponse,

  // Permit2 types
  Permit,
} from './types';

// Enums
export {
  WebViewAction,
  ActionResponse,
  ChainId,
  TransactionResult,
  TokenName,
  ContractStandard,
} from './types';
