const { parse, isValid } = require('date-fns');

const d1 = '25/3/2026';
const parsed1 = parse(d1, 'd/M/yyyy', new Date());
console.log('d1:', isValid(parsed1), parsed1);

const d2 = '2026-03-25'; // What if date picker returns this
const parsed2 = parse(d2, 'd/M/yyyy', new Date());
console.log('d2:', isValid(parsed2), parsed2);
