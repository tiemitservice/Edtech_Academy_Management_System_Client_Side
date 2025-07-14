<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Permission Reports</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.studentId" :options="students" filter optionLabel="eng_name" optionValue="_id" placeholder="Filter by Student" showClear class="min-w-[180px]" />
                <Calendar v-model="filters.date" showIcon dateFormat="yy-mm-dd" placeholder="Filter by Date" class="min-w-[220px]" />
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
                    <DataTable :value="filteredReports" striped-rows="true" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                        <Column field="displayIndex" header="No." sortable style="min-width: 80px"></Column>
                        <Column field="createdAt" header="Report Date" sortable>
                            <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
                        </Column>
                        <Column field="student_id" header="Student" sortable>
                            <template #body="{ data }">{{ formatStudentName(data.student_id) }}</template>
                        </Column>
                        <Column field="reason" header="Reason" sortable></Column>
                        <Column field="permission_status" header="Status" sortable>
                            <template #body="{ data }">
                                <Tag :severity="getStatusSeverity(data.permission_status)" :value="data.permission_status"></Tag>
                            </template>
                        </Column>
                        <Column field="approve_by" header="Approved By" sortable>
                            <template #body="{ data }">{{ formatApproverName(data.approve_by) }}</template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else>
                    <NotFound message="No student permission reports found for the selected criteria." />
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
import Tag from 'primevue/tag';
import NotFound from '@/views/pages/NotFound.vue';
import Laoding from '@/views/pages/Laoding.vue';

// --- DATA FETCHING ---
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('studentpermissionreports');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: approvers, fetchData: fetchApprovers } = useFetch('staffs');
const { data: companies, fetchData: fetchCompany } = useFetch('companies');

// --- COMPONENT STATE ---
const filteredReports = ref([]);

// --- FILTERING LOGIC ---
const filters = ref({ studentId: null, date: null });

const isFilterActive = computed(() => {
    return filters.value.studentId !== null || filters.value.date !== null;
});

const applyFilters = () => {
    let dataToFilter = [...rawReports.value];

    // Filter by Student
    if (filters.value.studentId) {
        dataToFilter = dataToFilter.filter((r) => r.student_id === filters.value.studentId);
    }
    // Filter by a single day
    if (filters.value.date) {
        const selectedDate = moment(filters.value.date);
        dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).isSame(selectedDate, 'day'));
    }

    filteredReports.value = dataToFilter.map((item, index) => ({
        ...item,
        displayIndex: index + 1
    }));
};

const setDefaultFilters = () => {
    filters.value.date = new Date(); // Default to today
    filters.value.studentId = null;
};

const clearFilters = () => {
    filters.value.studentId = null;
    filters.value.date = null;
    applyFilters();
};

watch(rawReports, applyFilters);

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => (date ? moment(date).format('YYYY-MM-DD') : 'N/A');
const formatStudentName = (id) => students.value?.find((s) => s._id === id)?.eng_name || 'N/A';
const formatApproverName = (id) => approvers.value?.find((a) => a._id === id)?.en_name || 'N/A';
const getStatusSeverity = (status) => {
    const severityMap = { accepted: 'success', rejected: 'danger', pending: 'warning' };
    return severityMap[status] || 'info';
};

// --- ACTIONS ---
const printReport = () => {
    if (!filteredReports.value.length) return;

    const schoolName = companies.value?.[0]?.name || 'School Management System';
    const reportDate = moment().format('DD-MMM-YYYY');
    let dateRangeString = filters.value.date ? formatDate(filters.value.date) : 'All Time';

    let tableRows = filteredReports.value
        .map(
            (r) => `
        <tr>
            <td>${r.displayIndex}</td>
            <td>${formatDate(r.createdAt)}</td>
            <td>${formatStudentName(r.student_id)}</td>
            <td>${r.reason || ''}</td>
            <td>${r.permission_status}</td>
            <td>${formatApproverName(r.approve_by)}</td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Student Permission Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .report-header { text-align: center; margin-bottom: 20px; }
            .report-header h1 { margin: 0; font-size: 24px; }
            .report-header p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }
            @page { size: A4 landscape; }
        </style></head><body>
        <div class="report-header">
            <h1>${schoolName}</h1>
            <p><strong>Student Permission Report</strong></p>
            <p><strong>Date:</strong> ${dateRangeString}</p>
            <p><em>Generated on: ${reportDate}</em></p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Report Date</th>
                    <th>Student</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Approved By</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
};

const exportReportToExcel = () => {
    if (!filteredReports.value.length) return;

    const dataToExport = filteredReports.value.map((r) => ({
        'No.': r.displayIndex,
        'Report Date': formatDate(r.createdAt),
        'Student Name': formatStudentName(r.student_id),
        Reason: r.reason,
        Status: r.permission_status,
        'Approved By': formatApproverName(r.approve_by)
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Permissions');
    XLSX.writeFile(workbook, `Student_Permission_Report.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    setDefaultFilters();
    await Promise.all([fetchReports(), fetchStudents(), fetchApprovers(), fetchCompany()]);
    applyFilters();
});
</script>
