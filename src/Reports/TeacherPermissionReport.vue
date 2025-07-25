<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('teacher_permission_report.title') }}</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.teacherId" :options="teachers" filter optionLabel="name" optionValue="_id" :placeholder="$t('teacher_permission_report.filter_by_teacher')" showClear class="min-w-[180px]" />
                <Calendar v-model="filters.date" showIcon dateFormat="yy-mm-dd" :placeholder="$t('teacher_permission_report.filter_by_date')" class="min-w-[220px]" />
                <Button @click="applyFilters" :label="$t('element.filter')" icon="pi pi-filter" />
                <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Data Table -->
        <div class="flex flex-col" v-if="!loading">
            <div class="overflow-x-auto">
                <div v-if="filteredReports.length > 0" class="py-2 bg-white p-4 rounded-lg shadow-md">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">{{ $t('teacher_permission_report.report_results') }}</h3>
                        <div>
                            <Button icon="pi pi-print" class="mr-2" @click="printReport" :aria-label="$t('student_promotion_report.print_report')" />
                            <Button icon="pi pi-file-excel" @click="exportReportToExcel" :aria-label="$t('student_promotion_report.export_excel')" />
                        </div>
                    </div>
                    <DataTable :value="filteredReports" :paginator="true" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                        <Column field="displayIndex" :header="$t('element.num')" sortable style="min-width: 80px"></Column>
                        <Column field="createdAt" :header="$t('teacher_permission_report.report_date')" sortable>
                            <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
                        </Column>
                        <Column field="teacher_id" :header="$t('teacher_permission_report.teacher')" sortable>
                            <template #body="{ data }">{{ formatTeacherName(data.teacher_id) }}</template>
                        </Column>
                        <Column field="reason" :header="$t('teacher_permission_report.reason')" sortable></Column>
                        <Column field="hold_date" :header="$t('teacher_permission_report.leave_dates')" sortable>
                            <template #body="{ data }">
                                <p v-if="Array.isArray(data.hold_date)">{{ data.hold_date.join(' to ') }}</p>
                            </template>
                        </Column>
                        <Column field="permission_status" class="capitalize" :header="$t('teacher_permission_report.status')" sortable>
                            <template #body="{ data }">
                                <Tag :severity="getStatusSeverity(data.permission_status)" :value="$t(`staff_permission.${data.permission_status.toLowerCase()}`)"></Tag>
                            </template>
                        </Column>
                        <Column field="note" :header="$t('teacher_permission_report.note')"></Column>
                    </DataTable>
                </div>
                <div v-else>
                    <NotFound :message="$t('teacher_permission_report.no_reports_found')" />
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
const { data: rawReports, loading, fetchData: fetchReports } = useFetch('teacherpermissionreports');
const { data: teachers, fetchData: fetchTeachers } = useFetch('users');
const { data: companies, fetchData: fetchCompany } = useFetch('companies');

// --- COMPONENT STATE ---
const filteredReports = ref([]);

// --- FILTERING LOGIC ---
const filters = ref({ teacherId: null, date: null });

const isFilterActive = computed(() => {
    return filters.value.teacherId !== null || filters.value.date !== null;
});

const applyFilters = () => {
    let dataToFilter = [...rawReports.value];

    // Filter by Teacher
    if (filters.value.teacherId) {
        dataToFilter = dataToFilter.filter((r) => r.teacher_id === filters.value.teacherId);
    }
    // Filter by a single day
    if (filters.value.date) {
        const selectedDate = moment(filters.value.date);
        dataToFilter = dataToFilter.filter((r) => moment(r.createdAt).isSame(selectedDate, 'day'));
    }

    // **MODIFIED:** Add a display index to each item for sorting
    filteredReports.value = dataToFilter.map((item, index) => ({
        ...item,
        displayIndex: index + 1
    }));
};

const setDefaultFilters = () => {
    filters.value.date = new Date(); // Default to today
    filters.value.teacherId = null;
};

const clearFilters = () => {
    filters.value.teacherId = null;
    filters.value.date = null;
    applyFilters();
};

watch(rawReports, applyFilters);

// --- HELPER & FORMATTING FUNCTIONS ---
const formatDate = (date) => (date ? moment(date).format('YYYY-MM-DD') : 'N/A');
const formatTeacherName = (id) => {
    if (!id || !teachers.value) return 'Unknown';
    const teacher = teachers.value.find((t) => t._id === id);
    return teacher ? teacher.name : 'Unknown';
};
const getStatusSeverity = (status) => {
    const severityMap = { accepted: 'success', rejected: 'danger', pending: 'warn' };
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
            <td>${formatTeacherName(r.teacher_id)}</td>
            <td>${r.reason || ''}</td>
            <td>${Array.isArray(r.hold_date) ? r.hold_date.join(' to ') : ''}</td>
            <td>${r.permission_status || ''}</td>
            <td>${r.note || ''}</td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Teacher Permission Report</title>
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
            <p><strong>Teacher Permission Report</strong></p>
            <p><strong>Date:</strong> ${dateRangeString}</p>
            <p><em>Generated on: ${reportDate}</em></p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Report Date</th>
                    <th>Teacher</th>
                    <th>Reason</th>
                    <th>Leave Dates</th>
                    <th>Status</th>
                    <th>Note</th>
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
        'Teacher Name': formatTeacherName(r.teacher_id),
        Reason: r.reason,
        'Leave Dates': Array.isArray(r.hold_date) ? r.hold_date.join(' to ') : '',
        Status: r.permission_status,
        Note: r.note || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teacher Permissions');
    XLSX.writeFile(workbook, `Teacher_Permission_Report.xlsx`);
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
    setDefaultFilters();
    await Promise.all([fetchReports(), fetchTeachers(), fetchCompany()]);
    applyFilters();
});
</script>
