// Core SDK functions
export {
  isLemonWebView,
  isWebView,
  authenticate,
  deposit,
  withdraw,
  callSmartContract,
  transferMoney,
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
  TransferMoneyMessage,

  // Action data types
  AuthenticateData,
  DepositData,
  WithdrawData,
  CallSmartContractData,
  ContractParams,
  TransferMoneyData,
  PaymentDestinationInformation,

  // App to WebView response types
  IsLemonWebViewResponse,
  AuthenticateResponse,
  DepositResponse,
  WithdrawResponse,
  CallSmartContractResponse,
  TransferMoneyResponse,

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
  Currency,
  ClaimKey,
} from './types';
