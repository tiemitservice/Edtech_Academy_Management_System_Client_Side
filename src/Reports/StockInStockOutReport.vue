<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('book_stock_report.title') }}</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.period" :options="periodOptions" optionLabel="label" optionValue="value" class="min-w-[180px]" />
                <Select v-model="filters.categoryId" :options="bookCategories" filter optionLabel="name" optionValue="_id" :placeholder="$t('book_stock_report.filter_by_category')" showClear class="min-w-[180px]" />
                <Select v-model="filters.bookId" :options="books" filter optionLabel="name" optionValue="_id" :placeholder="$t('book_stock_report.filter_by_book')" showClear class="min-w-[180px]" />
                <Button @click="applyFilters" :label="$t('element.filter')" icon="pi pi-filter" />
                <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Data Table -->
        <div class="flex flex-col" v-if="!loading">
            <div class="overflow-x-auto">
                <div v-if="filteredReports.length > 0" class="py-2 bg-white p-4 rounded-lg shadow-md">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">{{ $t('book_stock_report.report_results') }}</h3>
                        <div>
                            <Button icon="pi pi-print" class="mr-2" @click="printReport" :aria-label="$t('student_promotion_report.print_report')" />
                            <Button icon="pi pi-file-excel" @click="exportReportToExcel" :aria-label="$t('student_promotion_report.export_excel')" />
                        </div>
                    </div>
                    <DataTable :value="filteredReports" :paginator="true" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                        <Column field="displayIndex" :header="$t('element.num')" sortable style="min-width: 80px"></Column>
                        <Column field="createdAt" :header="$t('book_stock_report.date')" sortable>
                            <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
                        </Column>
                        <Column field="book_id" :header="$t('book_stock_report.book')" sortable>
                            <template #body="{ data }">{{ formatBookName(data.book_id) }}</template>
                        </Column>
                        <Column field="stock_in" :header="$t('book_stock_report.stock_in')" sortable>
                            <template #body="{ data }">
                                <span v-if="data.stock_in" class="text-green-600 font-semibold">+{{ data.stock_in }}</span>
                            </template>
                        </Column>
                        <Column field="stock_out" :header="$t('book_stock_report.stock_out')" sortable>
                            <template #body="{ data }">
                                <span v-if="data.stock_out" class="text-red-600 font-semibold">-{{ data.stock_out }}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else>
                    <NotFound :message="$t('book_stock_report.no_reports_found')" />
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
const { data: companies, fetchData: fetchCompany } = useFetch('companies');
const { data: bookCategories, fetchData: fetchBookCategories } = useFetch('book_categories');

// --- COMPONENT STATE ---
const filteredReports = ref([]);

// --- FILTERING LOGIC ---
const filters = ref({ bookId: null, period: 'current_month', categoryId: null });

const periodOptions = ref([
    { label: 'Current Month', value: 'current_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: 'last_3_months' }
]);

const isFilterActive = computed(() => {
    return filters.value.bookId !== null || filters.value.period !== 'current_month' || filters.value.categoryId !== null;
});

const applyFilters = () => {
    let dataToFilter = [...rawReports.value];

    // Time-based filtering
    const now = moment();
    switch (filters.value.period) {
        case 'current_month':
            dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).isSame(now, 'month'));
            break;
        case 'last_month':
            const lastMonth = now.clone().subtract(1, 'month');
            dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).isSame(lastMonth, 'month'));
            break;
        case 'last_3_months':
            const threeMonthsAgo = now.clone().subtract(3, 'months');
            dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).isAfter(threeMonthsAgo));
            break;
    }

    // Filter by category
    if (filters.value.categoryId) {
        const bookIdsInCategory = books.value.filter((book) => book.bookType === filters.value.categoryId).map((book) => book._id);

        dataToFilter = dataToFilter.filter((report) => bookIdsInCategory.includes(report.book_id));
    }

    // Filter by specific book
    if (filters.value.bookId) {
        dataToFilter = dataToFilter.filter((r) => r.book_id === filters.value.bookId);
    }

    filteredReports.value = dataToFilter.map((item, index) => ({
        ...item,
        displayIndex: index + 1
    }));
};

const setDefaultFilters = () => {
    filters.value.period = 'current_month';
    filters.value.bookId = null;
    filters.value.categoryId = null;
};

const clearFilters = () => {
    setDefaultFilters();
    applyFilters();
};

watch(rawReports, applyFilters, { deep: true });

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => moment(date).format('YYYY-MM-DD');
const formatBookName = (id) => books.value?.find((b) => b._id === id)?.name || 'N/A';

// --- ACTIONS ---
const printReport = () => {
    if (!filteredReports.value.length) return;

    const schoolName = companies.value?.[0]?.name || 'School Management System';
    const reportDate = moment().format('DD-MMM-YYYY');
    let dateRangeString = filters.value.period.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    let tableRows = filteredReports.value
        .map(
            (r) => `
        <tr>
            <td>${r.displayIndex}</td>
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
        <html><head><title>Book Stock History Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .report-header { text-align: center; margin-bottom: 20px; }
            .report-header h1 { margin: 0; font-size: 24px; }
            .report-header p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }
            @page { size: A4 portrait; }
        </style></head><body>
        <div class="report-header">
            <h1>${schoolName}</h1>
            <p><strong>Book Stock History Report</strong></p>
            <p><strong>Period:</strong> ${dateRangeString}</p>
            <p><em>Generated on: ${reportDate}</em></p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Date</th>
                    <th>Book</th>
                    <th>Stock In</th>
                    <th>Stock Out</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!filteredReports.value.length) return;

    const dataToExport = filteredReports.value.map((r) => ({
        'No.': r.displayIndex,
        Date: formatDate(r.createdAt),
        'Book Title': formatBookName(r.book_id),
        'Stock In': r.stock_in || 0,
        'Stock Out': r.stock_out || 0
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock History');
    XLSX.writeFile(workbook, `Book_Stock_History_Report.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    setDefaultFilters();
    await Promise.all([fetchReports(), fetchBooks(), fetchCompany(), fetchBookCategories()]);
    applyFilters();
});
</script>
