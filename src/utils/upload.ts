
export class Upload {
    async uploadFile(
        file: string | File,
        name: string,
        uploadUrl: string,
        formData: Record<string, any>,
        autoInform?: boolean
    ): Promise<any> {
        console.warn('server不会调用此函数')
    }
}