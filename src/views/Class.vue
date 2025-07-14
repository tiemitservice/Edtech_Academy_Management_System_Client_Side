<template>
    <section class="px-4 mx-auto">
        <!-- <p class="mt-1 text-lg text-gray-800">Staff list</p> -->
        <!-- <pre>
            {{ data[0] }}
        </pre> -->
        <div class="py-2 flex flex-col md:flex-row mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg justify-between items-center">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Classes</label>
            <div class="flex items-center gap-4">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText placeholder="Search by name" v-model="searchQuery" class="w-full" />
                </IconField>
                <div class="flex items-center gap-4">
                    <!-- <DatePicker v-model="createdAt_select" selectionMode="range" show-icon show-button-bar placeholder="Filter by created at" /> -->
                    <!-- <Button @click="filterData" :label="apply_loading ? 'Applying...' : 'Apply filter'" :loading="apply_loading" class="text-white px-4 py-2 rounded hover:bg-blue-700" />  -->
                    <Button @click="openModal" label="Add new" />
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div v-if="!loadingClass && data.length" class="py-2">
                    <DataTable :value="data" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="_id" header="No" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.index + 1 }}</p>
                            </template>
                        </Column>
                        <!-- created at -->
                        <!-- <Column field="createdAt" header="Created at" style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ formatDate2(slotProps.data.createdAt) }}</p>
                            </template>
                        </Column> -->
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

                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button @click="handleClassDetails(slotProps.data)" icon="pi pi-user" severity="success" rounded aria-label="Info" />
                                    <Button @click="handleStudentClassDetail(slotProps.data)" icon="pi pi-users" rounded aria-label="Info" />
                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    <Button icon="pi pi-bookmark-fill" severity="warn" rounded aria-label="Edit" @click="handleMarkClass(slotProps.data)" />
                                    <Button @click="handleDeleteConfirm(slotProps.data._id, slotProps.data)" :disabled="slotProps.data?.students?.length" icon="pi pi-trash" severity="danger" rounded aria-label="Delete" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else-if="!loadingClass && data.length === 0 && hasFiltered" class="w-full flex justify-center items-center bg-white p-4 rounded-lg">
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
                                <div class="mt-2">
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
                                <div class="mt-2">
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
                                <div class="mt-2">
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
                                <div class="mt-2">
                                    <MarkClassForm :datatoedit="datatoedit" @close="handleCloseMarkClass" @toast="showToast" />
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
import MarkClassForm from '@/form/MarkClassForm.vue';
import StudentClassDetial from '../../App/StudentClassDetial.vue';
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
const data = ref([]);
const hasFiltered = ref(false);
const filterData = () => {
    loadingClass.value = false;
    hasFiltered.value = false;

    setTimeout(() => {
        const q = searchQuery.value.trim().toLowerCase();
        // const start = Array.isArray(createdAt_select.value) ? createdAt_select.value[0] : createdAt_select.value?.start;
        // const end = Array.isArray(createdAt_select.value) ? createdAt_select.value[1] : createdAt_select.value?.end;

        data.value =
            rawData.value?.filter((item) => {
                const matchesName = !q || item.name?.toLowerCase().includes(q);
                // const matchesCreatedAt = !start || !end ? true : moment(item.createdAt).isBetween(moment(start).startOf('day'), moment(end).endOf('day'), undefined, '[]');
                const isCompleted = item.mark_as_completed === true;
                return matchesName && isCompleted;
            }) || [];

        console.log('Filtered data:', data.value);

        loadingClass.value = false;
        hasFiltered.value = true;
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

const handleEdit = (data) => {
    datatoedit.value = data;
    openModal();
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

const handleDeleteConfirm = (id, doc) => {
    deleteData.value = id;
    isDelete.value = true;
    datatoedit.value = doc;
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
