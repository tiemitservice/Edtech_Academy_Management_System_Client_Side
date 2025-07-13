<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg flex-wrap">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Teacher Attendance</label>

            <div class="flex items-center gap-4 flex-wrap">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText placeholder="Search by name" v-model="searchQuery" />
                </IconField>
                <Dropdown v-model="selectedPosition" filter show-clear :options="positions" option-value="_id" option-label="name" placeholder="Select a position" />
                <Dropdown v-model="selectedDepartment" filter show-clear :options="departments" option-value="_id" option-label="name" placeholder="Select a department" />
                <Button @click="applyFilters" label="Apply Filter" icon="pi pi-filter" />
                <Button v-if="isFilterActive" @click="clearFilters" label="Clear" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div v-if="!loading" class="py-2">
                    <DataTable v-if="filteredData.length > 0" :value="filteredData" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                        <Column field="_id" header="ID" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.index + 1 }}</p>
                            </template>
                        </Column>
                        <Column field="profile" header="Profile" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex items-center space-x-3">
                                    <div class="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                        <img :src="slotProps.data?.image" :alt="slotProps.data.en_name" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/40x40/EFEFEF/A9A9A9?text=?'" />
                                    </div>
                                </div>
                            </template>
                        </Column>
                        <Column field="en_name" header="Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <p>{{ slotProps.data.en_name }}</p>
                                </div>
                            </template>
                        </Column>
                        <Column field="attendance" header="Attendance" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <Tag :severity="getAttendanceSeverity(slotProps.data.attendance)" :value="slotProps.data.attendance || 'Un-check'"></Tag>
                                </div>
                            </template>
                        </Column>
                        <Column field="position" header="Position" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ formatPositionById(slotProps.data.position) }}</p>
                            </template>
                        </Column>
                        <Column field="department" header="Department" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ formatDepartmentById(slotProps.data.department) }}</p>
                            </template>
                        </Column>
                        <Column field="entry_time" header="Entry Time" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.entry_time || 'N/A' }}</p>
                            </template>
                        </Column>
                        <Column field="exit_time" header="Exit Time" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.exit_time || 'N/A' }}</p>
                            </template>
                        </Column>
                        <Column field="note" header="Note" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.note || 'N/A' }}</p>
                            </template>
                        </Column>
                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div>
                                    <Button icon="pi pi-check-square" severity="warn" rounded @click="handleEdit(slotProps.data)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                    <div v-else>
                        <NotFound message="No staff members found matching your criteria." />
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
const filteredData = ref([]);

const isFilterActive = computed(() => {
    return searchQuery.value || selectedPosition.value || selectedDepartment.value;
});

const applyFilters = () => {
    let dataToFilter = [...rawData.value];
    const q = searchQuery.value.trim().toLowerCase();

    if (q) {
        dataToFilter = dataToFilter.filter((item) => item.en_name?.toLowerCase().includes(q) || item.kh_name?.toLowerCase().includes(q));
    }
    if (selectedPosition.value) {
        dataToFilter = dataToFilter.filter((item) => item.position === selectedPosition.value);
    }
    if (selectedDepartment.value) {
        dataToFilter = dataToFilter.filter((item) => item.department === selectedDepartment.value);
    }
    filteredData.value = dataToFilter;
};

const clearFilters = () => {
    searchQuery.value = '';
    selectedPosition.value = null;
    selectedDepartment.value = null;
    applyFilters();
};

// Watch for changes to automatically re-apply filters
watch(rawData, applyFilters, { deep: true });

// --- Helper Functions ---
const formatDepartmentById = (id) => departments.value?.find((item) => item._id === id)?.name || 'N/A';
const formatPositionById = (id) => positions.value?.find((item) => item._id === id)?.name || 'N/A';
const getAttendanceSeverity = (status) => {
    const map = { present: 'success', absent: 'danger', late: 'warning', permission: 'info' };
    return map[status] || 'secondary';
};

// --- Modal and Action Handlers ---
const showToast = (payload) => {
    const action = typeof payload === 'string' ? payload : payload.action;
    const customMessage = typeof payload === 'object' ? payload.message : null;
    const severityMap = { create: 'success', update: 'info', delete: 'error' };
    const summaryMap = { create: 'Created Successfully', update: 'Updated Successfully', delete: 'Deleted Successfully' };
    toast.add({
        severity: severityMap[action] || 'info',
        summary: summaryMap[action] || customMessage || 'Action Completed',
        life: 3000
    });
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
    applyFilters(); // Apply initial (empty) filters
});
</script>

<style scoped>
.dropdown {
    width: 200px;
}
</style>
