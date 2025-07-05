<template>
    <section class="px-4 mx-auto">
        <!-- <pre>
            {{ data }}
        </pre> -->
        <div class="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Teacher Attendance</label>

            <div class="flex items-center gap-4">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText placeholder="Search by name" v-model="searchQuery" />
                </IconField>
                <Dropdown v-model="selectedPosition" filter show-clear :options="positions" option-value="_id" option-label="name" placeholder="Select a position" />
                <Dropdown v-model="selectedDepartment" filter show-clear :options="departments" option-value="_id" option-label="name" placeholder="Select a department" />
                <!-- <Button label="Add new" @click="openModal" /> -->
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2">
                    <DataTable v-if="data" :value="data" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                        <Column field="_id" header="ID" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.index + 1 }}</p>
                            </template>
                        </Column>
                        <Column field="profile" header="Profile" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex items-center space-x-3">
                                    <div class="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                        <img :src="slotProps.data?.image" :alt="slotProps.data.en_name" />
                                    </div>
                                </div>
                            </template>
                        </Column>
                        <Column field="en_name" header="Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <p>
                                        {{ slotProps.data.en_name }}
                                    </p>
                                </div>
                            </template>
                        </Column>
                        <Column field="attendance" header="Attendance" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <Tag v-if="slotProps.data.attendance === 'present'" severity="success" value="Present"></Tag>
                                    <Tag v-if="slotProps.data.attendance === 'absent'" severity="danger" value="Absent"></Tag>
                                    <Tag v-if="slotProps.data.attendance === 'late'" severity="warn" value="Late"></Tag>
                                    <Tag v-if="slotProps.data.attendance === 'permission'" severity="warn" value="Permission"></Tag>
                                    <Tag v-if="slotProps.data.attendance === null" severity="warn" value="Un Check"></Tag>
                                </div>
                            </template>
                        </Column>

                        <!-- <Column field="kh_name" header="Kh Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <p>{{ slotProps.data.kh_name }}</p>
                                </div>
                            </template>
                        </Column> -->
                        <Column field="position" header="Position" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ formatePositionById(slotProps.data.position) }}</p>
                            </template>
                        </Column>
                        <Column field="department" header="Department" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ formateDepartmentById(slotProps.data.department) }}</p>
                            </template>
                        </Column>
                        <Column field="entry_time" header="Entry Time" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.entry_time ? slotProps.data.entry_time : 'N/A' }}</p>
                            </template>
                        </Column>
                        <Column field="exit_time" header="Exit Time" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.exit_time ? slotProps.data.exit_time : 'N/A' }}</p>
                            </template>
                        </Column>
                        <Column field="note" header="Note" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.note ? slotProps.data.note : 'N/A' }}</p>
                            </template>
                        </Column>

                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button
                                        icon="pi pi-check-square
"
                                        severity="warn"
                                        rounded
                                        aria-label="Edit"
                                        @click="handleEdit(slotProps.data)"
                                    />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
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
                                    <StaffAttendanceForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <TransitionRoot appear :show="isDelete" as="template">
            <Dialog as="div" @close="handleCloseDelete" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <DeleteConfimation :deleteData="deleteData" :datatoedit="datatoedit" :collection="collection" @close="handleCloseDelete" @toast="showToast" />
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
import { ref, onMounted, computed } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import StaffAttendanceForm from '@/form/StaffAttendanceForm.vue';
import { useToast } from 'primevue';
// Modal state
const isOpen = ref(false);

const datatoedit = ref(null);
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

// Fetch staff and positions
const collection = ref('staffs');
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);
const { data: positions, loading: positionsLoading, error: positionsError, fetchData: fetchPositions } = useFetch('positions');
const { data: departments, loading: departmentLoading, error: departmentError, fetchData: fetchDepartment } = useFetch('departments');
// search
const searchQuery = ref('');

const formateDepartmentById = (id) => {
    const department = departments.value.find((item) => item._id === id);
    return department ? department.name : 'N/A';
};

const formatePositionById = (id) => {
    const position = positions.value.find((item) => item._id === id);
    return position ? position.name : 'N/A';
};

const data = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    return rawData.value?.filter((item) => {
        const matchesName = !q || item.en_name?.toLowerCase().includes(q) || item.kh_name?.toLowerCase().includes(q);

        const matchesPosition = !selectedPosition.value || item.position === selectedPosition.value;

        const matchesDepartment = !selectedDepartment.value || item.department === selectedDepartment.value;

        return matchesName && matchesPosition && matchesDepartment;
    });
});
const toast = useToast();
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
        case 'delete':
            severity = 'error';
            summary = 'Deleted Successfully';
            break;
        case 'check_fields':
            severity = 'warn';
            summary = customMessage || 'Please fill all the required fields';
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

const selectedPosition = ref(null);
const selectedDepartment = ref(null);

const isDelete = ref(false);
const deleteData = ref(null);
const handleDeleteConfirm = (id, doc) => {
    deleteData.value = id;
    isDelete.value = true;
    datatoedit.value = doc;
};

const handleCloseDelete = () => {
    isDelete.value = false;
    deleteData.value = null;
};

// Fetch data on mount
onMounted(async () => {
    await fetchData();
    await fetchPositions();
    await fetchDepartment();
    console.log('positions', positions.value);
});
</script>

<style scoped>
.dropdown {
    width: 200px;
}
</style>
