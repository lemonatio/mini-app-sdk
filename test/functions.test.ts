import { deposit, withdraw, callSmartContract, authenticate, isWebView } from '../src/functions';
import { ChainId, WebViewAction, ActionResponse, TransactionResult, TokenName } from '../src/types';

// Mock window.ReactNativeWebView
const mockPostMessage = jest.fn();

type MessageEventHandler = (event: MessageEvent) => void;

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = jest.fn() as jest.MockedFunction<typeof window.addEventListener>;
const mockRemoveEventListener = jest.fn() as jest.MockedFunction<typeof window.removeEventListener>;

// Helper function to setup WebView environment
const setupWebViewEnvironment = (hasWebView: boolean = true) => {
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ReactNativeWebView', {
      value: hasWebView
        ? {
            postMessage: mockPostMessage,
          }
        : undefined,
      writable: true,
    });

    Object.defineProperty(window, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    });
    Object.defineProperty(window, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true,
    });

    // Mock window.navigator.userAgent
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: hasWebView ? 'ReactNativeWebView' : 'Mozilla/5.0',
      },
      writable: true,
    });

    // Mock document.documentElement.classList
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          contains: jest.fn().mockReturnValue(false),
        },
      },
      writable: true,
    });
  }
};

// Setup initial mocks
setupWebViewEnvironment(true);

describe('Core SDK Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Reset to default WebView environment
    setupWebViewEnvironment(true);
  });

  afterEach(() => {
    jest.useRealTimers();

    // Reset to default WebView environment after each test
    setupWebViewEnvironment(true);
  });

  describe('isWebView', () => {
    it('should return true when ReactNativeWebView is available', () => {
      setupWebViewEnvironment(true);
      expect(isWebView()).toBe(true);
    });

    it('should return false when ReactNativeWebView is not available', () => {
      setupWebViewEnvironment(false);
      expect(isWebView()).toBe(false);
    });

    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally deleting window for SSR testing
      delete global.window;

      expect(isWebView()).toBe(false);

      global.window = originalWindow;
    });

    it('should return true when userAgent contains ReactNativeWebView', () => {
      setupWebViewEnvironment(false);
      if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'navigator', {
          value: { userAgent: 'Mozilla/5.0 ReactNativeWebView/1.0' },
          writable: true,
        });
      }
      expect(isWebView()).toBe(true);
    });

    it('should return true when document has ReactNativeWebView class', () => {
      setupWebViewEnvironment(false);
      if (typeof window !== 'undefined') {
        // Mock document.documentElement.classList.contains
        const mockContains = jest.fn().mockReturnValue(true);
        Object.defineProperty(document, 'documentElement', {
          value: { classList: { contains: mockContains } },
          writable: true,
        });

        expect(isWebView()).toBe(true);
        expect(mockContains).toHaveBeenCalledWith('ReactNativeWebView');
      }
    });
  });

  describe('deposit', () => {
    it('should send deposit message and wait for response', async () => {
      const mockResponse = {
        action: ActionResponse.DEPOSIT_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          txHash: '0x123...',
        },
      };

      // Set up the response handler
      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const depositPromise = deposit({
        amount: '100',
        tokenName: TokenName.USDC,
        chainId: ChainId.POLYGON_AMOY,
      });

      // Verify the message was sent
      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.DEPOSIT,
          data: {
            amount: '100',
            tokenName: TokenName.USDC,
            chainId: ChainId.POLYGON_AMOY,
          },
        })
      );

      // Simulate response
      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await depositPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.txHash).toBe('0x123...');
      }
    });

    it('should throw error when not in WebView', async () => {
      setupWebViewEnvironment(false);

      await expect(
        deposit({ amount: '100', tokenName: TokenName.USDC, chainId: ChainId.POLYGON_AMOY })
      ).rejects.toThrow('DEPOSIT can only be used inside a React Native WebView');
    });

    it('should handle different currencies and networks', async () => {
      const mockResponse = {
        action: ActionResponse.DEPOSIT_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          txHash: '0x456...',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const depositPromise = deposit({
        amount: '50',
        tokenName: TokenName.ETH,
        chainId: ChainId.POLYGON_AMOY,
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.DEPOSIT,
          data: {
            amount: '50',
            tokenName: TokenName.ETH,
            chainId: ChainId.POLYGON_AMOY,
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await depositPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.txHash).toBe('0x456...');
      }
    });

    it('should handle zero amount', async () => {
      const mockResponse = {
        action: ActionResponse.DEPOSIT_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          txHash: '0x789...',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const depositPromise = deposit({
        amount: '0',
        tokenName: TokenName.USDC,
        chainId: ChainId.POLYGON_AMOY,
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.DEPOSIT,
          data: {
            amount: '0',
            tokenName: TokenName.USDC,
            chainId: ChainId.POLYGON_AMOY,
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await depositPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.txHash).toBe('0x789...');
      }
    });
  });

  describe('withdraw', () => {
    it('should send withdraw message and wait for response', async () => {
      const mockResponse = {
        action: ActionResponse.WITHDRAW_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          txHash: '0x456...',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const withdrawPromise = withdraw({ amount: '50', tokenName: TokenName.ETH });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.WITHDRAW,
          data: {
            amount: '50',
            tokenName: TokenName.ETH,
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await withdrawPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.txHash).toBe('0x456...');
      }
    });

    it('should throw error when not in WebView', async () => {
      setupWebViewEnvironment(false);

      await expect(withdraw({ amount: '50', tokenName: TokenName.ETH })).rejects.toThrow(
        'WITHDRAW can only be used inside a React Native WebView'
      );
    });

    it('should handle different address formats', async () => {
      const mockResponse = {
        action: ActionResponse.WITHDRAW_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          txHash: '0xabc...',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const withdrawPromise = withdraw({ amount: '100', tokenName: TokenName.USDC });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.WITHDRAW,
          data: {
            amount: '100',
            tokenName: TokenName.USDC,
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await withdrawPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.txHash).toBe('0xabc...');
      }
    });
  });

  describe('callSmartContract', () => {
    it('should send smart contract message and wait for response', async () => {
      const mockResponse = {
        action: ActionResponse.CALL_SMART_CONTRACT_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          txHash: '0x789...',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const contractPromise = callSmartContract({
        contracts: [
          {
            contractAddress: '0xContract...',
            functionName: 'transfer',
            functionParams: ['0xRecipient...', '1000000000000000000'],
            chainId: ChainId.POLYGON_AMOY,
            value: '0.001',
          },
        ],
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.CALL_SMART_CONTRACT,
          data: {
            contracts: [
              {
                contractAddress: '0xContract...',
                functionName: 'transfer',
                functionParams: ['0xRecipient...', '1000000000000000000'],
                chainId: ChainId.POLYGON_AMOY,
                value: '0.001',
              },
            ],
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await contractPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.txHash).toBe('0x789...');
      }
    });

    it('should use default values for optional parameters', async () => {
      const mockResponse = {
        action: ActionResponse.CALL_SMART_CONTRACT_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          txHash: '0xabc...',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const contractPromise = callSmartContract({
        contracts: [
          {
            contractAddress: '0xContract...',
            functionName: 'drip',
            functionParams: [],
            chainId: ChainId.POLYGON_AMOY,
            value: '0',
          },
        ],
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.CALL_SMART_CONTRACT,
          data: {
            contracts: [
              {
                contractAddress: '0xContract...',
                functionName: 'drip',
                functionParams: [],
                chainId: ChainId.POLYGON_AMOY,
                value: '0',
              },
            ],
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await contractPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.txHash).toBe('0xabc...');
      }
    });

    it('should throw error when not in WebView', async () => {
      setupWebViewEnvironment(false);

      await expect(
        callSmartContract({
          contracts: [
            {
              contractAddress: '0xContract...',
              functionName: 'drip',
              functionParams: [],
              chainId: ChainId.POLYGON_AMOY,
              value: '0',
            },
          ],
        })
      ).rejects.toThrow('CALL_SMART_CONTRACT can only be used inside a React Native WebView');
    });

    it('should handle complex function parameters', async () => {
      const mockResponse = {
        action: ActionResponse.CALL_SMART_CONTRACT_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          txHash: '0xdef...',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const complexParams = ['0xAddress...', 12345, true, ['nested', 'array'], { key: 'value' }];

      const contractPromise = callSmartContract({
        contracts: [
          {
            contractAddress: '0xComplexContract...',
            functionName: 'complexFunction',
            functionParams: complexParams,
            chainId: ChainId.POLYGON_AMOY,
            value: '0.1',
          },
        ],
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.CALL_SMART_CONTRACT,
          data: {
            contracts: [
              {
                contractAddress: '0xComplexContract...',
                functionName: 'complexFunction',
                functionParams: complexParams,
                chainId: ChainId.POLYGON_AMOY,
                value: '0.1',
              },
            ],
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await contractPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.txHash).toBe('0xdef...');
      }
    });

    it('should handle titleValues and descriptionValues', async () => {
      const mockResponse = {
        action: ActionResponse.CALL_SMART_CONTRACT_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          txHash: '0xghi...',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const titleValues = { amount: '100', token: 'USDC' };
      const descriptionValues = { recipient: '0xRecipient...', network: 'Polygon' };

      const contractPromise = callSmartContract({
        contracts: [
          {
            contractAddress: '0xContract...',
            functionName: 'transfer',
            functionParams: ['0xRecipient...', '100'],
            chainId: ChainId.POLYGON_AMOY,
            value: '0',
          },
        ],
        titleValues,
        descriptionValues,
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.CALL_SMART_CONTRACT,
          data: {
            contracts: [
              {
                contractAddress: '0xContract...',
                functionName: 'transfer',
                functionParams: ['0xRecipient...', '100'],
                chainId: ChainId.POLYGON_AMOY,
                value: '0',
              },
            ],
            titleValues,
            descriptionValues,
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await contractPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.txHash).toBe('0xghi...');
      }
    });

    it('should handle only titleValues without descriptionValues', async () => {
      const mockResponse = {
        action: ActionResponse.CALL_SMART_CONTRACT_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          txHash: '0xjkl...',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const titleValues = { amount: '50', token: 'ETH' };

      const contractPromise = callSmartContract({
        contracts: [
          {
            contractAddress: '0xContract...',
            functionName: 'withdraw',
            functionParams: ['50'],
            chainId: ChainId.POLYGON_AMOY,
            value: '0',
          },
        ],
        titleValues,
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.CALL_SMART_CONTRACT,
          data: {
            contracts: [
              {
                contractAddress: '0xContract...',
                functionName: 'withdraw',
                functionParams: ['50'],
                chainId: ChainId.POLYGON_AMOY,
                value: '0',
              },
            ],
            titleValues,
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await contractPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.txHash).toBe('0xjkl...');
      }
    });
  });

  describe('authenticate', () => {
    it('should send authenticate message and wait for response', async () => {
      const mockResponse = {
        action: ActionResponse.AUTHENTICATE_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          wallet: '0xSafe...',
          claims: ['claim1', 'claim2'],
          signature: '0xSig...',
          message: 'Sign this message',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const authPromise = authenticate({ nonce: 'test-nonce-123', chainId: ChainId.POLYGON_AMOY });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.AUTHENTICATE,
          data: {
            nonce: 'test-nonce-123',
            chainId: ChainId.POLYGON_AMOY,
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await authPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.wallet).toBe('0xSafe...');
        expect(result.data.claims).toEqual(['claim1', 'claim2']);
        expect(result.data.signature).toBe('0xSig...');
        expect(result.data.message).toBe('Sign this message');
      }
    });

    it('should throw error when not in WebView', async () => {
      setupWebViewEnvironment(false);

      await expect(
        authenticate({ nonce: 'test-nonce', chainId: ChainId.POLYGON_AMOY })
      ).rejects.toThrow('AUTHENTICATE can only be used inside a React Native WebView');
    });

    it('should handle different nonce formats', async () => {
      const mockResponse = {
        action: ActionResponse.AUTHENTICATE_RESPONSE,
        result: TransactionResult.SUCCESS,
        data: {
          wallet: '0xSafeAddress...',
          claims: ['admin', 'user'],
          signature: '0xSignature...',
          message: 'Custom authentication message',
        },
      };

      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const longNonce = 'very-long-nonce-with-special-characters-123!@#$%^&*()';
      const authPromise = authenticate({ nonce: longNonce, chainId: ChainId.POLYGON_AMOY });

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({
          action: WebViewAction.AUTHENTICATE,
          data: {
            nonce: longNonce,
            chainId: ChainId.POLYGON_AMOY,
          },
        })
      );

      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: JSON.stringify(mockResponse) }));
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await authPromise;
      expect(result.result).toBe(TransactionResult.SUCCESS);
      if (result.result === TransactionResult.SUCCESS) {
        expect(result.data.wallet).toBe('0xSafeAddress...');
        expect(result.data.claims).toEqual(['admin', 'user']);
        expect(result.data.signature).toBe('0xSignature...');
        expect(result.data.message).toBe('Custom authentication message');
      }
    });
  });

  describe('response handling edge cases', () => {
    it('should handle timeout for deposit', async () => {
      const depositPromise = deposit({
        amount: '100',
        tokenName: TokenName.USDC,
        chainId: ChainId.POLYGON_AMOY,
      });

      // Don't send response, let it timeout
      jest.advanceTimersByTime(60000);

      await expect(depositPromise).rejects.toThrow(
        `Timeout, 60s passed waiting for ${ActionResponse.DEPOSIT_RESPONSE} response.`
      );
    });

    it('should handle malformed response', () => {
      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const depositPromise = deposit({
        amount: '100',
        tokenName: TokenName.USDC,
        chainId: ChainId.POLYGON_AMOY,
      });

      // Send malformed response
      setTimeout(() => {
        messageHandler(new MessageEvent('message', { data: 'invalid-json' }));
      }, 100);

      jest.advanceTimersByTime(100);

      // Should still be waiting for valid response
      expect(depositPromise).toBeDefined();
    });

    it('should handle wrong response action', () => {
      let messageHandler: MessageEventHandler;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as MessageEventHandler;
        }
      });

      const depositPromise = deposit({
        amount: '100',
        tokenName: TokenName.USDC,
        chainId: ChainId.POLYGON_AMOY,
      });

      // Send wrong response action
      setTimeout(() => {
        messageHandler(
          new MessageEvent('message', {
            data: JSON.stringify({
              action: 'WRONG_ACTION',
              result: TransactionResult.SUCCESS,
              txHash: '0x123...',
            }),
          })
        );
      }, 100);

      jest.advanceTimersByTime(100);

      // Should still be waiting for correct response
      expect(depositPromise).toBeDefined();
    });
  });
});
