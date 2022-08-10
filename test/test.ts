import { OakException } from 'oak-domain/lib/types/Exception';

const e = new OakException('ddddd');

console.log(e.name);
