<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="flex flex-col md:flex-row mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg justify-between items-center">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Scores</label>
            <div class="flex items-center gap-4">
                <div class="flex items-end gap-4 flex-wrap">
                    <!-- Filters -->
                    <div class="flex flex-col">
                        <label class="text-lg font-medium text-gray-700 mb-1"> Select a year <span class="text-red-500">*</span> </label>
                        <DatePicker v-model="selectYear" view="year" dateFormat="yy" show-button-bar placeholder="Select a year" />
                    </div>
                    <div class="flex flex-col">
                        <label class="text-lg font-medium text-gray-700 mb-1"> Select a class <span class="text-red-500">*</span> </label>
                        <Select v-model="classSelected" :options="classes" option-value="_id" option-label="name" show-clear placeholder="Select a class" class="min-w-[180px]" />
                    </div>
                    <div class="flex flex-col">
                        <label class="invisible mb-1 select-none">&nbsp;</label>
                        <Button @click="() => filterData(true)" :label="apply_loading ? 'Applying...' : 'Apply filter'" :loading="apply_loading" class="text-white px-4 py-2 rounded hover:bg-blue-700 bg-blue-600" />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div v-if="!loading">
                    <div v-if="filteredData.length > 0" class="py-2">
                        <DataTable :value="filteredData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                            <Column field="_id" header="No." style="min-width: 150px">
                                <template #body="slotProps">
                                    <p class="font-medium">{{ slotProps.index + 1 }}</p>
                                </template>
                            </Column>
                            <Column field="createdAt" sortable header="Created at" style="min-width: 150px">
                                <template #body="slotProps">
                                    <p class="font-medium">{{ formatDate2(slotProps.data.createdAt) }}</p>
                                </template>
                            </Column>
                            <Column field="en_name" header="Name" sortable style="min-width: 200px">
                                <template #body="slotProps">
                                    <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                        {{ slotProps.data.name }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="start_time" header="Duration" sortable style="min-width: 200px">
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
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import { useToast } from 'primevue/usetoast';
import { formatDate2 } from '@/composible/formatDate';
import moment from 'moment';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import StudentScoreForm from '@/form/StudentScoreForm.vue';

const { data: sections, fetchData: fetchSections } = useFetch('sections');
const toast = useToast();
const isOpen = ref(false);
const datatoedit = ref(null);
const apply_loading = ref(false);
const filteredData = ref([]);

const formatDuration = (id) => {
    const section = sections.value?.find((section) => section._id === id);
    return section ? section.duration : 'N/A';
};

const collection = ref('classes');
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);
const { data: classes, fetchData: fetchClass } = useFetch('classes');
const classSelected = ref(null);
const selectYear = ref(null);

const filterData = (showNotification = false) => {
    apply_loading.value = true;
    const year = selectYear.value;
    const classId = classSelected.value;

    if (!classId || !year) {
        filteredData.value = [];
        if (showNotification) {
            showToast({ action: 'check_fields', message: 'You need to select both Class and Year to filter' });
        }
        apply_loading.value = false;
        return;
    }

    const selectedYear = moment(year).year();

    const result =
        rawData.value?.filter((item) => {
            const matchesClass = item._id === classId;
            const createdAtYear = moment(item.createdAt).year();
            const matchesYear = createdAtYear === selectedYear;
            return matchesClass && matchesYear;
        }) || [];

    filteredData.value = result;

    if (showNotification) {
        if (result.length === 0) {
            showToast({ action: 'not_found', message: 'No data matched your filter' });
        } else {
            showToast({ action: 'found', message: `Found ${result.length} result(s)` });
        }
    }

    apply_loading.value = false;
};

// Watch rawData to silently update the view when data changes from the server
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
    fetchData(); // Refetch data which will trigger the watcher to update the list
    closeModal();
};

onMounted(async () => {
    await Promise.all([fetchData(), fetchSections(), fetchClass()]);
});
</script>
