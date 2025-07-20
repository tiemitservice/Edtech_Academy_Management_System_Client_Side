<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('student_score_report.title') }}</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.year" :options="academicYears" :placeholder="`* ${$t('student_score_report.select_year')}`" class="min-w-[200px]" />
                <Select v-model="filters.durationId" :options="durations" optionLabel="duration" optionValue="_id" :placeholder="`* ${$t('student_score_report.select_duration')}`" class="min-w-[200px]" />
                <Select v-model="filters.classId" :options="filteredClasses" :disabled="!filters.durationId" optionLabel="name" optionValue="_id" :placeholder="`* ${$t('student_score_report.select_class')}`" class="min-w-[200px]" />
                <Button @click="applyFilters" :label="$t('element.filter')" icon="pi pi-filter" :disabled="!filters.classId" />
                <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Report Display Area -->
        <div v-if="!loading">
            <!-- Initial Prompt -->
            <div v-if="!selectedReport && !searched" class="text-center p-8 bg-white rounded-lg shadow-md">
                <p class="text-gray-500">{{ $t('student_score_report.initial_prompt') }}</p>
            </div>

            <!-- Report Details and Table -->
            <div v-else-if="selectedReport" class="py-2 bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between items-center mb-4 border-b pb-4">
                    <div>
                        <h3 class="text-xl font-bold text-primary">{{ formatClassName(selectedReport.class_id) }}</h3>
                        <p class="text-sm text-gray-600">{{ $t('student_score_report.subject') }}: {{ formatSubjectName(selectedReport.subject) }} | {{ $t('student_score_report.report_date') }}: {{ formatDate(selectedReport.createdAt) }}</p>
                    </div>
                    <div>
                        <Button icon="pi pi-print" class="mr-2" @click="printReport" :aria-label="$t('student_score_report.print_full_report')" v-tooltip.top="$t('student_score_report.print_full_report')" />
                        <Button icon="pi pi-file-excel" @click="exportReportToExcel" :aria-label="$t('student_score_report.export_excel')" v-tooltip.top="$t('student_score_report.export_excel')" />
                    </div>
                </div>
                <DataTable :value="selectedReport.students" showGridlines striped-rows responsiveLayout="scroll" size="large" class="text-nowrap">
                    <!-- Row Number -->
                    <Column :header="$t('element.num')">
                        <template #body="slotProps">
                            {{ slotProps.index + 1 }}
                        </template>
                    </Column>

                    <!-- Student Name -->
                    <Column :header="$t('student_score_report.student_name')">
                        <template #body="{ data }">
                            {{ formatStudentName(data.student) }}
                        </template>
                    </Column>

                    <!-- Scores -->
                    <Column field="attendance_score" :header="$t('student_score_report.attendance_score')" />
                    <Column field="class_practice" :header="$t('student_score_report.practice')" />
                    <Column field="home_work" :header="$t('student_score_report.home_work')" />
                    <Column field="assignment_score" :header="$t('student_score_report.assigment_score')" />
                    <Column field="presentation" :header="$t('student_score_report.prentation')" />
                    <Column field="work_book" :header="$t('student_score_report.work_book')" />
                    <Column field="revision_test" :header="$t('student_score_report.revision')" />
                    <Column field="final_exam" :header="$t('student_score_report.final_exam')" />
                    <Column field="total_score" :header="$t('student_score_report.total')" style="font-weight: bold" />

                    <!-- Action Buttons -->
                    <Column :header="$t('element.action')" style="width: 8rem; text-align: center">
                        <template #body="{ data }">
                            <Button icon="pi pi-print" class="p-button-rounded" @click="printStudentReport(data)" v-tooltip.top="$t('student_score_report.print_student_report')" />
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- No reports found message -->
            <div v-else-if="searched">
                <NotFound :message="$t('student_score_report.no_reports_found')" />
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
import Laoding from '@/views/pages/Laoding.vue';
import NotFound from '@/views/pages/NotFound.vue';

// --- Constants ---
const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/112x112/e2e8f0/718096?text=No+Image';

// --- Data Fetching ---
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('scorereports');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const { data: companies, fetchData: fetchCompany } = useFetch('companies');
const { data: staffs, fetchData: fetchStaffs } = useFetch('staffs');
const { data: durations, fetchData: fetchDurations } = useFetch('sections'); // Fetching duration from sections collection

// --- Component State ---
const selectedReport = ref(null);
const searched = ref(false);
const filters = ref({ year: null, classId: null, durationId: null });
const academicYears = ref([]);

// --- Watchers ---
// When the year changes, clear the previous report
watch(
    () => filters.value.year,
    () => {
        selectedReport.value = null;
        searched.value = false;
    }
);

// When the duration changes, reset the class filter and clear the report
watch(
    () => filters.value.durationId,
    () => {
        filters.value.classId = null;
        selectedReport.value = null;
        searched.value = false;
    }
);

// --- Computed Properties ---
const isFilterActive = computed(() => {
    return filters.value.year !== null || filters.value.classId !== null || filters.value.durationId !== null;
});

const filteredClasses = computed(() => {
    if (!filters.value.durationId || !classes.value) {
        return [];
    }
    // Filter classes that are scheduled for the selected duration
    return classes.value.filter((c) => c.duration === filters.value.durationId);
});

// --- Formatting Functions ---
const formatDate = (date) => moment(date).format('YYYY-MM-DD');
const formatYear = (date) => moment(date).format('YYYY');
const formatClassName = (id) => classes.value?.find((c) => c._id === id)?.name || 'N/A';
const formatStudentName = (id) => students.value?.find((s) => s._id === id)?.eng_name || 'N/A';
const formatSubjectName = (id) => subjects.value?.find((s) => s._id === id)?.name || 'N/A';
const formatStaffName = (id) => staffs.value?.find((s) => s._id === id)?.name || 'N/A';
const formatDurationName = (id) => durations.value?.find((d) => d._id === id)?.duration || 'N/A';

// --- Filtering Logic ---
const applyFilters = () => {
    searched.value = true;
    if (!filters.value.classId || !filters.value.durationId || !filters.value.year) {
        selectedReport.value = null;
        return;
    }

    const startYear = parseInt(filters.value.year.split('-')[0]);

    const reportsForCriteria = rawReports.value.filter((r) => moment(r.createdAt).year() === startYear && r.class_id === filters.value.classId && r.duration === filters.value.durationId);

    if (reportsForCriteria.length > 0) {
        // Get the most recent report from the filtered set
        reportsForCriteria.sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
        selectedReport.value = reportsForCriteria[0];
    } else {
        selectedReport.value = null;
    }
};

const clearFilters = () => {
    filters.value.year = null;
    filters.value.classId = null;
    filters.value.durationId = null;
    selectedReport.value = null;
    searched.value = false;
};

// --- HTML Generation for Printing ---

/**
 * Generates the HTML content for a single student's report card.
 * @param {object} studentInfo - The full student object.
 * @param {object} classData - The full class object.
 * @param {object} scoreData - The student's score data for the report.
 * @returns {string} The complete HTML string for the report.
 */
const generateStudentReportHtml = (studentInfo, classData, scoreData) => {
    const studentImage = studentInfo.image || PLACEHOLDER_IMAGE_URL;

    const scores = [
        { label: 'វត្តមាន', value: scoreData.attendance_score },
        { label: 'ការអនុវត្តក្នុងថ្នាក់', value: scoreData.class_practice },
        { label: 'កិច្ចការ​ផ្ទះ', value: scoreData.home_work },
        { label: 'កិច្ចការចាត់តាំង', value: scoreData.assignment_score },
        { label: 'បទបង្ហាញ', value: scoreData.presentation },
        { label: 'សៀវភៅ​លំហាត់', value: scoreData.work_book },
        { label: 'តេស្តពង្រឹង', value: scoreData.revision_test },
        { label: 'ប្រឡង​ចុង​ឆមាស', value: scoreData.final_exam }
    ];

    const scoreRows = scores
        .map(
            (score) => `
        <tr class="border-b">
            <td class="p-3 border border-gray-400">${score.label}</td>
            <td class="p-3 border border-gray-400 text-right">${score.value}</td>
        </tr>
    `
        )
        .join('');

    // UPDATED: Improved styling and print isolation for the report card
    return `
        <html>
            <head>
                <title>Student Score Report - ${studentInfo.eng_name}</title>
                <script src="https://cdn.tailwindcss.com"><\/script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body { 
                        font-family: 'Battambang', cursive, sans-serif;
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-area, #print-area * {
                            visibility: visible;
                        }
                        #print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                    }
                </style>
            </head>
            <body>
                <div id="print-area" class="p-8 font-sans">
                    <h1 class="text-2xl font-bold mb-6 text-center">លទ្ធផលការសិក្សា</h1>
                    <div class="flex items-start justify-between mb-8">
                        <div class="text-base space-y-1">
                            <p><strong>ឈ្មោះ:</strong> ${studentInfo.eng_name}</p>
                            <p><strong>ថ្នាក់:</strong> ${classData.name}</p>
                            <p><strong>ឆ្នាំ:</strong> ${filters.value.year}</p>
                        </div>
                        <div>
                            <img src="${studentImage}" alt="Student Profile" class="w-28 h-28 object-cover rounded-md border-2 border-gray-300" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE_URL}';"/>
                        </div>
                    </div>
                    <table class="w-full text-left border-collapse border border-gray-400">
                        <thead>
                            <tr class="bg-gray-200 text-gray-700">
                                <th class="p-3 border border-gray-400">តាមរាងពិន្ទុ</th>
                                <th class="p-3 border border-gray-400 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${scoreRows}
                            <tr class="font-bold bg-gray-100">
                                <td class="p-3 border border-gray-400">ពិន្ទុសរុប</td>
                                <td class="p-3 border border-gray-400 text-right">${scoreData.total_score}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </body>
        </html>
    `;
};

/**
 * Generates the HTML content for a full class report.
 * @param {object} report - The full report object.
 * @returns {string} The complete HTML string for the report.
 */
const generateClassReportHtml = (report) => {
    const className = formatClassName(report.class_id);
    const subjectName = formatSubjectName(report.subject);
    const durationName = formatDurationName(report.duration);

    const tableRows = report.students
        .map(
            (s) => `
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
    `
        )
        .join('');

    return `
        <html>
            <head>
                <title>Score Report - ${className}</title>
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
                <h2>Class: ${className} | Subject: ${subjectName} | Duration: ${durationName}</h2>
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
    `;
};

// --- User Actions ---

const printStudentReport = (studentScoreData) => {
    const studentInfo = students.value?.find((s) => s._id === studentScoreData.student);
    const classData = classes.value?.find((c) => c._id === selectedReport.value.class_id);

    if (!studentInfo || !classData) {
        console.error('Student or class details not found for printing.');
        // Optionally, emit a toast notification for the user here.
        return;
    }

    const printContent = generateStudentReportHtml(studentInfo, classData, studentScoreData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    // Use a small timeout to allow fonts and images to load before printing
    setTimeout(() => {
        printWindow.print();
    }, 500);
};

const printReport = () => {
    if (!selectedReport.value) return;
    const printContent = generateClassReportHtml(selectedReport.value);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
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

// --- Lifecycle Hook ---
onMounted(async () => {
    // Generate academic year ranges
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear; year++) {
        years.push(`${year}-${year + 1}`);
    }
    academicYears.value = years;

    // Fetch all necessary data when the component is mounted
    await Promise.all([fetchReports(), fetchClasses(), fetchStudents(), fetchSubjects(), fetchStaffs(), fetchDurations()]);
});
</script>
