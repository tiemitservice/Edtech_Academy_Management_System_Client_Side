<template>
    <section class="px-4 mx-auto">
        <div class="py-2 flex flex-col md:flex-row mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg justify-between items-center">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('class.classes_transaction') }}</label>
            <div class="flex items-center gap-4 flex-wrap justify-end">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText :placeholder="$t('element.Searchbyname')" v-model="searchQuery" class="w-full" />
                </IconField>
                <!-- New Filter Dropdowns -->
                <Select v-model="filters.subjectId" :options="subjects" optionLabel="name" optionValue="_id" :placeholder="$t('class.subject')" showClear class="min-w-[180px]" />
                <Select v-model="filters.durationId" :options="sections" optionLabel="duration" optionValue="_id" :placeholder="$t('class.duration')" showClear class="min-w-[180px]" />

                <!-- Filter Buttons -->
                <Button @click="applyFilters" :label="$t('element.filter')" icon="pi pi-filter" />
                <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div v-if="!loadingClass && data.length" class="py-2">
                    <DataTable :value="data" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="originalIndex" :header="$t('element.num')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.originalIndex }}</p>
                            </template>
                        </Column>
                        <Column field="createdAt" :header="$t('element.createdat')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ formatDate2(slotProps.data.createdAt) }}</p>
                            </template>
                        </Column>
                        <Column field="name" :header="$t('class.name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">
                                    {{ slotProps.data.name }}
                                </div>
                            </template>
                        </Column>
                        <Column field="subject" :header="$t('class.subject')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">
                                    {{ formatSubject(slotProps.data.subject) }}
                                </div>
                            </template>
                        </Column>

                        <Column field="duration" :header="$t('class.duration')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">
                                    {{ formatDuration(slotProps.data.duration) }}
                                </div>
                            </template>
                        </Column>

                        <Column :header="$t('element.action')" style="min-width: 150px">
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

        <!-- All TransitionRoot modals remain the same -->
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

        <TransitionRoot appear :show="isStudentClassDetail" as="template">
            <Dialog as="div" @close="handleCloseStudentClassDetail" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-full max-w-[1440px] transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
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
                                <div>
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
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();
// State for Modals
const datatoedit = ref(null);
const isClassDetails = ref(false);
const isStudentClassDetail = ref(false);
const isMarkClass = ref(false);
const is_promote = ref(false);

// State for Filtering
const searchQuery = ref('');
const filters = ref({
    subjectId: null,
    durationId: null
});
const activeFilters = ref({
    subjectId: null,
    durationId: null
});

const isFilterActive = computed(() => !!(filters.value.subjectId || filters.value.durationId));

const applyFilters = () => {
    activeFilters.value = { ...filters.value };
};

const clearFilters = () => {
    filters.value = { subjectId: null, durationId: null };
    activeFilters.value = { subjectId: null, durationId: null };
};

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

    // Apply active subject filter
    if (activeFilters.value.subjectId) {
        filteredItems = filteredItems.filter((item) => item.subject === activeFilters.value.subjectId);
    }

    // Apply active duration filter
    if (activeFilters.value.durationId) {
        filteredItems = filteredItems.filter((item) => item.duration === activeFilters.value.durationId);
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

const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};

const handleSave = () => {
    fetchData();
};

onMounted(async () => {
    await fetchData({ status: true });
    await fetchSections();
    await fetchSubjects();
});
</script>
