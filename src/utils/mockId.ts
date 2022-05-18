export function generateMockId() {
    return `__mock-${Math.random()}`;
}

export function isMockId(id: string) {
    return id.startsWith('__mock-');
}
