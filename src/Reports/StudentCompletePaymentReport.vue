<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Completed Payment Reports</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.studentId" :options="students" filter optionLabel="eng_name" optionValue="_id" placeholder="Filter by Student" showClear class="min-w-[180px]" />
                <Select v-model="filters.paymentType" :options="paymentTypes" optionLabel="name" optionValue="value" placeholder="Filter by Type" showClear class="min-w-[150px]" />
                <Calendar v-model="filters.dateRange" selectionMode="range" showIcon dateFormat="yy-mm-dd" placeholder="Filter by Date Range" class="min-w-[220px]" />
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
                        <Column field="createdAt" header="Report Date" sortable>
                            <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
                        </Column>
                        <Column field="student_id" header="Student" sortable>
                            <template #body="{ data }">{{ formatStudentName(data.student_id) }}</template>
                        </Column>
                        <Column field="payment_date" header="Payment Date" sortable>
                            <template #body="{ data }">{{ formatDate(data.payment_date) }}</template>
                        </Column>
                        <Column field="payment_type" header="Payment Type" sortable></Column>
                        <Column field="next_payment_date" header="Next Payment Date" sortable>
                            <template #body="{ data }">{{ formatDate(data.next_payment_date) }}</template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else>
                    <NotFound message="No completed payment reports found for the selected period." />
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
import Calendar from 'primevue/calendar';
import Laoding from '@/views/pages/Laoding.vue';
import NotFound from '@/views/pages/NotFound.vue';
// --- DATA FETCHING ---
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('studentcompletepaymentreports');
const { data: students, fetchData: fetchStudents } = useFetch('students');

// --- COMPONENT STATE ---
const filteredReports = ref([]);

// --- FILTERING LOGIC ---
const filters = ref({ studentId: null, paymentType: null, dateRange: null });
const paymentTypes = ref([
    { name: 'Quarter', value: 'Quarter' },
    { name: 'Monthly', value: 'Monthly' }
]);

const isFilterActive = computed(() => {
    return filters.value.studentId !== null || filters.value.paymentType !== null || filters.value.dateRange !== null;
});

const applyFilters = () => {
    let dataToFilter = [...rawReports.value];

    // Filter by Student
    if (filters.value.studentId) {
        dataToFilter = dataToFilter.filter((r) => r.student_id === filters.value.studentId);
    }
    // Filter by Payment Type
    if (filters.value.paymentType) {
        dataToFilter = dataToFilter.filter((r) => r.payment_type === filters.value.paymentType);
    }
    // Filter by Date Range
    if (filters.value.dateRange && filters.value.dateRange[0] && filters.value.dateRange[1]) {
        const startDate = moment(filters.value.dateRange[0]).startOf('day');
        const endDate = moment(filters.value.dateRange[1]).endOf('day');
        dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).isBetween(startDate, endDate));
    }

    filteredReports.value = dataToFilter;
};

const setDefaultFilters = () => {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    filters.value.dateRange = [startOfMonth, endOfMonth];
    filters.value.studentId = null;
    filters.value.paymentType = null;
};

const clearFilters = () => {
    filters.value.studentId = null;
    filters.value.paymentType = null;
    filters.value.dateRange = null;
    applyFilters();
};

watch(rawReports, applyFilters);

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => (date ? moment(date).format('YYYY-MM-DD') : 'N/A');
const formatStudentName = (id) => students.value?.find((s) => s._id === id)?.eng_name || 'N/A';

// --- ACTIONS ---
const printReport = () => {
    if (!filteredReports.value.length) return;

    let tableRows = filteredReports.value
        .map(
            (r) => `
        <tr>
            <td>${formatDate(r.createdAt)}</td>
            <td>${formatStudentName(r.student_id)}</td>
            <td>${formatDate(r.payment_date)}</td>
            <td>${r.payment_type || 'N/A'}</td>
            <td>${formatDate(r.next_payment_date)}</td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Student Completed Payment Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; } h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }
            @page { size: A4 landscape; }
        </style></head><body>
        <h1>Student Completed Payment Report</h1>
        <table><thead><tr><th>Report Date</th><th>Student</th><th>Payment Date</th><th>Type</th><th>Next Payment</th></tr></thead><tbody>${tableRows}</tbody></table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!filteredReports.value.length) return;

    const dataToExport = filteredReports.value.map((r) => ({
        'Report Date': formatDate(r.createdAt),
        'Student Name': formatStudentName(r.student_id),
        'Payment Date': formatDate(r.payment_date),
        'Payment Type': r.payment_type,
        'Next Payment Date': formatDate(r.next_payment_date)
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Completed Payments');
    XLSX.writeFile(workbook, `Student_Complete_Payment_Report.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    setDefaultFilters();
    await Promise.all([fetchReports(), fetchStudents()]);
    applyFilters();
});
</script>
