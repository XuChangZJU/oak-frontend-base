export function generateMockId() {
    return `__mock-${Math.ceil(Math.random() * 100000000000)}`;
}
export function isMockId(id) {
    return id.startsWith('__mock-');
}
