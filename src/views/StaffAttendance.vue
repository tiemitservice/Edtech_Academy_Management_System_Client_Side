<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg flex-wrap">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('teacher_attendance.title') }}</label>

            <div class="flex items-center gap-4 flex-wrap">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText :placeholder="$t('element.Searchbyname')" v-model="searchQuery" />
                </IconField>
                <Dropdown v-model="selectedPosition" filter show-clear :options="positions" option-value="_id" option-label="name" :placeholder="$t('staff.select_position')" />
                <Dropdown v-model="selectedDepartment" filter show-clear :options="departments" option-value="_id" option-label="name" :placeholder="$t('staff.select_department')" />
                <Button @click="applySelectFilters" :label="$t('element.filter')" icon="pi pi-filter" />
                <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" class="p-button-secondary" />
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div v-if="!loading" class="py-2">
                    <DataTable v-if="tableData.length > 0" :value="tableData" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                        <!-- No. Column -->
                        <Column field="displayId" :header="$t('element.num')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.displayId }}</p>
                            </template>
                        </Column>

                        <!-- Profile Column -->
                        <Column field="profile" :header="$t('student.profile')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex items-center space-x-3">
                                    <div class="flex items-center justify-center w-16 h-16 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                        <img :src="slotProps.data?.image" :alt="slotProps.data.en_name" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/60x60/EFEFEF/A9A9A9?text=?'" />
                                    </div>
                                </div>
                            </template>
                        </Column>

                        <!-- Name Column -->
                        <Column field="en_name" :header="$t('staff.eng_name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <p>{{ slotProps.data.en_name }}</p>
                                </div>
                            </template>
                        </Column>

                        <!-- Attendance Status Column -->
                        <Column field="attendance" :header="$t('teacher_attendance.status')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <Tag
                                        :severity="getAttendanceSeverity(slotProps.data.attendance)"
                                        :value="slotProps.data.attendance ? $t(`teacher_attendance.${slotProps.data.attendance.toLowerCase()}`) : $t('teacher_attendance.un_checked')"
                                    ></Tag>
                                </div>
                            </template>
                        </Column>

                        <!-- Position Column -->
                        <Column field="position" :header="$t('staff.positsion')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ formatPositionById(slotProps.data.position) }}</p>
                            </template>
                        </Column>

                        <!-- Department Column -->
                        <Column field="department" :header="$t('staff.department')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ formatDepartmentById(slotProps.data.department) }}</p>
                            </template>
                        </Column>

                        <!-- Entry Time Column -->
                        <Column field="entry_time" :header="$t('teacher_attendance.entry_time')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.entry_time || 'N/A' }}</p>
                            </template>
                        </Column>

                        <!-- Exit Time Column -->
                        <Column field="exit_time" :header="$t('teacher_attendance.exit_time')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.exit_time || 'N/A' }}</p>
                            </template>
                        </Column>

                        <!-- Note Column -->
                        <Column field="note" :header="$t('teacher_attendance.note')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.note || 'N/A' }}</p>
                            </template>
                        </Column>

                        <!-- Actions Column -->
                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div>
                                    <Button icon="pi pi-check-square" severity="warn" rounded @click="handleEdit(slotProps.data)" :aria-label="$t('actions.edit')" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                    <div v-else>
                        <NotFound :message="$t('teacher_attendance.no_staff_found')" />
                    </div>
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
                            <DialogPanel class="transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <div class="">
                                    <StaffAttendanceForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" @save="fetchData" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
        <Toast position="top-right" style="z-index: 999 !important" />
    </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useFetch } from '../composible/useFetch';
import { useToast } from 'primevue/usetoast';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import StaffAttendanceForm from '@/form/StaffAttendanceForm.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import { useI18n } from 'vue-i18n'; // Initialize i18n
const { t } = useI18n();
const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};

// --- Component State ---
const isOpen = ref(false);
const datatoedit = ref(null);
const collection = ref('staffs');
const toast = useToast();

// --- Data Fetching ---
const { data: rawData, loading, fetchData } = useFetch(collection.value);
const { data: positions, fetchData: fetchPositions } = useFetch('positions');
const { data: departments, fetchData: fetchDepartment } = useFetch('departments');

// --- Filtering ---
const searchQuery = ref('');
const selectedPosition = ref(null);
const selectedDepartment = ref(null);
// This holds the filters that are actively applied by the button
const activeSelectFilters = ref({ position: null, department: null });

const isFilterActive = computed(() => {
    return searchQuery.value || activeSelectFilters.value.position || activeSelectFilters.value.department;
});

// This function is triggered by the "Apply Filter" button
const applySelectFilters = () => {
    activeSelectFilters.value.position = selectedPosition.value;
    activeSelectFilters.value.department = selectedDepartment.value;
};

const clearFilters = () => {
    searchQuery.value = '';
    selectedPosition.value = null;
    selectedDepartment.value = null;
    // Also clear the active filters
    activeSelectFilters.value.position = null;
    activeSelectFilters.value.department = null;
};

// The main computed property for the table, which reacts to instant search and applied select filters
const tableData = computed(() => {
    let dataToFilter = [...rawData.value];

    // Instant search by name
    const q = searchQuery.value.trim().toLowerCase();
    if (q) {
        dataToFilter = dataToFilter.filter((item) => item.en_name?.toLowerCase().includes(q) || item.kh_name?.toLowerCase().includes(q));
    }

    // Filters applied by button
    if (activeSelectFilters.value.position) {
        dataToFilter = dataToFilter.filter((item) => item.position === activeSelectFilters.value.position);
    }
    if (activeSelectFilters.value.department) {
        dataToFilter = dataToFilter.filter((item) => item.department === activeSelectFilters.value.department);
    }

    // Add a display ID for the table view
    return dataToFilter.map((item, index) => ({
        ...item,
        displayId: index + 1
    }));
});

// --- Helper Functions ---
const formatDepartmentById = (id) => departments.value?.find((item) => item._id === id)?.name || 'N/A';
const formatPositionById = (id) => positions.value?.find((item) => item._id === id)?.name || 'N/A';
const getAttendanceSeverity = (status) => {
    const map = { present: 'success', absent: 'danger', late: 'warning', permission: 'info' };
    return map[status] || 'secondary';
};

const handleEdit = (data) => {
    datatoedit.value = data;
    openModal();
};
const handleClose = () => {
    isOpen.value = false;
    datatoedit.value = null;
    fetchData(); // Refetch data after modal closes
};
function closeModal() {
    isOpen.value = false;
    datatoedit.value = null;
}
function openModal() {
    isOpen.value = true;
}

// --- Lifecycle Hook ---
onMounted(async () => {
    await Promise.all([fetchData(), fetchPositions(), fetchDepartment()]);
});
</script>

<style scoped></style>
