function setState<T extends Record<string, any>>(data: Partial<{ name: string, age: number } & T>) {
    console.log(data);
}

setState({
    name: 'xc',
})