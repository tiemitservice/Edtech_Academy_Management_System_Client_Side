<template>
    <section class="px-4 mx-auto">
        <h2 class="text-lg font-medium text-gray-800 dark:text-white">Staffs</h2>

        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="filters.search" placeholder="Search by name" />
            </IconField>
            <div class="flex items-center gap-4">
                <Dropdown v-model="selectedPosition" filter show-clear :options="positions.data" option-value="_id" option-label="name" placeholder="Select a position" class="dropdown" />
                <Dropdown v-model="selectedDepartment" filter show-clear :options="department.data" option-value="_id" option-label="name" placeholder="Select a department" class="dropdown" />
                <div class="flex items-center gap-4">
                    <Button @click="openModal" label="Add new" />
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2">
                    <DataTable v-if="data.data" :value="data.data" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="_id" header="ID" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data._id }}</p>
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
                                    {{ slotProps.data.en_name }}
                                </div>
                            </template>
                        </Column>
                        <Column field="kh_name" header="Kh Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    {{ slotProps.data.kh_name }}
                                </div>
                            </template>
                        </Column>
                        <Column field="position" header="Position" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <h4>{{ slotProps.data.position?.name || 'N/A' }}</h4>
                            </template>
                        </Column>
                        <Column field="salary" header="Salary" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <div>${{ slotProps.data.salary }}</div>
                            </template>
                        </Column>
                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-info-circle" severity="success" rounded aria-label="Info" />
                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    <Button @click="handleDelete(slotProps.data._id)" icon="pi pi-trash" severity="danger" rounded aria-label="Delete" />
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
                            <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <Staffform :datatoedit="datatoedit" @close="handleClose" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useFetch } from '../composible/useFetch';
import socket from '@/composible/socket';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import Staffform from '@/form/Staffform.vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';

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
const { data, loading, error, fetchData, deleteData } = useFetch(collection.value);
const { data: positions, loading: positionsLoading, error: positionsError, fetchData: fetchPositions } = useFetch('positions');
const { data: department, loading: departmentLoading, error: departmentError, fetchData: fetchDepartment } = useFetch('departments');
const filters = ref({
    page: 1,
    limit: 50,
    search: '',
    searchColumn: ['en_name', 'kh_name']
});

const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const selectedPosition = ref(null);
const selectedDepartment = ref(null);
// Watch for position filter changes
watch(selectedPosition, async (newPosition) => {
    filters.value.position = newPosition || '';
    filters.value.page = 1;
    currentPage.value = 1;
    await fetchData(filters.value);
});
watch(selectedDepartment, async (newDepartment) => {
    filters.value.department = newDepartment || '';
    filters.value.page = 1;
    currentPage.value = 1;
    await fetchData(filters.value);
});
// Watch for search changes
watch(
    () => filters.value.search,
    async (newSearch) => {
        filters.value.page = 1;
        currentPage.value = 1;
        await fetchData(filters.value);
    }
);

// Handle real-time updates
const PositionFilter = ref({
    page: 1,
    limit: 50,
    search: '',
    searchColumn: ['name']
});

const filtersDepartment = ref({
    page: 1,
    limit: 50,
    search: '',
    searchColumn: ['name']
});

const handleDatabaseUpdate = async () => {
    await fetchData(filters.value);
    await fetchPositions(PositionFilter.value);
    await fetchDepartment(filtersDepartment.value);
};

const handleDelete = async (id) => {
    await deleteData(id);
    await fetchData(filters.value);
};

// Fetch data on mount
onMounted(async () => {
    socket.on('database_realTime', handleDatabaseUpdate);
    await fetchData(filters.value);
    await fetchPositions(PositionFilter.value);
    await fetchDepartment(filtersDepartment.value);
    console.log('positions', positions.value);
    if (data.value) {
        currentPage.value = data.value.currentPage;
        totalPages.value = data.value.totalPages;
        totalItems.value = data.value.totalItems;
    }
});
</script>

<style scoped>
.dropdown {
    width: 200px;
}
</style>
