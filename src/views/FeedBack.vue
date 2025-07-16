<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Feedback List</label>
            <div class="flex items-center gap-4 flex-wrap justify-end">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText placeholder="Search by name or email" v-model="searchQuery" class="w-full" />
                </IconField>
                <Calendar v-model="filterDate" showIcon dateFormat="yy-mm-dd" placeholder="Filter by Date" />
            </div>
        </div>

        <!-- Data Table -->
        <div class="flex flex-col" v-if="!loading">
            <div class="overflow-x-auto">
                <div v-if="filteredData.length > 0" class="py-2">
                    <DataTable :value="filteredData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column header="No." style="min-width: 50px">
                            <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                        </Column>
                        <Column field="createdAt" header="Date" sortable>
                            <template #body="slotProps">{{ formatDate(slotProps.data.createdAt) }}</template>
                        </Column>
                        <Column field="from" header="From">
                            <template #body="slotProps">Anonymous</template>
                        </Column>

                        <Column field="feedback" header="Message" style="min-width: 300px"></Column>
                        <Column header="Actions" style="min-width: 100px">
                            <template #body="slotProps">
                                <Button @click="handleDeleteConfirm(slotProps.data._id, slotProps.data)" icon="pi pi-trash" severity="danger" rounded aria-label="Delete" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else>
                    <NotFound message="No feedback found for the selected criteria." />
                </div>
            </div>
        </div>
        <div v-else>
            <Laoding />
        </div>

        <!-- Delete Confirmation Modal -->
        <TransitionRoot appear :show="isDelete" as="template">
            <Dialog as="div" @close="handleCloseDelete" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <DeleteConfimation :deleteData="deleteId" :datatoedit="datatoedit" :collection="collection" @close="handleCloseDelete" @toast="showToast" />
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
import { ref, onMounted, computed, watch } from 'vue';
import { useFetch } from '../composible/useFetch';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

// Import UI components
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';

import Toast from 'primevue/toast';
const { data: staffs, fetchData: fetchStaff } = useFetch('students');
const formatStaffName = (staffId) => {
    const staff = staffs.value?.find((s) => s._id === staffId);
    return staff ? staff.eng_name : 'Unknown';
};

// --- Component State ---
const collection = ref('feedbacks');
const isDelete = ref(false);
const deleteId = ref(null);
const datatoedit = ref(null);
const toast = useToast();

// --- Data Fetching ---
const { data: rawData, loading, fetchData } = useFetch(collection.value);

// --- Filtering ---
const searchQuery = ref('');
const filterDate = ref(null);

const filteredData = computed(() => {
    if (!rawData.value) return [];

    let data = [...rawData.value];
    const q = searchQuery.value.trim().toLowerCase();

    // Filter by search query
    if (q) {
        data = data.filter((item) => item.name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q));
    }

    // Filter by date
    if (filterDate.value) {
        const selectedDate = moment(filterDate.value);
        data = data.filter((item) => moment(item.createdAt).isSame(selectedDate, 'day'));
    }

    return data;
});

// --- Helper Functions ---
const formatDate = (date) => moment(date).format('YYYY-MM-DD');

const showToast = (action) => {
    const severityMap = { delete: 'success', error: 'error' };
    const summaryMap = { delete: 'Deleted Successfully', error: 'An error occurred' };
    toast.add({
        severity: severityMap[action] || 'info',
        summary: summaryMap[action] || 'Action Completed',
        life: 3000
    });
};

// --- Modal and CRUD Handlers ---
const handleDeleteConfirm = (id, doc) => {
    deleteId.value = id;
    datatoedit.value = doc;
    isDelete.value = true;
};

const handleCloseDelete = async (wasDeleted) => {
    isDelete.value = false;
    deleteId.value = null;
    datatoedit.value = null;
    if (wasDeleted) {
        await fetchData(); // Refetch data after deletion
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await fetchData();
    await fetchStaff();
});
</script>
