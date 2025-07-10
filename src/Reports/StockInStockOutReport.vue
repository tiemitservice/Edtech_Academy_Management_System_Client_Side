<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Book Stock History Report</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.bookId" :options="books" filter optionLabel="name" optionValue="_id" placeholder="Filter by Book" showClear class="min-w-[180px]" />
                <Select v-model="filters.day" :options="days" placeholder="Day" showClear class="min-w-[100px]" />
                <Select v-model="filters.month" :options="months" optionLabel="name" optionValue="value" placeholder="Month" showClear class="min-w-[120px]" />
                <Select v-model="filters.year" :options="years" placeholder="Year" showClear class="min-w-[120px]" />
                <Button @click="applyFilters" label="Apply Filter" icon="pi pi-filter" />
                <Button v-if="isFilterActive" @click="clearFilters" label="Clear" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Data Table -->
        <div class="flex flex-col" v-if="!loading">
            <div class="overflow-x-auto">
                <div v-if="filteredReports.length > 0" class="py-2 bg-white p-4 rounded-lg shadow-md">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Report Results</h3>
                        <div>
                            <Button icon="pi pi-print" class="mr-2" @click="printReport" aria-label="Print Report" />
                            <Button icon="pi pi-file-excel" @click="exportReportToExcel" aria-label="Export to Excel" />
                        </div>
                    </div>
                    <DataTable :value="filteredReports" :paginator="true" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                        <Column field="createdAt" header="Date" sortable>
                            <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
                        </Column>
                        <Column field="book_id" header="Book" sortable>
                            <template #body="{ data }">{{ formatBookName(data.book_id) }}</template>
                        </Column>
                        <Column field="stock_in" header="Stock In" sortable>
                            <template #body="{ data }">
                                <span v-if="data.stock_in" class="text-green-600 font-semibold">+{{ data.stock_in }}</span>
                            </template>
                        </Column>
                        <Column field="stock_out" header="Stock Out" sortable>
                            <template #body="{ data }">
                                <span v-if="data.stock_out" class="text-red-600 font-semibold">-{{ data.stock_out }}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else>
                    <NotFound message="No stock history found for the selected period." />
                </div>
            </div>
        </div>
        <div v-else>
            <Laoding />
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useFetch } from '../composible/useFetch';
import moment from 'moment';
import * as XLSX from 'xlsx';

// Import UI components
import Select from 'primevue/select';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import NotFound from '@/views/pages/NotFound.vue';
import Laoding from '@/views/pages/Laoding.vue';

// --- DATA FETCHING ---
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('stockhistoryreports');
const { data: books, fetchData: fetchBooks } = useFetch('books');

// --- COMPONENT STATE ---
const filteredReports = ref([]);

// --- FILTERING LOGIC ---
const filters = ref({ bookId: null, day: null, month: null, year: null });
const years = ref(Array.from({ length: 10 }, (_, i) => moment().year() - 5 + i));
const months = ref(moment.months().map((m, i) => ({ name: m, value: i + 1 })));
const days = ref(Array.from({ length: 31 }, (_, i) => i + 1));

const isFilterActive = computed(() => {
    const now = moment();
    return filters.value.bookId !== null || filters.value.day !== null || filters.value.month !== now.month() + 1 || filters.value.year !== now.year();
});

const applyFilters = () => {
    let dataToFilter = [...rawReports.value];

    if (filters.value.year) dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).year() === filters.value.year);
    if (filters.value.month) dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).month() + 1 === filters.value.month);
    if (filters.value.day) dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).date() === filters.value.day);
    if (filters.value.bookId) dataToFilter = dataToFilter.filter((r) => r.book_id === filters.value.bookId);

    filteredReports.value = dataToFilter;
};

const setDefaultFilters = () => {
    const now = moment();
    filters.value.year = now.year();
    filters.value.month = now.month() + 1;
    filters.value.day = null;
    filters.value.bookId = null;
};

const clearFilters = () => {
    setDefaultFilters();
    applyFilters();
};

watch(rawReports, applyFilters);

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => moment(date).format('YYYY-MM-DD');
const formatBookName = (id) => books.value?.find((b) => b._id === id)?.name || 'N/A';

// --- ACTIONS ---
const printReport = () => {
    if (!filteredReports.value.length) return;

    let tableRows = filteredReports.value
        .map(
            (r) => `
        <tr>
            <td>${formatDate(r.createdAt)}</td>
            <td>${formatBookName(r.book_id)}</td>
            <td>${r.stock_in || 0}</td>
            <td>${r.stock_out || 0}</td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Stock History Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; } h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }
            @page { size: A4 portrait; }
        </style></head><body>
        <h1>Stock History Report</h1>
        <table><thead><tr><th>Date</th><th>Book</th><th>Stock In</th><th>Stock Out</th></tr></thead><tbody>${tableRows}</tbody></table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!filteredReports.value.length) return;

    const dataToExport = filteredReports.value.map((r) => ({
        Date: formatDate(r.createdAt),
        'Book Title': formatBookName(r.book_id),
        'Stock In': r.stock_in || 0,
        'Stock Out': r.stock_out || 0
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock History');
    XLSX.writeFile(workbook, `Stock_History_Report.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    setDefaultFilters();
    await Promise.all([fetchReports(), fetchBooks()]);
    applyFilters();
});
</script>
