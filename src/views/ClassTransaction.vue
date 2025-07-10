<template>
    <section class="px-4 mx-auto">
        <!-- <p class="mt-1 text-lg text-gray-800">Staff list</p> -->

        <div class="py-2 flex flex-col md:flex-row mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg justify-between items-center">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Classes Transaction</label>
            <div class="flex items-center gap-4">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText placeholder="Search by name" v-model="searchQuery" class="w-full" />
                </IconField>
                <div class="flex items-center gap-4">
                    <DatePicker v-model="createdAt_select" show-icon selectionMode="range" show-button-bar placeholder="Filter by created at" />
                    <!-- <Button @click="filterData" :label="apply_loading ? 'Applying...' : 'Apply filter'" :loading="apply_loading" class="text-white px-4 py-2 rounded hover:bg-blue-700" /> <Button @click="openModal" label="Add new" /> -->
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div v-if="!loadingClass && filteredData.length" class="py-2">
                    <DataTable :value="filteredData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="_id" header="ID" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.index + 1 }}</p>
                            </template>
                        </Column>
                        <!-- created at -->
                        <Column field="createdAt" header="Created at" style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ formatDate2(slotProps.data.createdAt) }}</p>
                            </template>
                        </Column>
                        <Column field="name" header="Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">
                                    {{ slotProps.data.name }}
                                </div>
                            </template>
                        </Column>
                        <Column field="subject" header="Subject" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">
                                    {{ formatSubject(slotProps.data.subject) }}
                                </div>
                            </template>
                        </Column>
                        <!-- start data -->
                        <Column field="start_time" header="Duration" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">
                                    {{ formatDuration(slotProps.data?.duration) || 'N/A' }}
                                </div>
                            </template>
                        </Column>
                        <!-- start data -->
                        <!-- <Column field="start_time" header="Duration" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">
                                    {{ slotProps.data?.mark_as_completed ? 'Completed' : 'Incomplete' }}
                                </div>
                            </template>
                        </Column> -->

                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button
                                        @click="handleClassDetails(slotProps.data)"
                                        icon="pi pi-user
    "
                                        severity="success"
                                        rounded
                                        aria-label="Info"
                                    />
                                    <Button @click="handleStudentClassDetail(slotProps.data)" icon="pi pi-users" rounded aria-label="Info" />
                                    <!-- <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" /> -->
                                    <Button icon="pi pi-undo" severity="warn" rounded aria-label="Edit" @click="handleMarkClass(slotProps.data)" />
                                    <Button @click="handlePromote(slotProps.data)" icon="pi pi-arrow-right" severity="danger" rounded aria-label="Delete" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else-if="!loadingClass && filteredData.length === 0" class="w-full flex justify-center items-center bg-white p-4 rounded-lg">
                    <NotFound />
                </div>
                <div v-else class="w-full flex justify-center items-center bg-white p-4 rounded-lg">
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
                                <div>
                                    <Classform :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
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
                                <div>
                                    <ClassDetails :datatoedit="datatoedit" @close="handleCloseDetails" />
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
                                <div>
                                    <DeleteConfimation :deleteData="deleteData" :datatoedit="datatoedit" :collection="collection" @close="handleCloseDelete" @toast="showToast" />
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
                                <div>
                                    <StudentClassDetial :datatoedit="datatoedit" @close="handleCloseStudentClassDetail" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
        <TransitionRoot appear :show="isMarkClass" as="template">
            <Dialog as="div" @close="handleCloseMarkClass" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <div>
                                    <RemarkClassForm :datatoedit="datatoedit" @close="handleCloseMarkClass" @toast="showToast" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <TransitionRoot appear :show="is_promote" as="template">
            <Dialog as="div" @close="handleClosePromote" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <div>
                                    <PromoteStudentForm :datatoedit="datatoedit" @close="handleClosePromote" @toast="showToast" />
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
import ClassDetails from '@/form/ClassDetails.vue';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import Classform from '@/form/Classform.vue';
import { useToast } from 'primevue/usetoast';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import { formatDate2 } from '@/composible/formatDate';
import moment from 'moment';
import NotFound from './pages/NotFound.vue';
import RemarkClassForm from '@/form/RemarkClassForm.vue';
import StudentClassDetial from '../../App/StudentClassDetial.vue';
import PromoteStudentForm from '@/form/PromoteStudentForm.vue';

import Laoding from './pages/Laoding.vue';
const collection = ref('classes');
const { data: rawData, loading: loadingClass, error, fetchData } = useFetch(collection.value);
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const toast = useToast();
const isOpen = ref(false);
const datatoedit = ref(null);
const isClassDetails = ref(false);
const isDelete = ref(false);
const deleteData = ref(null);
const isStudentClassDetail = ref(false);
const searchQuery = ref('');
const createdAt_select = ref([moment().startOf('year').startOf('day').toDate(), moment().endOf('year').endOf('day').toDate()]);
const apply_loading = ref(false);
const filteredData = ref([]);

const is_promote = ref(false);
const handlePromote = (doc) => {
    is_promote.value = true;
    datatoedit.value = doc;
};
const handleClosePromote = () => {
    is_promote.value = false;
    datatoedit.value = null;
};

const isMarkClass = ref(false);
const handleMarkClass = (doc) => {
    isMarkClass.value = true;
    datatoedit.value = doc;
};
const handleCloseMarkClass = () => {
    isMarkClass.value = false;
    datatoedit.value = null;
};

const formatDuration = (id) => {
    const section = sections.value?.find((section) => section._id === id);
    return section ? section.duration : 'N/A';
};
const formatSubject = (id) => {
    const subject = subjects.value?.find((subject) => subject._id === id);
    return subject ? subject.name : 'N/A';
};

const filterData = () => {
    loadingClass.value = true;
    setTimeout(() => {
        const q = searchQuery.value.trim().toLowerCase();
        const start = Array.isArray(createdAt_select.value) ? createdAt_select.value[0] : createdAt_select.value?.start;
        const end = Array.isArray(createdAt_select.value) ? createdAt_select.value[1] : createdAt_select.value?.end;

        filteredData.value =
            rawData.value?.filter((item) => {
                const matchesName = !q || item.name?.toLowerCase().includes(q);
                const matchesCreatedAt = !start || !end ? true : moment(item.createdAt).isBetween(moment(start).startOf('day'), moment(end).endOf('day'), undefined, '[]');
                const isCompleted = item.mark_as_completed === false; // ✅ this line ensures only completed classes
                return matchesName && matchesCreatedAt && isCompleted;
            }) || [];

        console.log('Filtered data:', filteredData.value);
        loadingClass.value = false;
    }, 500);
};

watch(
    rawData,
    () => {
        console.log('rawData updated:', rawData.value);
        filterData();
    },
    { deep: true }
);

watch([searchQuery, createdAt_select], () => {
    console.log('Search or date filter changed');
    filterData();
});

const showToast = (action, severity) => {
    const summary =
        {
            create: 'Created Success',
            update: 'Updated Success',
            delete: 'Deleted Success',
            asociate: 'Please delete the associated data first'
        }[action] || 'Action Completed';
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};

const openModal = () => {
    isOpen.value = true;
};

const closeModal = () => {
    isOpen.value = false;
    datatoedit.value = null;
};

const handleClose = () => {
    isOpen.value = false;
    datatoedit.value = null;
};

const handleClassDetails = (data) => {
    datatoedit.value = data;
    isClassDetails.value = true;
};

const handleCloseDetails = () => {
    isClassDetails.value = false;
    datatoedit.value = null;
};

const handleCloseDelete = () => {
    isDelete.value = false;
    deleteData.value = null;
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
    await fetchSubjects();
    filterData();
});
</script>

<style scoped>
/* Tailwind CSS is assumed to be included in your project */
</style>
