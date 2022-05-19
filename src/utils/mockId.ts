export function generateMockId() {
    return `__mock-${Math.ceil(Math.random() * 100000000000)}`;
}

export function isMockId(id: string) {
    return id.startsWith('__mock-');
}
