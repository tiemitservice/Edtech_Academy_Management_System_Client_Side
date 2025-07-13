<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Book Payment Reports</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.studentId" :options="students" filter optionLabel="eng_name" optionValue="_id" placeholder="Filter by Student" showClear class="min-w-[180px]" />
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
                        <!-- <h3 class="text-lg font-semibold">Report Results</h3> -->
                        <div>
                            <Button icon="pi pi-print" class="mr-2" @click="printReport" aria-label="Print Report" />
                            <Button icon="pi pi-file-excel" @click="exportReportToExcel" aria-label="Export to Excel" />
                        </div>
                    </div>
                    <DataTable :value="filteredReports" :paginator="true" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                        <Column field="createdAt" header="Date" sortable>
                            <template #body="{ data }">{{ data.index + 1 }}</template>
                        </Column>
                        <Column field="createdAt" header="Date" sortable>
                            <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
                        </Column>
                        <Column field="student_id" header="Student" sortable>
                            <template #body="{ data }">{{ formatStudentName(data.student_id) }}</template>
                        </Column>
                        <Column field="book_id" header="Book" sortable>
                            <template #body="{ data }">{{ formatBookName(data.book_id) }}</template>
                        </Column>
                        <Column field="amount" header="Price" sortable>
                            <template #body="{ data }">${{ data.amount?.toFixed(2) }}</template>
                        </Column>
                        <Column field="discount" header="Discount (%)" sortable>
                            <template #body="{ data }">{{ data.discount }}%</template>
                        </Column>
                        <Column field="final_price" header="Final Price" sortable>
                            <template #body="{ data }">${{ data.final_price?.toFixed(2) }}</template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else>
                    <NotFound message="No book payment reports found for the selected period." />
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
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('bookpaymentreports');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: books, fetchData: fetchBooks } = useFetch('books');

// --- COMPONENT STATE ---
const filteredReports = ref([]);

// --- FILTERING LOGIC ---
const filters = ref({ studentId: null, bookId: null, day: null, month: null, year: null });
const years = ref(Array.from({ length: 10 }, (_, i) => moment().year() - 5 + i));
const months = ref(moment.months().map((m, i) => ({ name: m, value: i + 1 })));
const days = ref(Array.from({ length: 31 }, (_, i) => i + 1));

const isFilterActive = computed(() => {
    const now = moment();
    return filters.value.studentId !== null || filters.value.bookId !== null || filters.value.day !== null || filters.value.month !== now.month() + 1 || filters.value.year !== now.year();
});

const applyFilters = () => {
    let dataToFilter = [...rawReports.value];

    if (filters.value.year) dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).year() === filters.value.year);
    if (filters.value.month) dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).month() + 1 === filters.value.month);
    if (filters.value.day) dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).date() === filters.value.day);
    if (filters.value.studentId) dataToFilter = dataToFilter.filter((r) => r.student_id === filters.value.studentId);
    if (filters.value.bookId) dataToFilter = dataToFilter.filter((r) => r.book_id === filters.value.bookId);

    filteredReports.value = dataToFilter;
};

const setDefaultFilters = () => {
    const now = moment();
    filters.value.year = now.year();
    filters.value.month = now.month() + 1;
    filters.value.day = null;
    filters.value.studentId = null;
    filters.value.bookId = null;
};

const clearFilters = () => {
    setDefaultFilters();
    applyFilters();
};

watch(rawReports, applyFilters);

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => moment(date).format('YYYY-MM-DD');
const formatStudentName = (id) => students.value?.find((s) => s._id === id)?.eng_name || 'N/A';
const formatBookName = (id) => books.value?.find((b) => b._id === id)?.name || 'N/A';

// --- ACTIONS ---
const printReport = () => {
    if (!filteredReports.value.length) return;

    let tableRows = filteredReports.value
        .map(
            (r) => `
        <tr>
            <td>${formatDate(r.createdAt)}</td>
            <td>${formatStudentName(r.student_id)}</td>
            <td>${formatBookName(r.book_id)}</td>
            <td>$${r.amount?.toFixed(2)}</td>
            <td>${r.discount}%</td>
            <td>$${r.final_price?.toFixed(2)}</td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Book Payment Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; } h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }
            @page { size: A4 portrait; }
        </style></head><body>
        <h1>Book Payment Report</h1>
        <table><thead><tr><th>Date</th><th>Student</th><th>Book</th><th>Price</th><th>Discount</th><th>Final Price</th></tr></thead><tbody>${tableRows}</tbody></table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!filteredReports.value.length) return;

    const dataToExport = filteredReports.value.map((r) => ({
        Date: formatDate(r.createdAt),
        'Student Name': formatStudentName(r.student_id),
        'Book Title': formatBookName(r.book_id),
        'Original Price': r.amount,
        'Discount (%)': r.discount,
        'Final Price': r.final_price
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Book Payments');
    XLSX.writeFile(workbook, `Book_Payment_Report.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    setDefaultFilters();
    await Promise.all([fetchReports(), fetchStudents(), fetchBooks()]);
    applyFilters();
});
</script>
