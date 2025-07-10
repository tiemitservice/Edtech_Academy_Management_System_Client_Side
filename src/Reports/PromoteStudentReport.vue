<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Promotion Reports</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.classId" :options="classes" filter optionLabel="name" optionValue="_id" placeholder="* Select a Class" class="min-w-[200px]" />
                <Select v-model="filters.year" :options="years" placeholder="Year" showClear class="min-w-[120px]" />
                <Button @click="applyFilters" label="Apply Filter" icon="pi pi-filter" :disabled="!filters.classId" />
                <Button v-if="isFilterActive" @click="clearFilters" label="Clear" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Report Display Area -->
        <div v-if="!loading">
            <!-- Initial Prompt -->
            <div v-if="!selectedReport && !searched" class="text-center p-8 bg-white rounded-lg shadow-md">
                <p class="text-gray-500">Please select a class and apply filters to view its promotion report.</p>
            </div>

            <!-- Report Details and Table -->
            <div v-else-if="selectedReport" class="py-2 bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between items-center mb-4 border-b pb-4">
                    <div>
                        <h3 class="text-xl font-bold text-primary">Promotion Report: {{ formatClassName(selectedReport.from_class_id) }} <i class="pi pi-arrow-right mx-2"></i> {{ formatClassName(selectedReport.class_id) }}</h3>
                        <p class="text-sm text-gray-600">Report Date: {{ formatDate(selectedReport.created_at) }}</p>
                    </div>
                    <div>
                        <Button icon="pi pi-print" class="mr-2" @click="printReport" aria-label="Print Report" />
                        <Button icon="pi pi-file-excel" @click="exportReportToExcel" aria-label="Export to Excel" />
                    </div>
                </div>
                <DataTable :value="selectedReport.students" showGridlines responsiveLayout="scroll" size="small" class="text-nowrap">
                    <Column header="No." headerStyle="width: 3rem">
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>
                    <Column header="Student Name">
                        <template #body="{ data }">{{ formatStudentName(data.student) }}</template>
                    </Column>
                </DataTable>
            </div>

            <!-- No reports found message -->
            <div v-else>
                <NotFound :message="`No promotion reports found for '${formatClassName(filters.classId)}' in the selected year.`" />
            </div>
        </div>
        <div v-else>
            <Laoding />
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('promotestudentreports');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');

// --- COMPONENT STATE ---
const selectedReport = ref(null);
const searched = ref(false);

// --- FILTERING LOGIC ---
const filters = ref({ classId: null, year: null });
const years = ref(Array.from({ length: 10 }, (_, i) => moment().year() - 5 + i));

const isFilterActive = computed(() => {
    return filters.value.classId !== null || filters.value.year !== moment().year();
});

const applyFilters = () => {
    searched.value = true;
    if (!filters.value.classId) {
        selectedReport.value = null;
        return;
    }
    let dataToFilter = rawReports.value.filter((r) => r.from_class_id === filters.value.classId);

    if (filters.value.year) {
        dataToFilter = dataToFilter.filter((r) => moment(r.created_at).year() === filters.value.year);
    }

    if (dataToFilter.length > 0) {
        dataToFilter.sort((a, b) => moment(b.created_at).diff(moment(a.created_at)));
        selectedReport.value = dataToFilter[0];
    } else {
        selectedReport.value = null;
    }
};

const setDefaultFilters = () => {
    filters.value.classId = null;
    filters.value.year = moment().year();
};

const clearFilters = () => {
    setDefaultFilters();
    selectedReport.value = null;
    searched.value = false;
};

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => moment(date).format('YYYY-MM-DD');
const formatClassName = (id) => classes.value?.find((c) => c._id === id)?.name || 'N/A';
const formatStudentName = (studentData) => {
    const studentId = typeof studentData === 'object' ? studentData?._id : studentData;
    return students.value?.find((s) => s._id === studentId)?.eng_name || 'N/A';
};

// --- ACTIONS ---
const printReport = () => {
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const fromClassName = formatClassName(report.from_class_id);
    const toClassName = formatClassName(report.class_id);
    const reportDate = formatDate(report.created_at);

    let tableRows = report.students
        .map(
            (s) => `
        <tr>
            <td>${formatStudentName(s.student)}</td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Promotion Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; } h1, h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }
            @page { size: A4 portrait; }
        </style></head><body>
        <h1>Student Promotion Report</h1>
        <h2>From: ${fromClassName} To: ${toClassName} | Date: ${reportDate}</h2>
        <table><thead><tr><th>Student Name</th></tr></thead><tbody>${tableRows}</tbody></table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const dataToExport = report.students.map((s) => ({
        'Promoted Student': formatStudentName(s.student)
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Promoted Students');
    XLSX.writeFile(workbook, `Promotion_Report_${formatClassName(report.from_class_id)}.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    setDefaultFilters();
    await Promise.all([fetchReports(), fetchClasses(), fetchStudents()]);
});
</script>
