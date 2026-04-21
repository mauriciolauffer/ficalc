import "@ui5/webcomponents/dist/Input.js";
import type Input from "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/Select.js";
import type Select from "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents/dist/Button.js";
import type Button from "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Table.js";
import type Table from "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/Title.js";
import "@ui5/webcomponents-fiori/dist/ShellBar.js";

import { calculateMortgage, MortgageParams, RepaymentResult } from "./logic";

const loanAmountInput = document.getElementById("loanAmount") as Input;
const interestRateInput = document.getElementById("interestRate") as Input;
const loanTermInput = document.getElementById("loanTerm") as Input;
const frequencySelect = document.getElementById("frequency") as Select;
const offsetBalanceInput = document.getElementById("offsetBalance") as Input;
const extraRepaymentInput = document.getElementById("extraRepayment") as Input;

const repaymentAmountEl = document.getElementById("repaymentAmount")!;
const totalInterestEl = document.getElementById("totalInterest")!;
const totalRepaymentEl = document.getElementById("totalRepayment")!;
const timeToPayOffEl = document.getElementById("timeToPayOff")!;
const amortizationTable = document.getElementById("amortizationTable") as Table;
const loadMoreBtn = document.getElementById("loadMoreBtn") as Button;

let currentResult: RepaymentResult | null = null;
let showFullSchedule = false;

function updateResults() {
  const params: MortgageParams = {
    loanAmount: parseFloat(loanAmountInput.value) || 0,
    interestRate: parseFloat(interestRateInput.value) || 0,
    loanTerm: parseFloat(loanTermInput.value) || 0,
    repaymentFrequency: (frequencySelect.selectedOption as any).value as any,
    offsetBalance: parseFloat(offsetBalanceInput.value) || 0,
    extraRepayment: parseFloat(extraRepaymentInput.value) || 0,
  };

  currentResult = calculateMortgage(params);

  const freq = params.repaymentFrequency;
  let repayment = currentResult.monthlyRepayment;
  if (freq === 'fortnightly') repayment = currentResult.fortnightlyRepayment;
  if (freq === 'weekly') repayment = currentResult.weeklyRepayment;

  repaymentAmountEl.textContent = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(repayment);
  totalInterestEl.textContent = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(currentResult.totalInterest);
  totalRepaymentEl.textContent = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(currentResult.totalRepayment);
  timeToPayOffEl.textContent = `${currentResult.yearsToPayOff.toFixed(1)} years`;

  renderTable();
}

function renderTable() {
  if (!currentResult) return;

  const rows = amortizationTable.querySelectorAll('ui5-table-row');
  rows.forEach(row => row.remove());

  const data = showFullSchedule ? currentResult.amortizationSchedule : currentResult.amortizationSchedule.slice(0, 12);

  data.forEach(entry => {
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

  loadMoreBtn.textContent = showFullSchedule ? "Show Less" : "Show Full Schedule";
}

[loanAmountInput, interestRateInput, loanTermInput, frequencySelect, offsetBalanceInput, extraRepaymentInput].forEach(el => {
  el.addEventListener("input", updateResults);
  el.addEventListener("change", updateResults);
});

loadMoreBtn.addEventListener("click", () => {
  showFullSchedule = !showFullSchedule;
  renderTable();
});

// Initial calculation
updateResults();
