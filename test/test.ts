type IsOptional<T, K extends keyof T> = { [K1 in Exclude<keyof T, K>]: T[K1] } & { K?: T[K] } extends T ? K : never
type OptionalKeys<T> = { [K in keyof T]: IsOptional<T, K> }[keyof T]

type A = {
    a: number
    b?: {
        x: string
    }
    c?:string
    d?:1
}
type RR = OptionalKeys<A> // type RR = "b" | "c"