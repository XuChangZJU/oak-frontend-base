/// <reference path="../../node_modules/@types/wechat-miniprogram/lib.wx.component.d.ts" />

declare namespace WechatMiniprogram.Component {
    type OakOptions<
        TData extends DataOption,
        FormedData extends DataOption,
        TProperty extends PropertyOption,
        TMethod extends MethodOption,
        TCustomInstanceProperty extends IAnyObject = {},
        TIsPage extends boolean = false
        > = Partial<Data<TData & FormedData>> &
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