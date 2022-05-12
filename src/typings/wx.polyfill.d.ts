/// <reference path="../../node_modules/@types/wechat-miniprogram/lib.wx.component.d.ts" />

// 这样写就是不行，必须要写到platform/wechatMp/index.ts中去，不知道为什么……
declare namespace OakMiniprogram {
    type OakOptions<
        TData extends DataOption,
        FormedData extends DataOption,
        TProperty extends PropertyOption,
        TMethod extends MethodOption,
        TCustomInstanceProperty extends IAnyObject = {},
        TIsPage extends boolean = false
        > = Partial<Data<TData>> &
        Partial<Property<TProperty>> &
        Partial<Method<TMethod, TIsPage>> &
        Partial<OtherOption> &
        Partial<Lifetimes> &
        ThisType<
            Instance<
                TData & FormedData,
                TProperty,
                TMethod,
                TCustomInstanceProperty,
                TIsPage
            >
        >
}