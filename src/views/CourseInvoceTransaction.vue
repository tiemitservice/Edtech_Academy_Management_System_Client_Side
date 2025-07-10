<template>
    <section class="px-4 mx-auto">
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Class Invoice Transaction </label>
            <div class="flex items-center gap-2">
                <!-- Dropdowns for Day, Month, Year -->
                <Select v-model="selectedDay" :options="days" placeholder="Day" showClear class="min-w-[100px]" />
                <Select v-model="selectedMonth" :options="months" optionLabel="name" optionValue="value" placeholder="Month" showClear class="min-w-[120px]" />
                <Select v-model="selectedYear" :options="years" placeholder="Year" showClear class="min-w-[120px]" />

                <!-- Separate Apply and Clear Buttons -->
                <Button @click="filterData" label="Apply Filter" icon="pi pi-filter" />
                <Button v-if="isFilterActive" @click="clearFilters" label="Clear Filter" icon="pi pi-times" class="p-button-secondary" />

                <!-- <Button @click="openModal" label="Add new" class="p-button-success" /> -->
            </div>
        </div>

        <div class="flex flex-col" v-if="data">
            <div class="overflow-x-auto">
                <div class="py-2" v-if="!loading && data.length > 0">
                    <DataTable :value="data" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="_id" header="ID" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.index + 1 }}</p>
                            </template>
                        </Column>

                        <Column field="createdAt" header="createdAt" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ formatDate2(slotProps.data.createdAt) }}</p>
                            </template>
                        </Column>

                        <Column field="student_id" header="Student" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ formatStudentNestedField(slotProps.data.student_id, 'eng_name') }}</div>
                            </template>
                        </Column>

                        <Column field="course_id" header="Course" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ formatClassName(slotProps.data.course_id, 'name') }}</div>
                            </template>
                        </Column>

                        <Column field="mark_as_completed" header="Status" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <Tag :severity="slotProps.data.mark_as_completed ? 'success' : 'danger'" :value="slotProps.data.mark_as_completed ? 'Completed' : 'Pending'"></Tag>
                            </template>
                        </Column>

                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button
                                        icon="pi pi-undo
"
                                        severity="warn"
                                        rounded
                                        aria-label="Edit"
                                        @click="handleEdit(slotProps.data)"
                                    />
                                    <Button icon="pi pi-print" rounded aria-label="Edit" @click="$router.push(`/print_invoice/${slotProps.data._id}`)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else-if="!loading && data.length === 0">
                    <NotFound />
                </div>
                <div v-else>
                    <Laoding />
                </div>
            </div>
        </div>

        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="closeModal" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                                <div class="mt-2">
                                    <RemarkCoursInvoice :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
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
import RemarkCoursInvoice from '@/form/RemarkCoursInvoice.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import { useToast } from 'primevue/usetoast';
import { formatDate2 } from '@/composible/formatDate';
// PrimeVue components
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';

const collection = ref('courseinvoices');
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);
const isOpen = ref(false);
const datatoedit = ref(null);
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');

const formatClassName = (id, fieldPath, fallback = 'Unknown') => {
    const className = classes.value?.find((cl) => cl._id?.toString() === id?.toString());
    if (!className) return fallback;
    try {
        const result = fieldPath.split('.').reduce((obj, key) => obj?.[key], className);
        return Array.isArray(result) ? result.join(', ') : (result ?? fallback);
    } catch (err) {
        return fallback;
    }
};

const formatStudentNestedField = (id, fieldPath, fallback = 'Unknown') => {
    const student = students.value?.find((s) => s._id?.toString() === id?.toString());
    if (!student) return fallback;
    try {
        const result = fieldPath.split('.').reduce((obj, key) => obj?.[key], student);
        return Array.isArray(result) ? result.join(', ') : (result ?? fallback);
    } catch (err) {
        return fallback;
    }
};

const toast = useToast();
const showToast = (action, severity) => {
    let summary;
    switch (action) {
        case 'create':
            severity = 'success';
            summary = 'Created Success';
            break;
        case 'update':
            severity = 'info';
            summary = 'Updated Success';
            break;
        case 'delete':
            summary = 'Deleted Success';
            break;
        case 'asociate':
            severity = 'warn';
            summary = 'Please delete the associated data first';
            break;
        default:
            severity = 'info';
            summary = 'Action Completed';
    }
    toast.add({ severity, summary, life: 3000 });
};

const data = ref([]);
// Refs for filter dropdowns
const selectedDay = ref(null);
const selectedMonth = ref(null);
const selectedYear = ref(null);

// Options for filter dropdowns
const days = ref(Array.from({ length: 31 }, (_, i) => i + 1));
const months = ref([
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
]);
const currentYear = new Date().getFullYear();
const years = ref(Array.from({ length: 10 }, (_, i) => currentYear - 5 + i));

// A filter is considered "active" for clearing purposes only if a specific day is selected.
const isFilterActive = computed(() => {
    return selectedDay.value !== null;
});

const filterData = () => {
    loading.value = true;
    setTimeout(() => {
        let filtered = rawData.value?.filter((item) => item.mark_as_completed === true) || [];

        const yearToFilter = selectedYear.value;
        const monthToFilter = selectedMonth.value;

        filtered = filtered.filter((item) => {
            if (!item.createdAt) return false;
            const itemDate = new Date(item.createdAt);

            const matchesYear = itemDate.getFullYear() === yearToFilter;
            const matchesMonth = itemDate.getMonth() + 1 === monthToFilter;
            // If a day is selected, check it. Otherwise, this part is true.
            const matchesDay = !selectedDay.value || itemDate.getDate() === selectedDay.value;

            // If day and month are selected, year must also match.
            // If only month is selected, year must also match.
            // If only year is selected, we don't need to check month/day.
            if (selectedDay.value) {
                return matchesYear && matchesMonth && matchesDay;
            }
            if (selectedMonth.value) {
                return matchesYear && matchesMonth;
            }
            return matchesYear;
        });

        data.value = filtered;
        loading.value = false;
    }, 500);
};

const clearFilters = () => {
    // Reset only the day, keeping the default month and year
    selectedDay.value = null;
    filterData(); // Re-run the filter to show the default monthly view
};

watch(
    rawData,
    () => {
        filterData();
    },
    { deep: true }
);

const handleEdit = (data) => {
    datatoedit.value = data;
    openModal();
};
const handleClose = () => {
    isOpen.value = false;
    datatoedit.value = null;
};
function closeModal() {
    isOpen.value = false;
    datatoedit.value = null;
}
function openModal() {
    isOpen.value = true;
}

onMounted(async () => {
    await fetchClasses();
    await fetchStudents();

    // Set default filters to the current month and year
    const now = new Date();
    selectedYear.value = now.getFullYear();
    selectedMonth.value = now.getMonth() + 1; // JavaScript months are 0-indexed

    await fetchData(); // This will trigger the watcher to call filterData for the first time
});
</script>
