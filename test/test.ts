import { OakException, OakUserException } from 'oak-domain/lib/types';

const e = new OakUserException();

console.log(e instanceof OakException);
type Tessst = {
    name: string;
    no: number;
    friends?: Array<string>;
};

type Eliminate<K extends keyof Tessst = never> = Tessst & {
    [k in K]: never;
}

type TT = Eliminate<'name'>;

type Deduce<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends Array<any> ? string : number;
};

type DD = Deduce<Tessst>;
