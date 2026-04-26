export interface MortgageParams {
  loanAmount: number;
  interestRate: number; // annual percentage rate
  loanTerm: number; // in years
  repaymentFrequency: 'weekly' | 'fortnightly' | 'monthly';
  offsetBalance: number;
  extraRepayment: number; // extra amount per frequency
  isInterestOnly?: boolean;
}

export interface RepaymentResult {
  monthlyRepayment: number;
  fortnightlyRepayment: number;
  weeklyRepayment: number;
  totalInterest: number;
  totalRepayment: number;
  yearsToPayOff: number;
  amortizationSchedule: AmortizationEntry[];
}

export interface AmortizationEntry {
  period: number;
  repayment: number;
  interest: number;
  principal: number;
  balance: number;
  offsetBalance: number;
}

export function calculateMortgage(params: MortgageParams): RepaymentResult {
  const {
    loanAmount,
    interestRate,
    loanTerm,
    repaymentFrequency,
    offsetBalance,
    extraRepayment,
    isInterestOnly = false,
  } = params;

  const annualRate = interestRate / 100;
  let periodsPerYear = 12;
  if (repaymentFrequency === 'fortnightly') periodsPerYear = 26;
  if (repaymentFrequency === 'weekly') periodsPerYear = 52;

  const ratePerPeriod = annualRate / periodsPerYear;
  const totalPeriods = loanTerm * periodsPerYear;

  // Standard repayment calculation (P * r * (1+r)^n) / ((1+r)^n - 1)
  let standardRepayment = 0;
  if (ratePerPeriod === 0) {
    standardRepayment = loanAmount / totalPeriods;
  } else if (isInterestOnly) {
    standardRepayment = loanAmount * ratePerPeriod;
  } else {
    standardRepayment =
      (loanAmount * ratePerPeriod * Math.pow(1 + ratePerPeriod, totalPeriods)) /
      (Math.pow(1 + ratePerPeriod, totalPeriods) - 1);
  }

  const actualRepayment = standardRepayment + extraRepayment;

  let balance = loanAmount;
  let totalInterest = 0;
  let totalRepayment = 0;
  const amortizationSchedule: AmortizationEntry[] = [];
  let period = 0;

  // We loop until balance is 0 or we reach a very high number of periods as a safety net
  while (balance > 0.01 && period < 100 * periodsPerYear) {
    period++;

    // Interest is calculated on (balance - offsetBalance)
    const effectiveBalance = Math.max(0, balance - offsetBalance);
    const interestCharge = effectiveBalance * ratePerPeriod;

    let repayment = Math.min(balance + interestCharge, actualRepayment);

    // If Interest Only, we only repay the interest unless there are extra repayments
    if (isInterestOnly) {
        repayment = Math.min(balance + interestCharge, interestCharge + extraRepayment);
    }

    let principal = repayment - interestCharge;

    balance -= principal;
    totalInterest += interestCharge;
    totalRepayment += repayment;

    if (period <= totalPeriods || balance > 0) {
       amortizationSchedule.push({
          period,
          repayment,
          interest: interestCharge,
          principal,
          balance: Math.max(0, balance),
          offsetBalance
       });
    }

    // Safety break for interest only with no principal reduction
    if (isInterestOnly && extraRepayment <= 0 && period >= totalPeriods) {
        break;
    }
  }

  const yearsToPayOff = period / periodsPerYear;

  const monthlyRepayment = repaymentFrequency === 'monthly' ? actualRepayment : (actualRepayment * periodsPerYear / 12);
  const fortnightlyRepayment = repaymentFrequency === 'fortnightly' ? actualRepayment : (actualRepayment * periodsPerYear / 26);
  const weeklyRepayment = repaymentFrequency === 'weekly' ? actualRepayment : (actualRepayment * periodsPerYear / 52);

  return {
    monthlyRepayment,
    fortnightlyRepayment,
    weeklyRepayment,
    totalInterest,
    totalRepayment,
    yearsToPayOff,
    amortizationSchedule
  };
}
