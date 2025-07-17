<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="flex flex-col md:flex-row mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg justify-between items-center">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Scores</label>
            <div class="flex items-center gap-4">
                <div class="flex items-end gap-4 flex-wrap">
                    <!-- Filters -->
                    <div class="flex flex-col">
                        <label class="text-lg font-medium text-gray-700 mb-1"> Select a Duration <span class="text-red-500">*</span> </label>
                        <Select v-model="selectedDuration" :options="sections" option-value="_id" option-label="duration" show-clear placeholder="Select a duration" class="min-w-[180px]" />
                    </div>
                    <div class="flex flex-col">
                        <label class="text-lg font-medium text-gray-700 mb-1"> Select a class <span class="text-red-500">*</span> </label>
                        <Select v-model="classSelected" :options="filteredClassesByDuration" option-value="_id" option-label="name" show-clear placeholder="Select a class" class="min-w-[180px]" :disabled="!selectedDuration" />
                    </div>
                    <div class="flex flex-col">
                        <label class="invisible mb-1 select-none">&nbsp;</label>
                        <Button @click="() => filterData(true)" :label="apply_loading ? 'Applying...' : 'Apply filter'" :loading="apply_loading" class="text-white px-4 py-2 rounded hover:bg-blue-700 bg-blue-600" />
                    </div>
                    <div class="flex flex-col">
                        <label class="invisible mb-1 select-none">&nbsp;</label>
                        <Button v-if="isFilterActive" @click="clearFilters" label="Clear" icon="pi pi-times" class="p-button-secondary" outlined />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div v-if="!loading">
                    <div v-if="filteredData.length > 0" class="py-2 bg-white p-4 rounded-lg shadow-md">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">Filtered Class</h3>
                            <div>
                                <Button icon="pi pi-print" class="mr-2" @click="printReport" aria-label="Print Report" />
                                <Button icon="pi pi-file-excel" @click="exportReportToExcel" aria-label="Export to Excel" />
                            </div>
                        </div>
                        <DataTable :value="filteredData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                            <Column field="displayIndex" header="No." sortable style="min-width: 150px"></Column>
                            <Column field="createdAt" sortable header="Created at" style="min-width: 150px">
                                <template #body="slotProps">
                                    <p class="font-medium">{{ formatDate2(slotProps.data.createdAt) }}</p>
                                </template>
                            </Column>
                            <Column field="name" header="Name" sortable style="min-width: 200px">
                                <template #body="slotProps">
                                    <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                        {{ slotProps.data.name }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="duration" header="Duration" sortable style="min-width: 200px">
                                <template #body="slotProps">
                                    <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                        {{ formatDuration(slotProps.data?.duration) || 'N/A' }}
                                    </div>
                                </template>
                            </Column>
                            <Column header="Actions" style="min-width: 150px">
                                <template #body="slotProps">
                                    <div class="flex space-x-2">
                                        <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                    <div v-else class="w-full flex justify-center items-center bg-white p-4 rounded-lg">
                        <NotFound message="No data found for the selected criteria." />
                    </div>
                </div>
                <div v-else>
                    <Laoding />
                </div>
            </div>
        </div>

        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="handleClose" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="transform w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <div>
                                    <StudentScoreForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" @save="handleSave" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
        <Toast position="top-right" />
    </section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import { useToast } from 'primevue/usetoast';
import { formatDate2 } from '@/composible/formatDate';
import moment from 'moment';
import * as XLSX from 'xlsx';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import StudentScoreForm from '@/form/StudentScoreForm.vue';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toast from 'primevue/toast';

const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: companies, fetchData: fetchCompany } = useFetch('companies');
const toast = useToast();
const isOpen = ref(false);
const datatoedit = ref(null);
const apply_loading = ref(false);
const filteredData = ref([]);
const selectedDuration = ref(null);

const collection = ref('classes');
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);
const classSelected = ref(null);

const isFilterActive = computed(() => {
    return classSelected.value || selectedDuration.value;
});

const filteredClassesByDuration = computed(() => {
    if (!selectedDuration.value || !rawData.value) return [];
    return rawData.value.filter((cls) => cls.duration === selectedDuration.value);
});

watch(selectedDuration, () => {
    classSelected.value = null; // Reset class selection when duration changes
});

const formatDuration = (id) => {
    const section = sections.value?.find((section) => section._id === id);
    return section ? section.duration : 'N/A';
};

const filterData = (showNotification = false) => {
    apply_loading.value = true;
    const classId = classSelected.value;
    const durationId = selectedDuration.value;

    if (!classId || !durationId) {
        filteredData.value = [];
        if (showNotification) {
            showToast({ action: 'check_fields', message: 'You need to select both Duration and Class to filter' });
        }
        apply_loading.value = false;
        return;
    }

    const result =
        rawData.value?.filter((item) => {
            return item._id === classId && item.duration === durationId;
        }) || [];

    filteredData.value = result.map((item, index) => ({ ...item, displayIndex: index + 1 }));

    if (showNotification) {
        if (result.length === 0) {
            showToast({ action: 'not_found', message: 'No data matched your filter' });
        } else {
            showToast({ action: 'found', message: `Found ${result.length} result(s)` });
        }
    }

    apply_loading.value = false;
};

const clearFilters = () => {
    classSelected.value = null;
    selectedDuration.value = null;
    filteredData.value = [];
};

watch(rawData, () => filterData(false), { deep: true });

const showToast = (payload) => {
    let action = typeof payload === 'string' ? payload : payload.action;
    let customMessage = typeof payload === 'object' ? payload.message : null;
    let severity;
    let summary;

    switch (action) {
        case 'create':
            severity = 'success';
            summary = 'Created Successfully';
            break;
        case 'update':
            severity = 'info';
            summary = 'Updated Successfully';
            break;
        case 'check_fields':
            severity = 'warn';
            summary = customMessage || 'Please fill all the required fields';
            break;
        case 'not_found':
            severity = 'warn';
            summary = customMessage || 'No matching records found';
            break;
        case 'found':
            severity = 'info';
            summary = customMessage || 'Data found successfully';
            break;
        default:
            severity = 'info';
            summary = 'Action Completed';
    }
    toast.add({ severity, summary, life: 3000 });
};

const openModal = () => {
    isOpen.value = true;
};

const handleEdit = (data) => {
    datatoedit.value = data;
    openModal();
};

const handleClose = () => {
    isOpen.value = false;
    datatoedit.value = null;
};

const handleSave = () => {
    fetchData();
    closeModal();
};

const printReport = () => {
    if (!filteredData.value.length) return;

    const classToPrint = filteredData.value[0];
    const schoolName = companies.value?.[0]?.name || 'School Management System';
    const reportDate = moment().format('DD-MMM-YYYY');

    let tableRows = classToPrint.students
        .map(
            (s, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${s.student?.eng_name || 'N/A'}</td>
            <td>${s.attendance_score ?? 0}</td>
            <td>${s.class_practice ?? 0}</td>
            <td>${s.home_work ?? 0}</td>
            <td>${s.assignment_score ?? 0}</td>
            <td>${s.presentation ?? 0}</td>
            <td>${s.work_book ?? 0}</td>
            <td>${s.revision_test ?? 0}</td>
            <td>${s.final_exam ?? 0}</td>
            <td><strong>${s.total_score ?? 0}</strong></td>
        </tr>
    `
        )
        .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Student Score Report</title>
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
            <p><strong>Student Score Report for ${classToPrint.name}</strong></p>
            <p><em>Generated on: ${reportDate}</em></p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>No.</th><th>Student</th><th>Attendance</th><th>Practice</th><th>Homework</th><th>Assignment</th>
                    <th>Presentation</th><th>Workbook</th><th>Revision</th><th>Final Exam</th><th>Total</th>
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
    if (!filteredData.value.length) return;

    const classToExport = filteredData.value[0];
    const dataToExport = classToExport.students.map((s, index) => ({
        'No.': index + 1,
        'Student Name': s.student?.eng_name || 'N/A',
        Attendance: s.attendance_score ?? 0,
        Practice: s.class_practice ?? 0,
        Homework: s.home_work ?? 0,
        Assignment: s.assignment_score ?? 0,
        Presentation: s.presentation ?? 0,
        Workbook: s.work_book ?? 0,
        Revision: s.revision_test ?? 0,
        'Final Exam': s.final_exam ?? 0,
        'Total Score': s.total_score ?? 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scores');
    XLSX.writeFile(workbook, `ScoreReport_${classToExport.name}.xlsx`);
};

onMounted(async () => {
    await Promise.all([fetchData(), fetchSections(), fetchCompany()]);
});
</script>
