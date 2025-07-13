<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Score Reports</label>
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
                <p class="text-gray-500">Please select a class and a date to view its latest score report.</p>
            </div>

            <!-- Report Details and Table -->
            <div v-else-if="selectedReport" class="py-2 bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between items-center mb-4 border-b pb-4">
                    <div>
                        <h3 class="text-xl font-bold text-primary">{{ formatClassName(selectedReport.class_id) }}</h3>
                        <p class="text-sm text-gray-600">Subject: {{ formatSubjectName(selectedReport.subject) }} | Report Date: {{ formatDate(selectedReport.createdAt) }}</p>
                    </div>
                    <div>
                        <Button icon="pi pi-print" class="mr-2" @click="printReport" aria-label="Print Report" />
                        <Button icon="pi pi-file-excel" @click="exportReportToExcel" aria-label="Export to Excel" />
                    </div>
                </div>
                <DataTable :value="selectedReport.students" showGridlines striped-rows responsiveLayout="scroll" size="large" class="text-nowrap">
                    <Column header="Student Name">
                        <template #body="{ data }">{{ formatStudentName(data.student) }}</template>
                    </Column>
                    <Column field="attendance_score" header="Attendance"></Column>
                    <Column field="class_practice" header="Practice"></Column>
                    <Column field="home_work" header="Homework"></Column>
                    <Column field="assignment_score" header="Assignment"></Column>
                    <Column field="presentation" header="Presentation"></Column>
                    <Column field="work_book" header="Workbook"></Column>
                    <Column field="revision_test" header="Revision"></Column>
                    <Column field="final_exam" header="Final Exam"></Column>
                    <Column field="total_score" header="Total" style="font-weight: bold"></Column>
                </DataTable>
            </div>

            <!-- No reports found message -->
            <div v-else>
                <NotFound :message="`No score reports found for '${formatClassName(filters.classId)}' on the selected date.`" />
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
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('scorereports');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');

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

// --- ACTIONS ---
const printReport = () => {
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const className = formatClassName(report.class_id);
    const subjectName = formatSubjectName(report.subject);
    const reportDate = formatDate(report.createdAt);

    let tableRows = '';
    report.students.forEach((s) => {
        tableRows += `
            <tr>
                <td>${formatStudentName(s.student)}</td>
                <td>${s.attendance_score}</td>
                <td>${s.class_practice}</td>
                <td>${s.home_work}</td>
                <td>${s.assignment_score}</td>
                <td>${s.presentation}</td>
                <td>${s.work_book}</td>
                <td>${s.revision_test}</td>
                <td>${s.final_exam}</td>
                <td><strong>${s.total_score}</strong></td>
            </tr>
        `;
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head><title>Score Report - ${className}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1, h2 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                th { background-color: #f2f2f2; }
                @page { size: A4 landscape; }
            </style>
            </head>
            <body>
                <h1>Score Report</h1>
                <h2>Class: ${className} | Subject: ${subjectName} | Date: ${reportDate}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Student</th><th>Attendance</th><th>Practice</th><th>Homework</th><th>Assignment</th>
                            <th>Presentation</th><th>Workbook</th><th>Revision</th><th>Final Exam</th><th>Total</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const dataToExport = report.students.map((s) => ({
        'Student Name': formatStudentName(s.student),
        Attendance: s.attendance_score,
        Practice: s.class_practice,
        Homework: s.home_work,
        Assignment: s.assignment_score,
        Presentation: s.presentation,
        Workbook: s.work_book,
        Revision: s.revision_test,
        'Final Exam': s.final_exam,
        'Total Score': s.total_score
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scores');
    XLSX.writeFile(workbook, `ScoreReport_${formatClassName(report.class_id)}.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    await Promise.all([fetchReports(), fetchClasses(), fetchStudents(), fetchSubjects()]);
});
</script>
