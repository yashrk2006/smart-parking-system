import type { Violation } from '../types';

export function exportViolationsCSV(violations: Violation[], zones: { id: string; name: string }[]) {
    const getZoneName = (id: string) => zones.find(z => z.id === id)?.name || 'Unknown';

    const headers = ['ID', 'Zone', 'Vehicle Number', 'Violation Type', 'Severity', 'Status', 'Fine (₹)', 'Detected At'];
    const rows = violations.map(v => [
        v.id,
        getZoneName(v.zone_id),
        v.vehicle_number || 'N/A',
        v.violation_type || 'N/A',
        v.severity,
        v.status,
        v.fine_amount.toString(),
        new Date(v.detected_at).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `violations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}
