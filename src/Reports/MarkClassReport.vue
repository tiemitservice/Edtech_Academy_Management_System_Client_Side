<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Class Completion Reports</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.classId" :options="classes" filter optionLabel="name" optionValue="_id" placeholder="* Select a Class" class="min-w-[200px]" />
                <Calendar v-model="filters.date" showIcon dateFormat="yy-mm-dd" placeholder="* Select a Date" class="min-w-[200px]" />
                <Button @click="applyFilters" label="Apply Filter" icon="pi pi-filter" :disabled="!filters.classId || !filters.date" />
                <Button v-if="isFilterActive" @click="clearFilters" label="Clear" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Report Display Area -->
        <div v-if="!loading">
            <!-- Initial Prompt -->
            <div v-if="!selectedReport && !searched" class="text-center p-8 bg-white rounded-lg shadow-md">
                <p class="text-gray-500">Please select a class and a date to view its completion report.</p>
            </div>

            <!-- Report Details and Table (v-else-if) -->
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
                <DataTable :value="selectedReport.student_id" showGridlines responsiveLayout="scroll" size="large" striped-rows>
                    <Column header="No." headerStyle="width: 3rem">
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>
                    <Column header="Student Name">
                        <template #body="{ data }">{{ formatStudentName(data) }}</template>
                    </Column>
                    <Column header="Gender">
                        <template #body="{ data }">{{ formatStudentInfo(data, 'gender') }}</template>
                    </Column>
                    <Column header="Phone Number">
                        <template #body="{ data }">{{ formatStudentInfo(data, 'phoneNumber') }}</template>
                    </Column>
                </DataTable>
            </div>

            <!-- No reports found message (v-else) -->
            <div v-else>
                <NotFound :message="`No completion reports found for '${formatClassName(filters.classId)}' on the selected date.`" />
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
import Calendar from 'primevue/calendar';
import Laoding from '@/views/pages/Laoding.vue';
import NotFound from '@/views/pages/NotFound.vue';

// --- DATA FETCHING ---
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('markclassreports');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const { data: sections, fetchData: fetchSections } = useFetch('sections');

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
    if (!filters.value.classId || !filters.value.date) {
        selectedReport.value = null;
        return;
    }
    const selectedDate = moment(filters.value.date);

    const dataToFilter = rawReports.value.filter((r) => r.class_id === filters.value.classId && moment(r.createdAt).isSame(selectedDate, 'day'));

    if (dataToFilter.length > 0) {
        dataToFilter.sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
        selectedReport.value = dataToFilter[0];
    } else {
        selectedReport.value = null;
    }
};

const clearFilters = () => {
    filters.value.classId = null;
    filters.value.date = null;
    selectedReport.value = null;
    searched.value = false;
};

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => moment(date).format('YYYY-MM-DD');
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
    let tableRows = report.student_id
        .map(
            (id) => `
        <tr>
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
            body { font-family: Arial, sans-serif; margin: 20px; } h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }
            @page { size: A4 portrait; }
        </style></head><body>
        <h1>Student List for ${className}</h1>
        <table><thead><tr><th>Name</th><th>Gender</th><th>Phone</th></tr></thead><tbody>${tableRows}</tbody></table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const dataToExport = report.student_id.map((id) => ({
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
    await Promise.all([fetchReports(), fetchClasses(), fetchStudents(), fetchSubjects(), fetchSections()]);
});
</script>
