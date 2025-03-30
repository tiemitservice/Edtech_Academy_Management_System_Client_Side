<template>
    <section class="px-4 mx-auto">
        <h2 class="text-lg font-medium text-gray-800 dark:text-white">Classes</h2>
        <!-- <p class="mt-1 text-lg text-gray-800">Staff list</p> -->

        <div class="flex justify-between items-center mt-6 mb-4 gap-4">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="filters.search" placeholder="Search by name" />
            </IconField>
            <div class="flex items-center gap-4">
                <Button @click="openModal" label="Add new" />
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
                        <!-- Teacher -->
                        <Column field="staff" header="Teacher" style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.staff?.en_name }}</p>
                            </template>
                        </Column>
                        <Column field="en_name" header="Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    {{ slotProps.data.name }}
                                </div>
                            </template>
                        </Column>
                        <!-- start data -->
                        <Column field="start_time" header="Start Time" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    {{ slotProps.data.room?.section?.start_time || 'N/A' }}
                                </div>
                            </template>
                        </Column>
                        <Column field="end_time" header="End Time" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    {{ slotProps.data.room?.section?.end_time || 'N/A' }}
                                </div>
                            </template>
                        </Column>

                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button @click="handleClassDetails(slotProps.data)" icon="pi pi-info-circle" severity="success" rounded aria-label="Info" />
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
                                    <Classform :datatoedit="datatoedit" @close="handleClose" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
        <TransitionRoot appear :show="isClassDetails" as="template">
            <Dialog as="div" @close="handleCloseDetails" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <ClassDetails :datatoedit="datatoedit" @close="handleCloseDetails" />
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
import { useFetch } from '../composible/useFetch';
import socket from '@/composible/socket';
import ClassDetails from '@/form/ClassDetails.vue';
const collection = ref('classes');
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import Classform from '@/form/Classform.vue';
const isOpen = ref(false);
const datatoedit = ref(null);
const isClassDetails = ref(false);
const handleClassDetails = (data) => {
    datatoedit.value = data;
    isClassDetails.value = true;
};
const handleCloseDetails = () => {
    isClassDetails.value = false;
    datatoedit.value = null;
};
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
const referenceChecks = {
    staff: 'staffs', // Check the 'staff' field against the 'staffs' collection
    section: 'sections' // Check the 'section' field against the 'sections' collection
};
const { data, loading, error, fetchData, deleteData } = useFetch(collection.value, referenceChecks);
const filters = ref({
    page: 1,
    limit: 50, // Default to 10 rows
    search: '',
    searchColumn: ['name']
});
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);

// Selected rows per page, synced with filters.limit
const selectedRowsPerPage = ref(filters.value.limit);

// Watch for changes in selectedRowsPerPage to update filters.limit
watch(selectedRowsPerPage, (newValue) => {
    filters.value.limit = newValue;
    onRowsPerPageChange();
});
// Watch for search changes
watch(
    () => filters.value.search,
    async (newSearch) => {
        filters.value.page = 1; // Reset to page 1 on search
        currentPage.value = 1;
        await fetchData(filters.value);
    }
);

// Handle rows per page change
const onRowsPerPageChange = async () => {
    filters.value.page = 1; // Reset to page 1 when changing rows per page
    currentPage.value = 1;
    await fetchData(filters.value);
};

// Handle page change from Pagination component
const changePage = async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
        filters.value.page = newPage;
        currentPage.value = newPage;
        await fetchData(filters.value);
    }
};

// Handle real-time updates
const handleDatabaseUpdate = async () => {
    await fetchData(filters.value);
};
const handleDelete = async (id) => {
    await deleteData(id);
    await fetchData(filters.value);
};
onMounted(async () => {
    socket.on('database_realTime', handleDatabaseUpdate);
    await fetchData(filters.value);
    if (data.value) {
        currentPage.value = data.value.currentPage;
        totalPages.value = data.value.totalPages;
        totalItems.value = data.value.totalItems;
    }
});
</script>

<style scoped>
/* Tailwind CSS is assumed to be included in your project */
</style>
