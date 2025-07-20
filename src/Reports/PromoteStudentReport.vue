<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('student_promotion_report.title') }}</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.year" :options="academicYears" :placeholder="$t('student_promotion_report.select_year')" class="min-w-[200px]" />
                <Select v-model="filters.classId" :options="availableFromClasses" :disabled="!filters.year" filter optionLabel="name" optionValue="_id" :placeholder="$t('student_promotion_report.select_from_class')" class="min-w-[200px]" />
                <Button @click="applyFilters" :label="$t('element.filter')" icon="pi pi-filter" :disabled="!filters.classId" />
                <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Report Display Area -->
        <div v-if="!loading">
            <!-- Initial Prompt -->
            <div v-if="!selectedReport && !searched" class="text-center p-8 bg-white rounded-lg shadow-md">
                <p class="text-gray-500">{{ $t('student_promotion_report.initial_prompt') }}</p>
            </div>

            <!-- Report Details and Table -->
            <div v-else-if="selectedReport" class="py-2 bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between items-center mb-4 border-b pb-4">
                    <div>
                        <h3 class="text-xl font-bold text-primary">
                            {{ $t('student_promotion_report.report_title') }}: {{ formatClassName(selectedReport.from_class_id) }} <i class="pi pi-arrow-right mx-2"></i> {{ formatClassName(selectedReport.class_id) }}
                        </h3>
                        <p class="text-sm text-gray-600">{{ $t('student_promotion_report.report_date') }}: {{ formatDate(selectedReport.created_at) }}</p>
                    </div>
                    <div>
                        <Button icon="pi pi-print" class="mr-2" @click="printReport" :aria-label="$t('student_promotion_report.print_report')" />
                        <Button icon="pi pi-file-excel" @click="exportReportToExcel" :aria-label="$t('student_promotion_report.export_excel')" />
                    </div>
                </div>
                <DataTable :value="selectedReport.students" showGridlines responsiveLayout="scroll" size="large" striped-rows class="text-nowrap">
                    <Column :header="$t('element.num')" headerStyle="width: 3rem">
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>
                    <Column :header="$t('student.name')">
                        <template #body="{ data }">{{ formatStudentName(data.student) }}</template>
                    </Column>
                </DataTable>
            </div>

            <!-- No reports found message -->
            <div v-else-if="searched">
                <NotFound :message="$t('student_promotion_report.no_reports_found', { className: formatClassName(filters.classId) })" />
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
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('promotestudentreports');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: companies, fetchData: fetchCompany } = useFetch('companies');

// --- COMPONENT STATE ---
const selectedReport = ref(null);
const searched = ref(false);
const filters = ref({ year: null, classId: null });
const academicYears = ref([]);

// --- WATCHERS ---
watch(
    () => filters.value.year,
    () => {
        filters.value.classId = null;
        selectedReport.value = null;
        searched.value = false;
    }
);

// --- COMPUTED PROPERTIES ---
const isFilterActive = computed(() => {
    return filters.value.year !== null || filters.value.classId !== null;
});

const availableFromClasses = computed(() => {
    if (!filters.value.year || !rawReports.value || !classes.value) {
        return [];
    }
    const startYear = parseInt(filters.value.year.split('-')[0]);

    const relevantClassIds = rawReports.value.filter((report) => moment(report.created_at).year() === startYear).map((report) => report.from_class_id);

    const uniqueClassIds = [...new Set(relevantClassIds)];

    return classes.value.filter((c) => uniqueClassIds.includes(c._id));
});

// --- FILTERING LOGIC ---
const applyFilters = () => {
    searched.value = true;
    selectedReport.value = null;

    if (!filters.value.classId || !filters.value.year) {
        return;
    }

    const startYear = parseInt(filters.value.year.split('-')[0]);

    const filteredReports = rawReports.value.filter((report) => {
        const classMatch = report.from_class_id === filters.value.classId;
        const yearMatch = moment(report.created_at).year() === startYear;
        return classMatch && yearMatch;
    });

    if (filteredReports.length > 0) {
        filteredReports.sort((a, b) => moment(b.created_at).diff(moment(a.created_at)));
        selectedReport.value = filteredReports[0];
    }
};

const clearFilters = () => {
    filters.value.year = null;
    filters.value.classId = null;
    selectedReport.value = null;
    searched.value = false;
};

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => (date ? moment(date).format('YYYY-MM-DD') : '');
const formatClassName = (id) => classes.value?.find((c) => c._id === id)?.name || 'N/A';
const formatStudentName = (studentData) => {
    const studentId = typeof studentData === 'object' ? studentData?.student : studentData;
    return students.value?.find((s) => s._id === studentId)?.eng_name || 'N/A';
};

// --- ACTIONS ---
const printReport = () => {
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const fromClassName = formatClassName(report.from_class_id);
    const toClassName = formatClassName(report.class_id);
    const reportDate = formatDate(report.created_at);
    const schoolName = companies.value?.[0]?.name || 'School Management System';
    const generatedDate = moment().format('DD-MMM-YYYY');

    let tableRows = report.students
        .map(
            (s, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${formatStudentName(s)}</td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Promotion Report</title>
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
            <p><strong>Student Promotion Report</strong></p>
            <p><strong>From:</strong> ${fromClassName} &nbsp;&nbsp;&nbsp; <strong>To:</strong> ${toClassName}</p>
            <p><strong>Promotion Date:</strong> ${reportDate}</p>
            <p><em>Generated on: ${generatedDate}</em></p>
        </div>
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
        'Promoted Student': formatStudentName(s)
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Promoted Students');
    XLSX.writeFile(workbook, `Promotion_Report_${formatClassName(report.from_class_id)}.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 5; year++) {
        years.push(`${year}-${year + 1}`);
    }
    academicYears.value = years;

    await Promise.all([fetchReports(), fetchClasses(), fetchStudents(), fetchCompany()]);
});
</script>
