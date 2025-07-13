<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Attendance Reports</label>
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
                <p class="text-gray-500">Please select a class and a date to view the attendance report.</p>
            </div>

            <!-- Report Details and Table -->
            <div v-else-if="selectedReport" class="bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-primary">{{ formatClassName(selectedReport.class_id) }}</h3>
                        <p class="text-sm text-gray-600">Subject: {{ formatSubjectName(selectedReport.subject_id) }} | Teacher: {{ formatStaffName(selectedReport.staff_id) }}</p>
                    </div>
                    <div>
                        <Button icon="pi pi-print" class="mr-2" @click="printReport" aria-label="Print Report" />
                        <Button icon="pi pi-file-excel" @click="exportReportToExcel" aria-label="Export to Excel" />
                    </div>
                </div>

                <DataTable :value="selectedReport.students" showGridlines striped-rows="true" responsiveLayout="scroll" size="large">
                    <Column header="No." headerStyle="width: 3rem">
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>
                    <Column header="Student Name">
                        <template #body="{ data }">{{ formatStudentName(data.student) }}</template>
                    </Column>
                    <Column header="Status">
                        <template #body="{ data }">
                            <span :class="getAttendanceBadge(data.attendance)">
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
            <div v-else>
                <NotFound :message="`No attendance reports found for '${formatClassName(filters.classId)}' on the selected date.`" />
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

    let dataToFilter = rawReports.value.filter((r) => r.class_id === filters.value.classId && moment(r.createdAt || r.created_at).isSame(selectedDate, 'day'));

    if (dataToFilter.length > 0) {
        // Sort by date to find the most recent report for that day
        dataToFilter.sort((a, b) => moment(b.createdAt || b.created_at).diff(moment(a.createdAt || a.created_at)));
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
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const className = formatClassName(report.class_id);
    let tableRows = report.students
        .map(
            (s) => `
        <tr>
            <td>${formatStudentName(s.student)}</td>
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
            body { font-family: Arial, sans-serif; margin: 20px; } h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }
            @page { size: A4 portrait; }
        </style></head><body>
        <h1>Attendance for ${className}</h1>
        <table><thead><tr><th>Student Name</th><th>Status</th><th>Checked At</th><th>Note</th></tr></thead><tbody>${tableRows}</tbody></table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!selectedReport.value) return;
    const report = selectedReport.value;
    const dataToExport = report.students.map((s) => ({
        'Student Name': formatStudentName(s.student),
        Status: s.attendance || 'N/A',
        'Checked At': formatDateTime(s.checking_at),
        Note: s.note || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `Attendance_${formatClassName(report.class_id)}.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    await Promise.all([fetchReports(), fetchClasses(), fetchStudents(), fetchStaff(), fetchSubjects()]);
});
</script>
