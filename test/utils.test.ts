import { stringifyMessage, convertToString } from '../src/utils';
import { WebViewAction, ChainId, ContractStandard } from '../src/types';

describe('Utils', () => {
  describe('convertToString', () => {
    it('should convert BigInt to string', () => {
      const result = convertToString(1000n);
      expect(result).toBe('1000');
    });

    it('should convert an array of BigInts to an array of strings', () => {
      const result = convertToString([1n, 2n, 3n]);
      expect(result).toEqual(['1', '2', '3']);
    });

    it('should convert BigInt in nested arrays', () => {
      const result = convertToString([
        [1n, 2n],
        [3n, 4n],
      ]);
      expect(result).toEqual([
        ['1', '2'],
        ['3', '4'],
      ]);
    });

    it('should convert BigInt in objects', () => {
      const result = convertToString({ amount: 500n, value: 1000n });
      expect(result).toEqual({ amount: '500', value: '1000' });
    });

    it('should convert BigInt in nested objects', () => {
      const result = convertToString({
        data: { amount: 500n },
        array: [1n, 2n],
        nested: { value: 1000n, array: [1n, 2n, 3n] },
      });
      expect(result).toEqual({
        data: { amount: '500' },
        array: ['1', '2'],
        nested: { value: '1000', array: ['1', '2', '3'] },
      });
    });

    it('should handle mixed types', () => {
      const result = convertToString({
        string: 'hello',
        number: 42,
        bigint: 1000n,
        array: ['test', 2000n, { nested: 3000n }],
      });
      expect(result).toEqual({
        string: 'hello',
        number: 42,
        bigint: '1000',
        array: ['test', '2000', { nested: '3000' }],
      });
    });
  });

  describe('stringifyMessage', () => {
    it('should stringify a simple message with BigInt', () => {
      const message = { amount: 1000n, value: 'test' };
      const result = stringifyMessage(message);
      const parsed = JSON.parse(result) as { amount: string; value: string };
      expect(parsed).toEqual({ amount: '1000', value: 'test' });
    });

    it('should stringify a complex CallSmartContractMessage', () => {
      const testMessage = {
        action: WebViewAction.CALL_SMART_CONTRACT,
        data: {
          contractAddress: '0x1234567890123456789012345678901234567890' as const,
          functionName: 'transfer',
          functionParams: [
            '0xabcdef1234567890abcdef1234567890abcdef12', // string
            1000n, // bigint
            ['param1', 'param2'], // string[]
            [1n, 2n, 3n], // bigint[]
            [
              ['nested', 'array'],
              [4n, 5n],
            ], // nested arrays
            {
              // object with bigint
              amount: 500n,
              nested: {
                value: 1000n,
                array: [1n, 2n, 3n],
              },
            },
          ],
          value: '1000000000000000000',
          contractStandard: ContractStandard.ERC20,
          chainId: ChainId.ETH,
          permits: [
            {
              owner: '0xowner1234567890123456789012345678901234567890' as const,
              token: '0xtoken1234567890123456789012345678901234567890' as const,
              spender: '0xspender1234567890123456789012345678901234567890' as const,
              amount: '1000000000000000000',
              deadline: '1640995200',
              nonce: '123',
            },
          ],
        },
      };

      const result = stringifyMessage(testMessage);
      const parsed = JSON.parse(result) as {
        action: string;
        data: {
          contractAddress: string;
          functionName: string;
          functionParams: unknown[];
          value: string;
          contractStandard: string;
          chainId: number;
          permits: unknown[];
        };
      };

      // Verify the structure is preserved
      expect(parsed.action).toBe('CALL_SMART_CONTRACT');
      expect(parsed.data.contractAddress).toBe('0x1234567890123456789012345678901234567890');
      expect(parsed.data.functionName).toBe('transfer');

      // Verify BigInt values are converted to strings
      expect(parsed.data.functionParams[1] as string).toBe('1000'); // 1000n -> '1000'
      expect(parsed.data.functionParams[3] as string[]).toEqual(['1', '2', '3']); // [1n, 2n, 3n] -> ['1', '2', '3']
      expect(parsed.data.functionParams[4] as (string | string[])[]).toEqual([
        ['nested', 'array'],
        ['4', '5'],
      ]); // nested arrays
      expect(
        parsed.data.functionParams[5] as {
          amount: string;
          nested: { value: string; array: string[] };
        }
      ).toEqual({
        amount: '500',
        nested: {
          value: '1000',
          array: ['1', '2', '3'],
        },
      });
    });

    it('should handle empty arrays and objects', () => {
      const message = { emptyArray: [], emptyObject: {}, bigintArray: [] };
      const result = stringifyMessage(message);
      const parsed = JSON.parse(result) as {
        emptyArray: unknown[];
        emptyObject: Record<string, unknown>;
        bigintArray: unknown[];
      };
      expect(parsed).toEqual({ emptyArray: [], emptyObject: {}, bigintArray: [] });
    });

    it('should handle null and undefined values', () => {
      const message = { nullValue: null, undefinedValue: undefined, bigint: 1000n };
      const result = stringifyMessage(message);
      const parsed = JSON.parse(result) as {
        nullValue: null;
        undefinedValue: undefined;
        bigint: string;
      };
      expect(parsed).toEqual({ nullValue: null, undefinedValue: undefined, bigint: '1000' });
    });
  });
});
