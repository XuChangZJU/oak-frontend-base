export declare abstract class Feature {
}
export declare function subscribe(callback: () => any): () => void;
/**
 * 方法注解，使函数调用最后一层堆栈时唤起所有登记的回调
 * @param target
 * @param propertyName
 * @param descriptor
 */
export declare function Action(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>): void;
