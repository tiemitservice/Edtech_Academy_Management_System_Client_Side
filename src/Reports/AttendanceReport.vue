<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Attendance Reports</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.year" :options="academicYears" placeholder="* Select a Year" class="min-w-[200px]" />
                <Select v-model="filters.durationId" :options="sections" optionLabel="duration" optionValue="_id" placeholder="* Select a Duration" class="min-w-[200px]" />
                <Select v-model="filters.classId" :options="filteredClasses" :disabled="!filters.durationId" optionLabel="name" optionValue="_id" placeholder="* Select a Class" class="min-w-[200px]" />
                <Calendar v-model="filters.month" view="month" dateFormat="mm/yy" placeholder="* Select a Month" class="min-w-[200px]" />
                <Calendar v-model="filters.date" showIcon dateFormat="yy-mm-dd" placeholder="* Select a Date" class="min-w-[200px]" />
                <Button @click="applyFilters" label="Apply Filter" icon="pi pi-filter" :disabled="!filters.classId || (!filters.month && !filters.date)" />
                <Button v-if="isFilterActive" @click="clearFilters" label="Clear" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Report Display Area -->
        <div v-if="!loading">
            <!-- Initial Prompt -->
            <div v-if="filteredReports.length === 0 && !searched" class="text-center p-8 bg-white rounded-lg shadow-md">
                <p class="text-gray-500">Please select filters to view the attendance report.</p>
            </div>

            <!-- Report Details and Table -->
            <div v-else-if="filteredReports.length > 0" class="bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-primary">{{ formatClassName(filters.classId) }}</h3>
                        <p class="text-sm text-gray-600">
                            <span v-if="filters.date">Date: {{ formatDate(filters.date) }}</span>
                            <span v-else>Month: {{ moment(filters.month).format('MMMM, YYYY') }}</span>
                            | Teacher: {{ formatStaffName(filteredReports[0].staff_id) }}
                        </p>
                    </div>
                    <div>
                        <Button icon="pi pi-print" class="mr-2" @click="printReport" aria-label="Print Report" />
                        <Button icon="pi pi-file-excel" @click="exportReportToExcel" aria-label="Export to Excel" />
                    </div>
                </div>

                <DataTable :value="attendanceTableData" showGridlines striped-rows="true" responsiveLayout="scroll" size="large">
                    <Column header="No." headerStyle="width: 3rem" field="displayIndex"></Column>
                    <Column header="Student Name">
                        <template #body="{ data }">{{ formatStudentName(data.student) }}</template>
                    </Column>
                    <Column header="Date" sortable>
                        <template #body="{ data }">{{ formatDate(data.reportDate) }}</template>
                    </Column>
                    <Column header="Status">
                        <template #body="{ data }">
                            <span class="capitalize" :class="getAttendanceBadge(data.attendance)">
                                {{ data.attendance || 'N/A' }}
                            </span>
                        </template>
                    </Column>
                    <Column header="Checked At">
                        <template #body="{ data }">{{ formatDateTime(data.checking_at) }}</template>
                    </Column>
                    <Column field="note" header="Note"></Column>
                </DataTable>
            </div>

            <!-- No reports found message -->
            <div v-else-if="searched">
                <NotFound :message="`No attendance reports found for '${formatClassName(filters.classId)}' for the selected period.`" />
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
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('attendancereports');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: staff, fetchData: fetchStaff } = useFetch('staffs');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: companies, fetchData: fetchCompany } = useFetch('companies');

// --- COMPONENT STATE ---
const filteredReports = ref([]);
const searched = ref(false);
const filters = ref({ year: null, durationId: null, classId: null, month: null, date: null });
const academicYears = ref([]);

// --- WATCHERS ---
watch(
    () => filters.value.year,
    () => {
        filters.value.durationId = null;
        filters.value.classId = null;
        filters.value.month = null;
        filters.value.date = null;
        filteredReports.value = [];
        searched.value = false;
    }
);

watch(
    () => filters.value.durationId,
    () => {
        filters.value.classId = null;
        filters.value.month = null;
        filters.value.date = null;
        filteredReports.value = [];
        searched.value = false;
    }
);

watch(
    () => filters.value.month,
    (newMonth) => {
        if (newMonth) {
            filters.value.date = null; // Clear date if month is selected
        }
    }
);

watch(
    () => filters.value.date,
    (newDate) => {
        if (newDate) {
            filters.value.month = null; // Clear month if date is selected
        }
    }
);

// --- COMPUTED PROPERTIES ---
const isFilterActive = computed(() => {
    return filters.value.year !== null || filters.value.durationId !== null || filters.value.classId !== null || filters.value.month !== null || filters.value.date !== null;
});

const filteredClasses = computed(() => {
    if (!filters.value.durationId || !classes.value) {
        return [];
    }
    return classes.value.filter((c) => c.duration === filters.value.durationId);
});

const attendanceTableData = computed(() => {
    if (filteredReports.value.length === 0) {
        return [];
    }
    const flatData = filteredReports.value.flatMap((report) =>
        report.students.map((student) => ({
            ...student,
            reportDate: report.createdAt || report.created_at
        }))
    );
    flatData.sort((a, b) => moment(a.reportDate).diff(moment(b.reportDate)));
    return flatData.map((item, index) => ({ ...item, displayIndex: index + 1 }));
});

// --- FILTERING LOGIC ---
const applyFilters = () => {
    searched.value = true;
    if (!filters.value.classId || (!filters.value.month && !filters.value.date)) {
        filteredReports.value = [];
        return;
    }

    const reports = rawReports.value.filter((r) => {
        const reportDate = moment(r.createdAt || r.created_at);

        // Date filter takes precedence
        if (filters.value.date) {
            return r.class_id === filters.value.classId && r.duration === filters.value.durationId && reportDate.isSame(moment(filters.value.date), 'day');
        }

        // Month filter
        if (filters.value.month) {
            const selectedMonth = moment(filters.value.month);
            const startOfMonth = selectedMonth.clone().startOf('month');
            const endOfMonth = selectedMonth.clone().endOf('month');
            return r.class_id === filters.value.classId && r.duration === filters.value.durationId && reportDate.isBetween(startOfMonth, endOfMonth, null, '[]');
        }

        return false;
    });

    reports.sort((a, b) => moment(a.createdAt || a.created_at).diff(moment(b.createdAt || b.created_at)));
    filteredReports.value = reports;
};

const clearFilters = () => {
    filters.value.year = null;
    filters.value.durationId = null;
    filters.value.classId = null;
    filters.value.month = null;
    filters.value.date = null;
    filteredReports.value = [];
    searched.value = false;
};

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => moment(date).format('YYYY-MM-DD');
const formatDateTime = (date) => (date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A');
const formatClassName = (id) => classes.value?.find((c) => c._id === id)?.name || 'N/A';
const formatStudentName = (id) => students.value?.find((s) => s._id === id)?.eng_name || 'N/A';
const formatStaffName = (id) => staff.value?.find((s) => s._id === id)?.en_name || 'N/A';
const formatSubjectName = (id) => subjects.value?.find((s) => s._id === id)?.name || 'N/A';

const getAttendanceBadge = (status) => {
    const styles = {
        present: 'bg-green-100 text-green-800',
        absent: 'bg-red-100 text-red-800',
        late: 'bg-yellow-100 text-yellow-800',
        permission: 'bg-blue-100 text-blue-800'
    };
    return [styles[status] || 'bg-gray-100 text-gray-800', 'px-2 py-1 rounded-full text-xs font-medium'];
};

// --- PRINT & EXPORT ACTIONS ---
const printReport = () => {
    if (attendanceTableData.value.length === 0) return;

    const className = formatClassName(filters.value.classId);
    const reportPeriod = filters.value.date ? formatDate(filters.value.date) : moment(filters.value.month).format('MMMM, YYYY');
    const schoolName = companies.value?.[0]?.name || 'School Management System';
    const generatedDate = moment().format('DD-MMM-YYYY');

    let tableRows = attendanceTableData.value
        .map(
            (s) => `
            <tr>
                <td>${s.displayIndex}</td>
                <td>${formatStudentName(s.student)}</td>
                <td>${formatDate(s.reportDate)}</td>
                <td>${s.attendance || 'N/A'}</td>
                <td>${formatDateTime(s.checking_at)}</td>
                <td>${s.note || ''}</td>
            </tr>
        `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
            <html><head><title>Attendance Report - ${className}</title>
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
                <p><strong>Student Attendance Report</strong></p>
                <p><strong>Class:</strong> ${className} | <strong>Period:</strong> ${reportPeriod}</p>
                <p><em>Generated on: ${generatedDate}</em></p>
            </div>
            <table><thead><tr><th>No.</th><th>Student Name</th><th>Date</th><th>Status</th><th>Checked At</th><th>Note</th></tr></thead><tbody>${tableRows}</tbody></table>
            </body></html>
        `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (attendanceTableData.value.length === 0) return;

    const reportPeriod = filters.value.date ? formatDate(filters.value.date) : moment(filters.value.month).format('MMM_YYYY');
    const dataToExport = attendanceTableData.value.map((s) => ({
        'No.': s.displayIndex,
        'Student Name': formatStudentName(s.student),
        Date: formatDate(s.reportDate),
        Status: s.attendance || 'N/A',
        'Checked At': formatDateTime(s.checking_at),
        Note: s.note || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `Attendance_${formatClassName(filters.value.classId)}_${reportPeriod}.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 5; year++) {
        years.push(`${year}-${year + 1}`);
    }
    academicYears.value = years;

    await Promise.all([fetchReports(), fetchClasses(), fetchStudents(), fetchStaff(), fetchSubjects(), fetchSections(), fetchCompany()]);
});
</script>
