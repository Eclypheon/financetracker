import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseCardsFromText } from './storage';
import { calculateCardTotals } from './calculations';
import { calculateDividendAnnual, deduplicateHoldings } from './dividendsStorage';
import { parseDigrinContent } from './dividendScraper';
import type { DividendHolding } from '../types/dividends';

const csvRow = (...cells: string[]) => cells.join(',');

test('CSV import keeps the three manual overrides apart', () => {
  const csv = [
    csvRow('Month/Year', 'Category', 'Item', 'Amount'),
    csvRow('09/26', 'Banks', 'OCBC', '24500'),
    csvRow('09/26', 'Manual Overrides', 'Manual Liquid Total', '90000'),
    csvRow('09/26', 'Manual Overrides', 'Manual Non-Liquid Total', '200000'),
    csvRow('09/26', 'Manual Overrides', 'Manual Total Assets', '290000'),
  ].join('\r\n');

  const [card] = parseCardsFromText(csv);
  assert.equal(card.manualLiquidTotal, 90000);
  assert.equal(card.manualNonLiquidTotal, 200000);
  assert.equal(card.manualTotalAssets, 290000);

  const totals = calculateCardTotals(card);
  assert.equal(totals.liquidTotal, 90000);
  assert.equal(totals.nonLiquidTotal, 200000);
  assert.equal(totals.totalAssets, 290000);
});

test('CSV import puts a custom non-liquid category in the non-liquid list', () => {
  const csv = [
    csvRow('Month/Year', 'Category', 'Item', 'Amount'),
    csvRow('09/26', 'Crypto (Non-Liquid)', 'BTC', '5000'),
    csvRow('09/26', 'Crypto (Liquid)', 'USDC', '1000'),
  ].join('\r\n');

  const [card] = parseCardsFromText(csv);
  assert.deepEqual(card.customNonLiquidCategories?.map((c) => c.name), ['Crypto']);
  assert.deepEqual(card.customLiquidCategories?.map((c) => c.name), ['Crypto']);

  const totals = calculateCardTotals(card);
  assert.equal(totals.liquidTotal, 1000);
  assert.equal(totals.nonLiquidTotal, 5000);
});

test('CSV import rejects a file with no data rows', () => {
  assert.throws(() => parseCardsFromText(csvRow('Month/Year', 'Category', 'Item', 'Amount')), /enough data rows/);
});

test('annual dividend counts a month with two payouts once per payout', () => {
  const annual = calculateDividendAnnual({
    amount: 0,
    frequency: 'quarterly',
    payoutMonths: [5, 8, 11, 2],
    shares: 1000,
    dividendPerShare: 0.1,
    monthlyDpu: { 5: 0.15, 8: 0.1, 11: 0.1, 2: 0.1 },
  });
  assert.equal(Math.round(annual * 100) / 100, 450);
});

test('annual dividend does not double count a repeated payout month', () => {
  const annual = calculateDividendAnnual({
    amount: 100,
    frequency: 'custom',
    payoutMonths: [5, 5],
  });
  assert.equal(annual, 100);
});

test('Digrin rows that pay twice in one month are summed', () => {
  const markdown = [
    '## Test Corp Dividends',
    '',
    '| Ex-dividend date | Payable date | Amount |',
    '| --- | --- | --- |',
    '| 2026-05-05 | 2026-05-25 | 0.05 SGD |',
    '| 2026-04-28 | 2026-05-10 | 0.10 SGD |',
    '| 2026-02-01 | 2026-02-20 | 0.20 SGD |',
  ].join('\n');

  const parsed = parseDigrinContent(markdown, 'TEST.SI');
  assert.ok(parsed, 'fixture should parse');
  assert.equal(parsed.months.length, 2);
  assert.equal(parsed.monthlyDpu?.[5], 0.15);
  assert.equal(parsed.annualDps, 0.35);
});

test('the same ticker in two formats collapses into one holding', () => {
  const base = {
    category: 'Banking & Financials',
    amount: 810,
    frequency: 'quarterly' as const,
    payoutMonths: [4, 8, 11],
    totalAnnualPayout: 2430,
    createdAt: 1,
  };
  const list: DividendHolding[] = [
    { ...base, id: 'a', tickerOrName: 'DBS Group Holdings (D05.SI)' },
    { ...base, id: 'b', tickerOrName: 'D05' },
  ];
  const deduped = deduplicateHoldings(list);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].id, 'a');
});
