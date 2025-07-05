<template>
    <section class="px-4 mx-auto">
        <div class="flex flex-col md:flex-row mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg justify-between items-center">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Attendance</label>
            <div class="flex items-center gap-4">
                <div class="flex items-end gap-4 flex-wrap">
                    <!-- Class Select -->
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
                        <Button @click="filterData" :label="apply_loading ? 'Applying...' : 'Apply filter'" :loading="apply_loading" class="text-white px-4 py-2 rounded hover:bg-blue-700 bg-blue-600" />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div v-if="filteredData.length > 0" class="py-2">
                    <DataTable :value="filteredData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="_id" header="ID" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data._id }}</p>
                            </template>
                        </Column>
                        <!-- created at -->
                        <Column field="createdAt" header="Created at" style="min-width: 150px">
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
                        <!-- start data -->
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
                                    <Button @click="handleStudentClassDetail(slotProps.data)" icon="pi pi-users" rounded aria-label="Info" />
                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-if="!filteredData || filteredData.length === 0" class="w-full flex justify-center items-center bg-white p-4 rounded-lg">
                    <NotFound :loading="loading" :error="error" />
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
                                    <StudentAttendaceForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
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
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <ClassDetails :datatoedit="datatoedit" @close="handleCloseDetails" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <TransitionRoot appear :show="isStudentClassDetail" as="template">
            <Dialog as="div" @close="handleCloseStudentClassDetail" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <StudentClassDetial :datatoedit="datatoedit" @close="handleCloseStudentClassDetail" />
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
import { ref, onMounted } from 'vue';
import { useFetch } from '../composible/useFetch';
import ClassDetails from '@/form/ClassDetails.vue';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';

import { useToast } from 'primevue/usetoast';
import { formatDate2 } from '@/composible/formatDate';
import moment from 'moment';
import NotFound from './pages/NotFound.vue';
import StudentClassDetial from '../../App/StudentClassDetial.vue';
import StudentAttendaceForm from '@/form/StudentAttendaceForm.vue';
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const toast = useToast();
const isOpen = ref(false);
const datatoedit = ref(null);
const isClassDetails = ref(false);

const isStudentClassDetail = ref(false);
const searchQuery = ref('');
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

const filterData = () => {
    apply_loading.value = true;

    const year = selectYear.value;
    const classId = classSelected.value;

    // ✅ Show toast if either class or year is missing
    if (!classId || !year) {
        filteredData.value = [];
        showToast({ action: 'check_fields', message: 'You need to select both Class and Year to filter' });
        apply_loading.value = false;
        return;
    }

    const q = searchQuery.value.trim().toLowerCase();
    const selectedYear = moment(year).year();

    filteredData.value =
        rawData.value?.filter((item) => {
            const matchesName = !q || item.name?.toLowerCase().includes(q);
            const matchesClass = item._id === classId;
            const createdAtYear = moment(item.createdAt).year();
            const matchesYear = createdAtYear === selectedYear;
            return matchesName && matchesClass && matchesYear;
        }) || [];

    if (filteredData.value.length === 0) {
        showToast({ action: 'not_found', message: 'No data matched your filter' });
    } else {
        showToast({ action: 'found', message: `Found ${filteredData.value.length} result(s)` });
    }

    apply_loading.value = false;
};

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
        case 'server_error':
            severity = 'error';
            summary = customMessage || 'Server error occurred';
            break;
        case 'asociate':
            severity = 'warn';
            summary = 'Please delete the associated data first';
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

const closeModal = () => {
    isOpen.value = false;
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

const handleCloseDetails = () => {
    isClassDetails.value = false;
    datatoedit.value = null;
};

const handleStudentClassDetail = (data) => {
    datatoedit.value = data;
    isStudentClassDetail.value = true;
};

const handleCloseStudentClassDetail = () => {
    isStudentClassDetail.value = false;
    datatoedit.value = null;
};

onMounted(async () => {
    await fetchData();
    await fetchSections();
    await fetchClass();
    // filterData();
});
</script>

<style scoped>
/* Tailwind CSS is assumed to be included in your project */
</style>
