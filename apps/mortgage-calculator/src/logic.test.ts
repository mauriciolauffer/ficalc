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

  it('handles fortnightly repayments', () => {
    const result = calculateMortgage({
      loanAmount: 500000,
      interestRate: 6,
      loanTerm: 30,
      repaymentFrequency: 'fortnightly',
      offsetBalance: 0,
      extraRepayment: 0,
    });

    expect(result.yearsToPayOff).toBeCloseTo(30, 1);
    expect(result.fortnightlyRepayment).toBeCloseTo(1382.9, 1);
  });

  it('handles zero interest rate', () => {
    const result = calculateMortgage({
      loanAmount: 360000,
      interestRate: 0,
      loanTerm: 30,
      repaymentFrequency: 'monthly',
      offsetBalance: 0,
      extraRepayment: 0,
    });

    // 360,000 / 360 months = 1,000 per month
    expect(result.monthlyRepayment).toBe(1000);
    expect(result.totalInterest).toBe(0);
    expect(result.yearsToPayOff).toBe(30);
  });

  it('handles 100% offset balance', () => {
    const result = calculateMortgage({
      loanAmount: 500000,
      interestRate: 6,
      loanTerm: 30,
      repaymentFrequency: 'monthly',
      offsetBalance: 500000,
      extraRepayment: 0,
    });

    // With 100% offset, interest should be zero
    expect(result.totalInterest).toBe(0);
    // Repayment still happens at standard rate, but all goes to principal
    expect(result.yearsToPayOff).toBeLessThan(30);
  });

  it('handles high extra repayments', () => {
    const result = calculateMortgage({
      loanAmount: 100000,
      interestRate: 6,
      loanTerm: 30,
      repaymentFrequency: 'monthly',
      offsetBalance: 0,
      extraRepayment: 10000, // Very high extra
    });

    expect(result.yearsToPayOff).toBeLessThan(1);
    expect(result.totalInterest).toBeLessThan(3000);
  });
});
