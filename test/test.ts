import { unset } from 'lodash';

const test = [, 'xc', 1234];
unset(test, 1);
console.log(test[1]);

console.log('xc'.lastIndexOf('.'));
