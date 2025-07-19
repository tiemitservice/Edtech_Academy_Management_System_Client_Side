<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="flex flex-col md:flex-row mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg justify-between items-center">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('student_attendance.title') }}</label>
            <div class="flex items-center gap-4">
                <div class="flex items-end gap-4 flex-wrap">
                    <!-- Duration Filter -->
                    <div class="flex flex-col">
                        <label class="text-lg font-medium text-gray-700 mb-1"> {{ $t('student_attendance.select_duration') }} <span class="text-red-500">*</span> </label>
                        <Select v-model="selectedDuration" :options="sections" option-value="_id" option-label="duration" show-clear :placeholder="$t('student_attendance.select_duration')" class="min-w-[180px]" />
                    </div>
                    <!-- Class Select -->
                    <div class="flex flex-col">
                        <label class="text-lg font-medium text-gray-700 mb-1"> {{ $t('student_attendance.select_class') }} <span class="text-red-500">*</span> </label>
                        <Select v-model="classSelected" :options="filteredClassesByDuration" option-value="_id" option-label="name" show-clear :placeholder="$t('student_attendance.select_class')" class="min-w-[180px]" :disabled="!selectedDuration" />
                    </div>
                    <!-- Apply Filter Button -->
                    <div class="flex flex-col">
                        <label class="invisible mb-1 select-none">&nbsp;</label>
                        <Button @click="() => filterData(true)" :label="apply_loading ? $t('element.apply') : $t('element.filter')" :loading="apply_loading" class="text-white px-4 py-2 rounded hover:bg-blue-700 bg-blue-600" />
                    </div>
                    <!-- Clear Filter Button -->
                    <div class="flex flex-col">
                        <label class="invisible mb-1 select-none">&nbsp;</label>
                        <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" icon="pi pi-times" class="p-button-secondary" outlined />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div v-if="!loading">
                    <div v-if="filteredData.length > 0" class="py-2">
                        <DataTable :value="filteredData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                            <Column field="_id" :header="$t('element.num')" style="min-width: 150px">
                                <template #body="slotProps">
                                    <p class="font-medium">{{ slotProps.index + 1 }}</p>
                                </template>
                            </Column>
                            <Column field="createdAt" sortable :header="$t('element.createdat')" style="min-width: 150px">
                                <template #body="slotProps">
                                    <p class="font-medium">{{ formatDate2(slotProps.data.createdAt) }}</p>
                                </template>
                            </Column>
                            <Column field="name" :header="$t('student.name')" sortable style="min-width: 200px">
                                <template #body="slotProps">
                                    <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                        {{ slotProps.data.name }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="duration" :header="$t('class.duration')" sortable style="min-width: 200px">
                                <template #body="slotProps">
                                    <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                        {{ formatDuration(slotProps.data?.duration) || 'N/A' }}
                                    </div>
                                </template>
                            </Column>
                            <Column :header="$t('element.action')" style="min-width: 150px">
                                <template #body="slotProps">
                                    <div class="flex space-x-2">
                                        <Button @click="handleStudentClassDetail(slotProps.data)" icon="pi pi-users" rounded />
                                        <Button icon="pi pi-pencil" severity="warn" rounded @click="handleEdit(slotProps.data)" />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                    <div v-else class="w-full flex justify-center items-center bg-white p-4 rounded-lg">
                        <NotFound :message="$t('student.noData')" />
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
                            <DialogPanel class="w-full transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
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
                            <DialogPanel class="w-full transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
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
import { ref, onMounted, watch, computed } from 'vue';
import { useFetch } from '../composible/useFetch';
import ClassDetails from '@/form/ClassDetails.vue';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import { useToast } from 'primevue/usetoast';
import { formatDate2 } from '@/composible/formatDate';
import moment from 'moment';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import StudentClassDetial from '../../App/StudentClassDetial.vue';
import StudentAttendaceForm from '@/form/StudentAttendaceForm.vue';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toast from 'primevue/toast';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const toast = useToast();
const isOpen = ref(false);
const datatoedit = ref(null);
const isClassDetails = ref(false);
const isStudentClassDetail = ref(false);
const apply_loading = ref(false);
const filteredData = ref([]);
const selectedDuration = ref(null);

const collection = ref('classes');
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);
const classSelected = ref(null);

const isFilterActive = computed(() => {
    return classSelected.value || selectedDuration.value;
});

const filteredClassesByDuration = computed(() => {
    if (!selectedDuration.value || !rawData.value) return [];
    return rawData.value.filter((cls) => cls.duration === selectedDuration.value);
});

watch(selectedDuration, () => {
    classSelected.value = null; // Reset class selection when duration changes
});

const formatDuration = (id) => {
    const section = sections.value?.find((section) => section._id === id);
    return section ? section.duration : 'N/A';
};

const filterData = (showNotification = false) => {
    apply_loading.value = true;
    const classId = classSelected.value;
    const durationId = selectedDuration.value;

    if (!classId || !durationId) {
        filteredData.value = [];
        if (showNotification) {
            showToast({ action: 'check_fields', message: 'You need to select both Duration and Class to filter' });
        }
        apply_loading.value = false;
        return;
    }

    const result =
        rawData.value?.filter((item) => {
            return item._id === classId && item.duration === durationId;
        }) || [];

    filteredData.value = result.map((item, index) => ({ ...item, displayIndex: index + 1 }));

    if (showNotification) {
        if (result.length === 0) {
            showToast({ action: 'not_found', message: 'No data matched your filter' });
        } else {
            showToast({ action: 'found', message: `Found ${result.length} result(s)` });
        }
    }

    apply_loading.value = false;
};

const clearFilters = () => {
    classSelected.value = null;
    selectedDuration.value = null;
    filteredData.value = [];
};

watch(rawData, () => filterData(false), { deep: true });

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
    fetchData();
    closeModal();
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
});
</script>

<style scoped>
/* Tailwind CSS is assumed to be included in your project */
</style>
