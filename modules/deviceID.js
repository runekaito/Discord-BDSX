exports.parse = did => {
    let d = String(did).toLowerCase();
    if (d.length === 36) {
        return d;
    } else if (d.length === 32) {
        const l = [d.slice(0,8),d.slice(8,12),d.slice(12,16),d.slice(16,20),d.slice(20)];
        d = l.join("-");
        return d;
    } else {
        return undefined;
    }
}