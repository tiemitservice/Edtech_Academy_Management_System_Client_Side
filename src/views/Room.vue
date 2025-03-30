<template>
    <section class="px-4 mx-auto">
        <h2 class="text-lg font-medium text-gray-800 dark:text-white">Room</h2>
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

                        <Column field="booked_by" header="Booked by" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.booked_by.en_name }}</div>
                            </template>
                        </Column>

                        <!-- start data -->
                        <Column field="start_time" header="Start time" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.section?.start_time }}</div>
                            </template>
                        </Column>
                        <Column field="end_time" header="Start time" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.section?.end_time }}</div>
                            </template>
                        </Column>
                        <Column field="status" header="Room Status" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <Tag :value="slotProps.data.booking_peding ? 'Inactive' : 'Active'" :severity="slotProps.data.is_active ? 'success' : 'danger'" />
                                </div>
                            </template>
                        </Column>
                        <Column field="booking_peding" header="Booking Status" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <Tag :value="slotProps.data.booking_peding ? 'Confirmed' : 'Pending'" :severity="slotProps.data.booking_peding ? 'success' : 'warn'" />
                                </div>
                            </template>
                        </Column>
                        <Column header="Confirm Action" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2 items-center justify-center" v-if="slotProps.data.booking_peding === false">
                                    <Button icon="pi pi-check" rounded aria-label="Filter" @click="handleConfirm(slotProps.data)" />
                                    <Button icon="pi pi-times" severity="danger" rounded aria-label="Filter" @click="handleReject(slotProps.data)" />
                                </div>
                                <div v-else>
                                    <Button icon="pi pi-check" rounded aria-label="Filter" severity="secondary" />
                                </div>
                            </template>
                        </Column>

                        <Column header="Action" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-pencil" rounded aria-label="Filter" />
                                    <Button icon="pi pi-trash" severity="danger" rounded aria-label="Filter" />
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
                            <DialogPanel class="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <SectionForm :datatoedit="datatoedit" @close="handleClose" @socket="handleSocket" />
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
                            <DialogPanel class="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <DeleteConfimation :deleteData="deleteData" :collection="collection" @close="handleCloseDelete" @socket="handleSocket" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
        <TransitionRoot appear :show="isRoomRejection" as="template">
            <Dialog as="div" @close="handleCloseRejection" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <RoomRejection :datetoedit="datatoedit" @close="handleCloseRejection" @socket="handleSocket" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
        <TransitionRoot appear :show="isRoomConfirmation" as="template">
            <Dialog as="div" @close="handleCloseConfirmation" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <RoomConfirmation :datetoedit="datatoedit" @close="handleCloseConfirmation" @socket="handleSocket" />
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
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useFetch } from '../composible/useFetch';
import socket from '@/composible/socket';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import SectionForm from '@/form/SectionForm.vue';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import RoomConfirmation from '@/form/RoomConfirmation.vue';
import RoomRejection from '@/form/RoomRejection.vue';
const collection = ref('rooms');
const isOpen = ref(false);
const datatoedit = ref(null);
const isRoomConfirmation = ref(false);
const isRoomRejection = ref(false);

const handleReject = (data) => {
    datatoedit.value = data;
    isRoomRejection.value = true;
};
const handleCloseRejection = () => {
    isRoomRejection.value = false;
    datatoedit.value = null;
    handleSocket();
};
const handleConfirm = (data) => {
    datatoedit.value = data;
    isRoomConfirmation.value = true;
};

const handleCloseConfirmation = () => {
    isRoomConfirmation.value = false;
    datatoedit.value = null;
    handleSocket();
};

const isDelete = ref(false);
const deleteData = ref(null);
const handleDeleteConfirm = async (id) => {
    deleteData.value = id;
    isDelete.value = true;
};
const handleCloseDelete = () => {
    isDelete.value = false;
    deleteData.value = null;
    handleSocket();
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
const { data, loading, error, fetchData } = useFetch(collection.value);
const filters = ref({
    page: 1,
    limit: 50,
    search: '',
    searchColumn: ['start_time', 'end_time']
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

// Handle real-time updates
const handleDatabaseUpdate = async () => {
    await fetchData(filters.value);
};
const handleSocket = async () => {
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
onUnmounted(() => {
    socket.off('database_realTime', handleDatabaseUpdate);
});
</script>

<style scoped>
/* Tailwind CSS is assumed to be included in your project */
</style>
