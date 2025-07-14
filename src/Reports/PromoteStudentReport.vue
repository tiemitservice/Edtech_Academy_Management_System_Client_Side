<template>
       
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->

        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Promotion Reports</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.classId" :options="classes" filter optionLabel="name" optionValue="_id" placeholder="* Select a Class" class="min-w-[200px]" />
                <DatePicker v-model="filters.date" placeholder="Select a Date" showIcon class="min-w-[200px]" /> <Button @click="applyFilters" label="Apply Filter" icon="pi pi-filter" :disabled="!filters.classId" />
                <Button v-if="isFilterActive" @click="clearFilters" label="Clear" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Report Display Area -->

        <div v-if="!loading">
            <!-- Initial Prompt -->

            <div v-if="!selectedReport && !searched" class="text-center p-8 bg-white rounded-lg shadow-md">
                <p class="text-gray-500">Please select a class and date, then apply filters to view the promotion report.</p>
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

                <DataTable :value="selectedReport.students" showGridlines responsiveLayout="scroll" size="large" striped-rows class="text-nowrap">
                    <Column header="No." headerStyle="width: 3rem">
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>

                    <Column header="Student Name">
                        <template #body="{ data }">{{ formatStudentName(data.student) }}</template>
                    </Column>
                </DataTable>
            </div>

            <!-- No reports found message -->

            <div v-else>    <NotFound :message="`No promotion reports found for '${formatClassName(filters.classId)}' on ${formatDate(filters.date)}.`" /></div>
        </div>

        <div v-else><Laoding /></div>
           
    </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '../composible/useFetch';
import moment from 'moment';
import * as XLSX from 'xlsx';

// Import UI components
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
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
const filters = ref({ classId: null, date: null });

const isFilterActive = computed(() => {
    return filters.value.classId !== null || filters.value.date !== null;
});

const applyFilters = () => {
    searched.value = true;
    selectedReport.value = null; // Reset previous result before applying new filters.

    // A class must be selected to apply filters.
    if (!filters.value.classId || !filters.value.date) {
        return;
    }

    // Filter reports based on the selected class AND date.
    const filteredReports = rawReports.value.filter((report) => {
        // 1. Match the class ID
        const classMatch = report.from_class_id === filters.value.classId;

        // 2. Match the date from the 'created_at' field.
        // We use moment's isSame() to check if the dates fall on the same day, ignoring time.
        const dateMatch = moment(report.created_at).isSame(filters.value.date, 'day');

        // A report must match both the class and the date.
        return classMatch && dateMatch;
    });

    // If we found any matching reports, sort them and select the most recent one.
    if (filteredReports.length > 0) {
        // Sort by 'created_at' in descending order (newest first)
        filteredReports.sort((a, b) => moment(b.created_at).diff(moment(a.created_at)));

        // Display the newest report that matches the criteria
        selectedReport.value = filteredReports[0];
    }
    // If filteredReports is empty, selectedReport remains null, and the "Not Found" message will be shown.
};

const setDefaultFilters = () => {
    filters.value.classId = null;
    filters.value.date = new Date(); // Default to today's date
};

const clearFilters = () => {
    filters.value.classId = null;
    filters.value.date = null;
    selectedReport.value = null;
    searched.value = false;
};

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => (date ? moment(date).format('YYYY-MM-DD') : '');
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
            (s, index) => `
        <tr>
            <td>${index + 1}</td>
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
        <table><thead><tr><th>No.</th><th>Student Name</th></tr></thead><tbody>${tableRows}</tbody></table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const dataToExport = report.students.map((s, index) => ({
        'No.': index + 1,
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
