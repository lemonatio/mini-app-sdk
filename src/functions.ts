import {
  WebViewAction,
  DepositMessage,
  WithdrawMessage,
  CallSmartContractMessage,
  AuthenticateMessage,
  DepositResponse,
  WithdrawResponse,
  CallSmartContractResponse,
  AuthenticateResponse,
  AppMessage,
  ActionResponse,
  DepositData,
  WithdrawData,
  CallSmartContractData,
  AuthenticateData,
  WebViewMessage,
} from './types';
import { stringifyMessage } from './utils';

/**
 * Detects if the current environment is a React Native WebView.
 * It checks multiple indicators including the ReactNativeWebView object,
 * UserAgent string, and document class to determine if the app is running
 * inside a React Native WebView container.
 * @returns { boolean } True if running in React Native WebView, false otherwise
 */
export const isWebView = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!(
      window.ReactNativeWebView ||
      window.navigator.userAgent.includes('ReactNativeWebView') ||
      document.documentElement.classList.contains('ReactNativeWebView')
    );
  }
  return false;
};

/**
 * Sends a message to the native React Native app through the WebView.
 * @param message The message to send
 */
const sendMessageToApp = <T extends WebViewMessage>(message: T): void => {
  if (!isWebView()) {
    throw new Error(`${message.action} can only be used inside a React Native WebView`);
  }

  // Needs to double check the window.ReactNativeWebView is available to avoid undefined errors
  if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(stringifyMessage(message));
  }
};

/**
 * Waits for a specific response from the native app.
 * @param expectedAction The expected response action
 * @param timeout Timeout in milliseconds (default: 30000)
 * @returns Promise that resolves with the response data
 */
const waitForResponse = <T extends AppMessage>(
  expectedAction: ActionResponse,
  timeout: number = 60000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      reject(
        new Error(`Timeout, ${timeout / 1000}s passed waiting for ${expectedAction} response.`)
      );
    }, timeout);

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const response = JSON.parse(event.data) as T;
        if (response.action === expectedAction) {
          clearTimeout(timeoutId);
          window.removeEventListener('message', handleMessage);
          resolve(response);
        } else {
          console.log(
            `Ignoring message with wrong action. Expected: ${expectedAction}, received: ${event.data}`
          );
        }
        // If it's a valid JSON but wrong action, ignore it and keep waiting
      } catch (err) {
        console.log(`Ignoring malformed JSON message: ${event.data}`);
        // If it's invalid JSON, ignore it and keep waiting
      }
    };

    window.addEventListener('message', handleMessage);
  });
};

/**
 * Initiates a deposit transaction.
 * @param amount The amount to deposit
 * @param tokenName The token name (e.g., 'USDC', 'USDT', 'ETH')
 * @param chainId The chain id to use
 * @returns Promise that resolves with the transaction hash
 */
export const deposit = async ({
  amount,
  tokenName,
  chainId,
}: DepositData): Promise<DepositResponse> => {
  const message: DepositMessage = {
    action: WebViewAction.DEPOSIT,
    data: {
      amount,
      tokenName,
      chainId,
    },
  };

  sendMessageToApp(message);

  const response = await waitForResponse<DepositResponse>(ActionResponse.DEPOSIT_RESPONSE);

  return response;
};

/**
 * Initiates a withdrawal transaction.
 * @param amount The amount to withdraw
 * @param tokenName The token name to withdraw (e.g. 'USDC', 'ETH')
 * @returns Promise that resolves with the transaction hash
 */
export const withdraw = async ({ amount, tokenName }: WithdrawData): Promise<WithdrawResponse> => {
  const message: WithdrawMessage = {
    action: WebViewAction.WITHDRAW,
    data: {
      amount,
      tokenName,
    },
  };

  sendMessageToApp(message);

  const response = await waitForResponse<WithdrawResponse>(ActionResponse.WITHDRAW_RESPONSE);

  return response;
};

/**
 * Calls a smart contract function or multiple smart contract functions.
 * @param contracts Array of smart contract call objects, each containing:
 * @param contracts[].contractAddress The address of the smart contract
 * @param contracts[].functionName The name of the function to call
 * @param contracts[].functionParams The parameters to pass to the function
 * @param contracts[].chainId The chain id to use
 * @param contracts[].value The amount of native tokens to send with the transaction
 * @param contracts[].permits Optional array of Permit2 permits for gasless token approvals
 * @param contracts[].contractStandard The contract standard if any (e.g. ERC20, ERC721, etc.)
 * @param titleValues The values to replace in the title
 * @param descriptionValues The values to replace in the description
 * @returns Promise that resolves with the transaction hash
 */
export const callSmartContract = async ({
  contracts,
  titleValues,
  descriptionValues,
}: CallSmartContractData): Promise<CallSmartContractResponse> => {
  const message: CallSmartContractMessage = {
    action: WebViewAction.CALL_SMART_CONTRACT,
    data: {
      contracts,
      titleValues,
      descriptionValues,
    },
  };

  sendMessageToApp(message);

  const response = await waitForResponse<CallSmartContractResponse>(
    ActionResponse.CALL_SMART_CONTRACT_RESPONSE
  );

  return response;
};

/**
 * Authenticates the user with the native app.
 * @param nonce A unique nonce for the authentication request
 * @param chainId The chain id to use
 * @returns Promise that resolves with the authentication result
 */
export const authenticate = async ({
  nonce,
  chainId,
}: AuthenticateData = {}): Promise<AuthenticateResponse> => {
  const message: AuthenticateMessage = {
    action: WebViewAction.AUTHENTICATE,
    data: {
      nonce,
      chainId,
    },
  };

  sendMessageToApp(message);

  const response = await waitForResponse<AuthenticateResponse>(
    ActionResponse.AUTHENTICATE_RESPONSE
  );

  return response;
};
