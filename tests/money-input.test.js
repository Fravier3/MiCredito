import test from 'node:test';import assert from 'node:assert/strict';
import {formatAmount,rawAmount} from '../src/components/money-input.js';
test('currency typing and pasted thousands preserve cents and decimal entry',()=>{
 for(const [input,expected] of [['1000','1,000'],['10000','10,000'],['1000000.25','1,000,000.25'],['1,000.','1,000.'],['0.05','0.05'],['','']])assert.equal(formatAmount(input),expected);
 assert.equal(rawAmount('10,000.25'),'10000.25');assert.equal(formatAmount('12.345'),null);assert.equal(formatAmount('-2'),null);
});
