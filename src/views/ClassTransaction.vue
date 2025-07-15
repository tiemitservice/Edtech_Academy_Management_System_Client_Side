<template>
    <section class="px-4 mx-auto">
        <div class="py-2 flex flex-col md:flex-row mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg justify-between items-center">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Classes Transaction</label>
            <div class="flex items-center gap-4">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText placeholder="Search by name" v-model="searchQuery" class="w-full" />
                </IconField>
                <div class="flex items-center gap-4">
                    <DatePicker v-model="createdAt_select" show-icon selectionMode="range" show-button-bar placeholder="Filter by created at" />
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div v-if="!loadingClass && data.length" class="py-2">
                    <DataTable :value="data" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="originalIndex" header="No" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.originalIndex }}</p>
                            </template>
                        </Column>
                        <Column field="createdAt" header="Created At" sortable style="min-width: 200px">
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
                        <Column field="duration" header="Duration" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">
                                    {{ formatDuration(slotProps.data.duration) }}
                                </div>
                            </template>
                        </Column>

                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button @click="handleClassDetails(slotProps.data)" icon="pi pi-user" severity="success" rounded aria-label="Info" />
                                    <Button @click="handleStudentClassDetail(slotProps.data)" icon="pi pi-users" rounded aria-label="Info" />
                                    <Button icon="pi pi-undo" severity="warn" rounded aria-label="Remark" @click="handleMarkClass(slotProps.data)" />
                                    <Button @click="handlePromote(slotProps.data)" icon="pi pi-arrow-right" severity="danger" rounded aria-label="Promote" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else-if="!loadingClass && data.length === 0" class="w-full flex justify-center items-center bg-white p-4 rounded-lg">
                    <NotFound />
                </div>
                <div v-else class="w-full flex justify-center items-center bg-white p-4 rounded-lg">
                    <Laoding />
                </div>
            </div>
        </div>

        <!-- All TransitionRoot modals remain the same, but their content might change based on the action -->
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
                                    <RemarkClassForm :datatoedit="datatoedit" @close="handleCloseMarkClass" @save="handleSave" @toast="showToast" />
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
                                <div class="mt-2">
                                    <PromoteStudentForm :datatoedit="datatoedit" @close="handleClosePromote" @save="handleSave" @toast="showToast" />
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
import moment from 'moment';

// Import Components
import ClassDetails from '@/form/ClassDetails.vue';
import RemarkClassForm from '@/form/RemarkClassForm.vue';
import PromoteStudentForm from '@/form/PromoteStudentForm.vue';
import StudentClassDetial from '../../App/StudentClassDetial.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';

// Import Helpers
import { formatDate2 } from '@/composible/formatDate';

const collection = ref('classes');
const { data: rawData, loading: loadingClass, fetchData } = useFetch(collection.value);
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const toast = useToast();

// State for Modals
const datatoedit = ref(null);
const isClassDetails = ref(false);
const isStudentClassDetail = ref(false);
const isMarkClass = ref(false);
const is_promote = ref(false);

// State for Filtering
const searchQuery = ref('');
const createdAt_select = ref(null);

// --- Reactive Data Handling ---

const indexedRawData = computed(() => {
    return rawData.value?.map((item, index) => ({ ...item, originalIndex: index + 1 })) || [];
});

const data = computed(() => {
    let filteredItems = indexedRawData.value;

    filteredItems = filteredItems.filter((item) => item.mark_as_completed === false);

    const q = searchQuery.value.trim().toLowerCase();
    if (q) {
        filteredItems = filteredItems.filter((item) => item.name?.toLowerCase().includes(q));
    }

    const [start, end] = createdAt_select.value || [];
    if (start && end) {
        const startDate = moment(start).startOf('day');
        const endDate = moment(end).endOf('day');
        filteredItems = filteredItems.filter((item) => moment(item.createdAt).isBetween(startDate, endDate));
    }

    return filteredItems;
});

// --- Formatting Functions ---
const formatDuration = (id) => {
    const section = sections.value?.find((section) => section._id === id);
    return section ? section.duration : 'N/A';
};
const formatSubject = (id) => {
    const subject = subjects.value?.find((subject) => subject._id === id);
    return subject ? subject.name : 'N/A';
};

// --- Modal Handlers ---

const handleMarkClass = (doc) => {
    isMarkClass.value = true;
    datatoedit.value = doc;
};
const handleCloseMarkClass = () => {
    isMarkClass.value = false;
    datatoedit.value = null;
};

const handlePromote = (doc) => {
    is_promote.value = true;
    datatoedit.value = doc;
};
const handleClosePromote = () => {
    is_promote.value = false;
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

const handleStudentClassDetail = (data) => {
    datatoedit.value = data;
    isStudentClassDetail.value = true;
};
const handleCloseStudentClassDetail = () => {
    isStudentClassDetail.value = false;
    datatoedit.value = null;
};

// --- General Functions ---

const showToast = (action, severity, detail) => {
    const summary =
        {
            create: 'Created Success',
            update: 'Updated Success',
            delete: 'Deleted Success'
        }[action] || action;
    toast.add({ severity: severity || 'info', summary, detail, life: 3000 });
};

const handleSave = () => {
    fetchData();
};

onMounted(async () => {
    await fetchData();
    await fetchSections();
    await fetchSubjects();
});
</script>

<style scoped>
/* Tailwind CSS is assumed to be included in your project */
</style>
