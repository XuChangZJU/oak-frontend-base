type A = {
    name: 'bbb'
    [k: string]: string;
};

type B = keyof A;


const b: B = 1;