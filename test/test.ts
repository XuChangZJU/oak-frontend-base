function ttt(this: any) {
    console.log(this.a + this.b);
}

ttt.call({
    a: 1,
    b: 2,
});
