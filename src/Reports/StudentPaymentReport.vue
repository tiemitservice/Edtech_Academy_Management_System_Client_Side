<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Payment Reports</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.period" :options="periodOptions" optionLabel="label" optionValue="value" class="min-w-[180px]" />
                <Select v-model="filters.studentId" :options="students" filter optionLabel="eng_name" optionValue="_id" placeholder="Filter by Student" showClear class="min-w-[180px]" />
                <Select v-model="filters.classId" :options="classes" filter optionLabel="name" optionValue="_id" placeholder="Filter by Class" showClear class="min-w-[180px]" />
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
                    <DataTable :value="filteredReports" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                        <Column field="displayIndex" header="No." sortable style="min-width: 80px"></Column>
                        <Column field="createdAt" header="Date" sortable>
                            <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
                        </Column>
                        <Column field="student_id" header="Student" sortable>
                            <template #body="{ data }">{{ formatStudentName(data.student_id) }}</template>
                        </Column>
                        <Column field="course_id" header="Class" sortable>
                            <template #body="{ data }">{{ formatClassName(data.course_id) }}</template>
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
                    <NotFound message="No student payment reports found for the selected period." />
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
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('studentpaymentreports');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: companies, fetchData: fetchCompany } = useFetch('companies');

// --- COMPONENT STATE ---
const filteredReports = ref([]);

// --- FILTERING LOGIC ---
const filters = ref({ studentId: null, classId: null, period: 'current_month' });

const periodOptions = ref([
    { label: 'Current Month', value: 'current_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: 'last_3_months' }
]);

const isFilterActive = computed(() => {
    return filters.value.studentId !== null || filters.value.classId !== null || filters.value.period !== 'current_month';
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

    // Additional filters
    if (filters.value.studentId) dataToFilter = dataToFilter.filter((r) => r.student_id === filters.value.studentId);
    if (filters.value.classId) dataToFilter = dataToFilter.filter((r) => r.course_id === filters.value.classId);

    filteredReports.value = dataToFilter.map((item, index) => ({
        ...item,
        displayIndex: index + 1
    }));
};

const setDefaultFilters = () => {
    filters.value.period = 'current_month';
    filters.value.studentId = null;
    filters.value.classId = null;
};

const clearFilters = () => {
    setDefaultFilters();
    applyFilters();
};

watch(rawReports, applyFilters, { deep: true });

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => moment(date).format('YYYY-MM-DD');
const formatStudentName = (id) => students.value?.find((s) => s._id === id)?.eng_name || 'N/A';
const formatClassName = (id) => classes.value?.find((c) => c._id === id)?.name || 'N/A';

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
            <td>${formatStudentName(r.student_id)}</td>
            <td>${formatClassName(r.course_id)}</td>
            <td>$${r.amount?.toFixed(2)}</td>
            <td>${r.discount}%</td>
            <td>$${r.final_price?.toFixed(2)}</td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Student Payment Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .report-header { text-align: center; margin-bottom: 20px; }
            .report-header h1 { margin: 0; font-size: 24px; }
            .report-header p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }
            @page { size: A4 landscape; }
        </style></head><body>
        <div class="report-header">
            <h1>${schoolName}</h1>
            <p><strong>Student Payment Report</strong></p>
            <p><strong>Period:</strong> ${dateRangeString}</p>
            <p><em>Generated on: ${reportDate}</em></p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Date</th>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Final Price</th>
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
        'Student Name': formatStudentName(r.student_id),
        'Class Name': formatClassName(r.course_id),
        'Original Price': r.amount,
        'Discount (%)': r.discount,
        'Final Price': r.final_price
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Payments');
    XLSX.writeFile(workbook, `Student_Payment_Report.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    setDefaultFilters();
    await Promise.all([fetchReports(), fetchStudents(), fetchClasses(), fetchCompany()]);
    applyFilters();
});
</script>
