export declare abstract class Feature {
    callbacks: Array<() => any>;
    constructor();
    subscribe(callback: () => any): () => void;
    protected publish(): void;
    clearSubscribes(): void;
}
/**
 * 方法注解，使函数调用最后一层堆栈时唤起所有登记的回调
 * @param target
 * @param propertyName
 * @param descriptor
 */
