import { OakException, OakUserException } from 'oak-domain/lib/types';

const e = new OakUserException();

console.log(e instanceof OakException);
