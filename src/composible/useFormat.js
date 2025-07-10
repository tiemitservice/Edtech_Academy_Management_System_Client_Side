export function formatNumber(value) {
    if (value == null || isNaN(value)) return '0';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
