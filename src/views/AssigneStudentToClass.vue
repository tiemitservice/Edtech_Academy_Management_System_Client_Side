<template>
    <section class="px-4 mx-auto">
        <!-- <p class="mt-1 text-lg text-gray-800">Staff list</p> -->

        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Assign Student To Class</label>

            <!-- Left: All filters and search in a row, wrap on small screens -->
            <div class="flex flex-wrap gap-4 items-start">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Search by name" class="min-w-[200px]" />
                </IconField>
                <div class="w-64">
                    <DatePicker v-model="createdAt_select" selectionMode="range" show-button-bar placeholder="Filter by created at" />
                </div>
                <!-- <div class="flex-shrink-0">
                    <Button @click="openModal" label="Add new" class="!text-white w-[100px]" />
                </div> -->
            </div>

            <!-- Right: Add button, always aligned to the right and centered -->
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2" v-if="!loading && data.length">
                    <DataTable v-if="data" :value="data" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="_id" header="ID" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data._id }}</p>
                            </template>
                        </Column>

                        <Column field="en_name" header="Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    {{ slotProps.data.name }}
                                </div>
                            </template>
                        </Column>

                        <Column field="duration" header="Duration" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    {{ formatDuration(slotProps.data.duration) }}
                                </div>
                            </template>
                        </Column>

                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <!-- <Button @click="handleClassDetails(slotProps.data)" icon="pi pi-info-circle" severity="success" rounded aria-label="Info" /> -->
                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    <!-- <Button @click="handleDelete(slotProps.data._id)" icon="pi pi-trash" severity="danger" rounded aria-label="Delete" /> -->
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else-if="!loading && data.length === 0" class="w-full flex justify-center items-center bg-white p-4 rounded-lg">
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
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <AssigneStudentForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
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
                                    <AssigneStudentForm :datatoedit="datatoedit" @close="handleCloseDetails" />
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
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import { useToast } from 'primevue/usetoast';
import AssigneStudentForm from '@/form/AssigneStudentForm.vue';
import Laoding from './pages/Laoding.vue';
import NotFound from './pages/NotFound.vue';
import moment from 'moment';
const toast = useToast();
const showToast = (action, severity) => {
    let summary;
    switch (action) {
        case 'create':
            severity = 'success';
            summary = ' Created Success';
            break;
        case 'update':
            severity = 'info';
            summary = ' Updated Success';
            break;
        case 'delete':
            summary = ' Deleted Success';
            break;
        default:
            severity = 'info';
            summary = 'Action Completed';
    }

    toast.add({
        severity: severity,
        summary: summary,
        life: 3000
    });
};

const { data: sections, fetchData: fetchSections } = useFetch('sections');

const formatDuration = (id) => {
    const section_id = sections.value?.find((section_id) => section_id._id === id);
    return section_id ? section_id.duration : 'N/A';
};
const collection = ref('classes');
const isOpen = ref(false);
const datatoedit = ref(null);
const isClassDetails = ref(false);

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

const { data: rawData, loading, error, fetchData, deleteData } = useFetch(collection.value);
const { data: staffData, fetchData: fetchStaff } = useFetch('staffs');

const searchQuery = ref('');
const createdAt_select = ref([moment().startOf('year').startOf('day').toDate(), moment().endOf('year').endOf('day').toDate()]);
const data = ref([]);

const filterData = () => {
    loading.value = true;
    setTimeout(() => {
        const q = searchQuery.value.trim().toLowerCase();
        const start = Array.isArray(createdAt_select.value) ? createdAt_select.value[0] : createdAt_select.value?.start;
        const end = Array.isArray(createdAt_select.value) ? createdAt_select.value[1] : createdAt_select.value?.end;

        data.value =
            rawData.value?.filter((item) => {
                const matchesName = !q || item.name?.toLowerCase().includes(q);
                const matchesCreatedAt = !start || !end ? true : moment(item.createdAt).isBetween(moment(start).startOf('day'), moment(end).endOf('day'), undefined, '[]');
                const isCompleted = item.mark_as_completed === true;
                return matchesName && matchesCreatedAt && isCompleted;
            }) || [];

        console.log('Filtered data:', data.value);
        loading.value = false;
    }, 500);
};

onMounted(async () => {
    await Promise.all([fetchData(), fetchStaff(), fetchSections()]);
    filterData();
});
</script>

<style scoped>
/* Tailwind CSS is assumed to be included in your project */
</style>
