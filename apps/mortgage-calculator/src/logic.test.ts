import { describe, it, expect } from 'vitest';
import { calculateMortgage } from './logic';

describe('calculateMortgage', () => {
  it('calculates standard monthly repayments correctly', () => {
    const result = calculateMortgage({
      loanAmount: 500000,
      interestRate: 6,
      loanTerm: 30,
      repaymentFrequency: 'monthly',
      offsetBalance: 0,
      extraRepayment: 0,
    });

    // Standard repayment for $500k @ 6% for 30 years is ~$2997.75
    expect(result.monthlyRepayment).toBeCloseTo(2997.75, 1);
    expect(result.yearsToPayOff).toBe(30);
  });

  it('reduces loan term with extra repayments', () => {
    const result = calculateMortgage({
      loanAmount: 500000,
      interestRate: 6,
      loanTerm: 30,
      repaymentFrequency: 'monthly',
      offsetBalance: 0,
      extraRepayment: 500,
    });

    expect(result.yearsToPayOff).toBeLessThan(30);
    expect(result.totalInterest).toBeLessThan(579178); // Interest without extra is ~579k
  });

  it('reduces interest with offset balance', () => {
    const withoutOffset = calculateMortgage({
      loanAmount: 500000,
      interestRate: 6,
      loanTerm: 30,
      repaymentFrequency: 'monthly',
      offsetBalance: 0,
      extraRepayment: 0,
    });

    const withOffset = calculateMortgage({
      loanAmount: 500000,
      interestRate: 6,
      loanTerm: 30,
      repaymentFrequency: 'monthly',
      offsetBalance: 50000,
      extraRepayment: 0,
    });

    expect(withOffset.totalInterest).toBeLessThan(withoutOffset.totalInterest);
    expect(withOffset.yearsToPayOff).toBeLessThan(30);
  });

  it('handles weekly repayments', () => {
    const result = calculateMortgage({
      loanAmount: 500000,
      interestRate: 6,
      loanTerm: 30,
      repaymentFrequency: 'weekly',
      offsetBalance: 0,
      extraRepayment: 0,
    });

    expect(result.yearsToPayOff).toBeCloseTo(30, 1);
    expect(result.weeklyRepayment).toBeCloseTo(691.3, 1);
  });
});
