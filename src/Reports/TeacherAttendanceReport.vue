<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Teacher Attendance Reports</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.teacherId" :options="teachers" filter optionLabel="en_name" optionValue="_id" placeholder="Filter by Teacher" showClear class="min-w-[180px]" />
                <Calendar v-model="filters.dateRange" selectionMode="range" showIcon dateFormat="yy-mm-dd" placeholder="Filter by Date Range" class="min-w-[220px]" />
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
                    <DataTable :value="filteredReports" :paginator="true" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                        <Column field="checking_at" header="Date" sortable>
                            <template #body="{ data }">{{ formatDate(data.checking_at) }}</template>
                        </Column>
                        <Column field="teacher_id" header="Teacher" sortable>
                            <template #body="{ data }">{{ formatTeacherName(data.teacher_id) }}</template>
                        </Column>
                        <Column field="entry_time" header="Entry Time" sortable></Column>
                        <Column field="exit_time" header="Exit Time" sortable></Column>
                        <Column field="attendance_status" header="Attendance" sortable>
                            <template #body="{ data }">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <Tag v-if="data.attendance_status === 'present'" severity="success" value="Present"></Tag>
                                    <Tag v-if="data.attendance_status === 'absent'" severity="danger" value="Absent"></Tag>
                                    <Tag v-if="data.attendance_status === 'late'" severity="warn" value="Late"></Tag>
                                    <Tag v-if="data.attendance_status === 'permission'" severity="warn" value="Permission"></Tag>
                                    <Tag v-if="data.attendance_status === null" severity="warn" value="Un Check"></Tag>
                                </div>
                            </template>
                        </Column>
                        <Column field="note" header="Note"></Column>
                    </DataTable>
                </div>
                <div v-else>
                    <NotFound message="No teacher attendance reports found for the selected period." />
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
import Calendar from 'primevue/calendar';
import Laoding from '@/views/pages/Laoding.vue';
import NotFound from '@/views/pages/NotFound.vue';
// --- DATA FETCHING ---
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('teacherattendancereports');
// Assuming your teachers are in the 'staffs' collection
const { data: teachers, fetchData: fetchTeachers } = useFetch('staffs');

// --- COMPONENT STATE ---
const filteredReports = ref([]);

// --- FILTERING LOGIC ---
const filters = ref({ teacherId: null, dateRange: null });

const isFilterActive = computed(() => {
    return filters.value.teacherId !== null || filters.value.dateRange !== null;
});

const applyFilters = () => {
    let dataToFilter = [...rawReports.value];

    // Filter by Teacher
    if (filters.value.teacherId) {
        dataToFilter = dataToFilter.filter((r) => r.teacher_id === filters.value.teacherId);
    }
    // Filter by Date Range
    if (filters.value.dateRange && filters.value.dateRange[0] && filters.value.dateRange[1]) {
        const startDate = moment(filters.value.dateRange[0]).startOf('day');
        const endDate = moment(filters.value.dateRange[1]).endOf('day');
        dataToFilter = dataToFilter.filter((r) => moment(r.checking_at).isBetween(startDate, endDate));
    }

    filteredReports.value = dataToFilter;
};

const setDefaultFilters = () => {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    filters.value.dateRange = [startOfMonth, endOfMonth];
    filters.value.teacherId = null;
};

const clearFilters = () => {
    filters.value.teacherId = null;
    filters.value.dateRange = null;
    applyFilters();
};

watch(rawReports, applyFilters);

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => (date ? moment(date).format('YYYY-MM-DD') : 'N/A');
const formatTeacherName = (id) => teachers.value?.find((t) => t._id === id)?.en_name || 'N/A';

// --- ACTIONS ---
const printReport = () => {
    if (!filteredReports.value.length) return;

    let tableRows = filteredReports.value
        .map(
            (r) => `
        <tr>
            <td>${formatDate(r.checking_at)}</td>
            <td>${formatTeacherName(r.teacher_id)}</td>
            <td>${r.entry_time || 'N/A'}</td>
            <td>${r.exit_time || 'N/A'}</td>
            <td>${r.attendance_status || 'N/A'}</td>

            <td>${r.note || ''}</td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Teacher Attendance Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; } h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }
            @page { size: A4 portrait; }
        </style></head><body>
        <h1>Teacher Attendance Report</h1>
        <table><thead><tr><th>Date</th><th>Teacher</th><th>Entry Time</th><th>Exit Time</th><th>Note</th></tr></thead><tbody>${tableRows}</tbody></table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!filteredReports.value.length) return;

    const dataToExport = filteredReports.value.map((r) => ({
        Date: formatDate(r.checking_at),
        'Teacher Name': formatTeacherName(r.teacher_id),
        'Entry Time': r.entry_time || 'N/A',
        'Exit Time': r.exit_time || 'N/A',
        Note: r.note || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teacher Attendance');
    XLSX.writeFile(workbook, `Teacher_Attendance_Report.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    setDefaultFilters();
    await Promise.all([fetchReports(), fetchTeachers()]);
    applyFilters();
});
</script>
