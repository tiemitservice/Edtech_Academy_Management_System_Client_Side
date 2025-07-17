<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Class Completion Reports</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.year" :options="academicYears" placeholder="* Select a Year" class="min-w-[200px]" />
                <Select v-model="filters.durationId" :options="sections" optionLabel="duration" optionValue="_id" placeholder="* Select a Duration" class="min-w-[200px]" />
                <Select v-model="filters.classId" :options="filteredClasses" :disabled="!filters.durationId" optionLabel="name" optionValue="_id" placeholder="* Select a Class" class="min-w-[200px]" />
                <Button @click="applyFilters" label="Apply Filter" icon="pi pi-filter" :disabled="!filters.classId" />
                <Button v-if="isFilterActive" @click="clearFilters" label="Clear" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Report Display Area -->
        <div v-if="!loading">
            <!-- Initial Prompt -->
            <div v-if="!selectedReport && !searched" class="text-center p-8 bg-white rounded-lg shadow-md">
                <p class="text-gray-500">Please select a year, duration, and class to view its completion report.</p>
            </div>

            <!-- Report Details and Table -->
            <div v-else-if="selectedReport" class="py-2 bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between items-center mb-4 border-b pb-4">
                    <div>
                        <h3 class="text-xl font-bold text-primary">{{ formatClassName(selectedReport.class_id) }}</h3>
                        <p class="text-sm text-gray-600">Subject: {{ formatSubjectName(selectedReport?.subject_id) }} | Duration: {{ formatDurationName(selectedReport.duration) }} | Report Date: {{ formatDate(selectedReport.createdAt) }}</p>
                    </div>
                    <div>
                        <Button icon="pi pi-print" class="mr-2" @click="printReport" aria-label="Print Report" />
                        <Button icon="pi pi-file-excel" @click="exportReportToExcel" aria-label="Export to Excel" />
                    </div>
                </div>
                <DataTable :value="tableData" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                    <Column field="displayIndex" header="No." sortable style="min-width: 80px"></Column>
                    <Column header="Student Name">
                        <template #body="{ data }">{{ formatStudentName(data.studentId) }}</template>
                    </Column>
                    <Column header="Gender">
                        <template #body="{ data }">{{ formatStudentInfo(data.studentId, 'gender') }}</template>
                    </Column>
                    <Column header="Phone Number">
                        <template #body="{ data }">{{ formatStudentInfo(data.studentId, 'phoneNumber') }}</template>
                    </Column>
                </DataTable>
            </div>

            <!-- No reports found message -->
            <div v-else-if="searched">
                <NotFound :message="`No completion reports found for the selected criteria.`" />
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
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('markclassreports');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: companies, fetchData: fetchCompany } = useFetch('companies');

// --- COMPONENT STATE ---
const selectedReport = ref(null);
const searched = ref(false);
const filters = ref({ year: null, durationId: null, classId: null });
const academicYears = ref([]);

// --- WATCHERS ---
watch(
    () => filters.value.year,
    () => {
        selectedReport.value = null;
        searched.value = false;
    }
);

watch(
    () => filters.value.durationId,
    () => {
        filters.value.classId = null;
        selectedReport.value = null;
        searched.value = false;
    }
);

// --- COMPUTED PROPERTIES ---
const isFilterActive = computed(() => {
    return filters.value.year !== null || filters.value.durationId !== null || filters.value.classId !== null;
});

const filteredClasses = computed(() => {
    if (!filters.value.durationId || !classes.value) {
        return [];
    }
    return classes.value.filter((c) => c.duration === filters.value.durationId);
});

const tableData = computed(() => {
    if (!selectedReport.value || !Array.isArray(selectedReport.value.student_id)) {
        return [];
    }
    return selectedReport.value.student_id.map((id, index) => ({
        studentId: id,
        displayIndex: index + 1
    }));
});

// --- FILTERING LOGIC ---
const applyFilters = () => {
    searched.value = true;
    if (!filters.value.year || !filters.value.durationId || !filters.value.classId) {
        selectedReport.value = null;
        return;
    }
    const startYear = parseInt(filters.value.year.split('-')[0]);

    const dataToFilter = rawReports.value.filter((r) => r.class_id === filters.value.classId && moment(r.createdAt).year() === startYear && r.duration === filters.value.durationId);

    if (dataToFilter.length > 0) {
        dataToFilter.sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
        selectedReport.value = dataToFilter[0];
    } else {
        selectedReport.value = null;
    }
};

const clearFilters = () => {
    filters.value.year = null;
    filters.value.durationId = null;
    filters.value.classId = null;
    selectedReport.value = null;
    searched.value = false;
};

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => (date ? moment(date).format('YYYY-MM-DD') : '');
const formatClassName = (id) => classes.value?.find((c) => c._id === id)?.name || 'N/A';
const formatStudentName = (id) => students.value?.find((s) => s._id === id)?.eng_name || 'N/A';
const formatSubjectName = (id) => subjects.value?.find((s) => s._id === id)?.name || 'N/A';
const formatDurationName = (id) => sections.value?.find((s) => s._id === id)?.duration || 'N/A';
const formatStudentInfo = (id, field) => students.value?.find((s) => s._id === id)?.[field] || 'N/A';

// --- ACTIONS ---
const printReport = () => {
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const className = formatClassName(report.class_id);
    const reportDate = formatDate(report.createdAt);
    const schoolName = companies.value?.[0]?.name || 'School Management System';
    const generatedDate = moment().format('DD-MMM-YYYY');

    let tableRows = report.student_id
        .map(
            (id, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${formatStudentName(id)}</td>
            <td>${formatStudentInfo(id, 'gender')}</td>
            <td>${formatStudentInfo(id, 'phoneNumber')}</td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Student List - ${className}</title>
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
            <p><strong>Class Completion Report</strong></p>
            <p><strong>Class:</strong> ${className}</p>
            <p><strong>Completion Date:</strong> ${reportDate}</p>
            <p><em>Generated on: ${generatedDate}</em></p>
        </div>
        <table><thead><tr><th>No.</th><th>Name</th><th>Gender</th><th>Phone</th></tr></thead><tbody>${tableRows}</tbody></table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const dataToExport = report.student_id.map((id, index) => ({
        'No.': index + 1,
        'Student Name': formatStudentName(id),
        Gender: formatStudentInfo(id, 'gender'),
        'Phone Number': formatStudentInfo(id, 'phoneNumber')
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `StudentList_${formatClassName(report.class_id)}.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    // Generate academic year ranges
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 5; year++) {
        years.push(`${year}-${year + 1}`);
    }
    academicYears.value = years;

    await Promise.all([fetchReports(), fetchClasses(), fetchStudents(), fetchSubjects(), fetchSections(), fetchCompany()]);
});
</script>
