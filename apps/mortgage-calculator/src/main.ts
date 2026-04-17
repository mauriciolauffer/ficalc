import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/Title.js";
import "@ui5/webcomponents-fiori/dist/ShellBar.js";

import { calculateMortgage, MortgageParams } from "./logic";

const loanAmountInput = document.getElementById("loanAmount") as any;
const interestRateInput = document.getElementById("interestRate") as any;
const loanTermInput = document.getElementById("loanTerm") as any;
const frequencySelect = document.getElementById("frequency") as any;
const offsetBalanceInput = document.getElementById("offsetBalance") as any;
const extraRepaymentInput = document.getElementById("extraRepayment") as any;

const repaymentAmountEl = document.getElementById("repaymentAmount")!;
const totalInterestEl = document.getElementById("totalInterest")!;
const totalRepaymentEl = document.getElementById("totalRepayment")!;
const timeToPayOffEl = document.getElementById("timeToPayOff")!;
const amortizationTable = document.getElementById("amortizationTable")!;

function updateResults() {
  const params: MortgageParams = {
    loanAmount: parseFloat(loanAmountInput.value) || 0,
    interestRate: parseFloat(interestRateInput.value) || 0,
    loanTerm: parseFloat(loanTermInput.value) || 0,
    repaymentFrequency: frequencySelect.selectedOption.value as any,
    offsetBalance: parseFloat(offsetBalanceInput.value) || 0,
    extraRepayment: parseFloat(extraRepaymentInput.value) || 0,
  };

  const result = calculateMortgage(params);

  const freq = params.repaymentFrequency;
  let repayment = result.monthlyRepayment;
  if (freq === 'fortnightly') repayment = result.fortnightlyRepayment;
  if (freq === 'weekly') repayment = result.weeklyRepayment;

  repaymentAmountEl.textContent = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(repayment);
  totalInterestEl.textContent = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(result.totalInterest);
  totalRepaymentEl.textContent = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(result.totalRepayment);
  timeToPayOffEl.textContent = `${result.yearsToPayOff.toFixed(1)} years`;

  // Update table (limit to first 12 periods for performance/brevity)
  const rows = amortizationTable.querySelectorAll('ui5-table-row');
  rows.forEach(row => row.remove());

  result.amortizationSchedule.slice(0, 12).forEach(entry => {
    const row = document.createElement('ui5-table-row');
    row.innerHTML = `
      <ui5-table-cell>${entry.period}</ui5-table-cell>
      <ui5-table-cell>${new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(entry.repayment)}</ui5-table-cell>
      <ui5-table-cell>${new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(entry.interest)}</ui5-table-cell>
      <ui5-table-cell>${new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(entry.principal)}</ui5-table-cell>
      <ui5-table-cell>${new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(entry.balance)}</ui5-table-cell>
    `;
    amortizationTable.appendChild(row);
  });
}

[loanAmountInput, interestRateInput, loanTermInput, frequencySelect, offsetBalanceInput, extraRepaymentInput].forEach(el => {
  el.addEventListener("input", updateResults);
  el.addEventListener("change", updateResults);
});

// Initial calculation
updateResults();
