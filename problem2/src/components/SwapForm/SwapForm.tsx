import React, { useState, useCallback, useRef, useEffect } from 'react'
import { debounce } from 'lodash'
import BigNumber from 'bignumber.js'
import './SwapForm.css'

const EXCHANGE_RATE = new BigNumber('0.85');
const DECIMAL_PLACES = 2;

BigNumber.config({
  DECIMAL_PLACES: DECIMAL_PLACES,
  ROUNDING_MODE: BigNumber.ROUND_DOWN
});

const SwapForm: React.FC = () => {
  const [inputAmount, setInputAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);

  const validate = useCallback((input: string) => {
    if (!input || input === '') {
      setIsValid(false);
      return;
    }
    
    try {
      const amount = new BigNumber(input);
      const isValidInput = !amount.isNaN() && amount.isPositive() && amount.isFinite();
      setIsValid(isValidInput);
    } catch (error) {
      setIsValid(false);
    }
  }, []);

  const calculateFromInput = useCallback((value: string) => {
    if (value === '') {
      setOutputAmount('');
      validate('');
    } else {
      try {
        const inputBN = new BigNumber(value);
        if (!inputBN.isNaN() && inputBN.isPositive() && inputBN.isFinite()) {
          const calculated = inputBN.multipliedBy(EXCHANGE_RATE).toFixed(DECIMAL_PLACES);
          setOutputAmount(calculated);
          validate(value);
        } else {
          setOutputAmount('');
          validate(value);
        }
      } catch (error) {
        setOutputAmount('');
        validate(value);
      }
    }
  }, [validate]);

  const calculateFromOutput = useCallback((value: string) => {
    if (value === '') {
      setInputAmount('');
      validate('');
    } else {
      try {
        const outputBN = new BigNumber(value);
        if (!outputBN.isNaN() && outputBN.isPositive() && outputBN.isFinite()) {
          const calculated = outputBN.dividedBy(EXCHANGE_RATE).toFixed(DECIMAL_PLACES);
          setInputAmount(calculated);
          validate(calculated);
        } else {
          setInputAmount('');
          validate(value);
        }
      } catch (error) {
        setInputAmount('');
        validate(value);
      }
    }
  }, [validate]);

  const debouncedCalculateFromInput = useRef(debounce(calculateFromInput, 300));
  const debouncedCalculateFromOutput = useRef(debounce(calculateFromOutput, 300));

  useEffect(() => {
    debouncedCalculateFromInput.current = debounce(calculateFromInput, 300);
    debouncedCalculateFromOutput.current = debounce(calculateFromOutput, 300);
  }, [calculateFromInput, calculateFromOutput]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputAmount(value);
    debouncedCalculateFromInput.current(value);
  };

  const onOutputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOutputAmount(value);
    debouncedCalculateFromOutput.current(value);
  };

  const handleConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid || isProcessing) return;

    setIsProcessing(true);

    setTimeout(() => {
      alert(`Transaction successful! You have spent ${inputAmount} and received ${outputAmount}`);
      setIsProcessing(false);
      setInputAmount('');
      setOutputAmount('');
      setIsValid(false);
    }, 1000);
  };

  const getButtonText = (): string => {
    if (isProcessing) return 'Processing...';
    if (!inputAmount || inputAmount.trim() === '') return 'Enter an amount';
    return 'CONFIRM SWAP';
  };

  const isButtonDisabled = (): boolean => {
    return !isValid || isProcessing || !inputAmount || inputAmount.trim() === '';
  };

  return (
    <form onSubmit={handleConfirm} className="swap-form">
      <h5>Swap</h5>
      <label htmlFor="input-amount">Amount to send</label>
      <input
        id="input-amount"
        type="text"
        inputMode="decimal"
        value={inputAmount}
        onChange={onInputChange}
        placeholder="Enter amount"
        disabled={isProcessing}
      />

      <label htmlFor="output-amount">Amount to receive</label>
      <input
        id="output-amount"
        type="text"
        inputMode="decimal"
        value={outputAmount}
        onChange={onOutputChange}
        placeholder="Enter amount"
        disabled={isProcessing}
      />

      <div className="rate-display">
        1 = {EXCHANGE_RATE.toFixed(4)}
      </div>

      <button type="submit" disabled={isButtonDisabled()}>
        {getButtonText()}
      </button>
    </form>
  );
};

export default SwapForm;
