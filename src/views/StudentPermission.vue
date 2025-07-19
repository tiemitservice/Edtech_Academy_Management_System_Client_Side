<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg flex-wrap">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('student_permission.title') }}</label>
            <div class="flex items-center gap-4 flex-wrap">
                <!-- Filters -->
                <Select v-model="filters.studentId" :options="students" filter optionLabel="eng_name" optionValue="_id" :placeholder="$t('student_permission.filter_by_student')" showClear class="min-w-[180px]" />
                <Select v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value" :placeholder="$t('student_permission.filter_by_status')" showClear class="min-w-[150px]" />
                <Calendar v-model="filters.date" dateFormat="yy-mm-dd" showIcon :placeholder="$t('element.date')" />
                <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" icon="pi pi-times" class="p-button-secondary" />
                <Button @click="openModal" :label="$t('element.addnew')" />
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <!-- Loading State -->
                <div v-if="loading" class="py-2 text-center">
                    <Laoding />
                </div>
                <!-- Data Table or Not Found Message -->
                <div v-else class="py-2">
                    <DataTable v-if="tableData.length > 0" :value="tableData" striped-rows="true" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <!-- UPDATED: This column now correctly sorts by the 'displayId' field -->
                        <Column field="displayId" :header="$t('element.num')" sortable style="min-width: 50px">
                            <template #body="slotProps">{{ slotProps.data.displayId }}</template>
                        </Column>
                        <Column field="studentId" :header="$t('student_permission.student')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ formatStudentName(slotProps.data.studentId) }}</div>
                            </template>
                        </Column>
                        <Column field="created_at" :header="$t('element.createdat')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ formatDate2(slotProps.data.created_at) }}</div>
                            </template>
                        </Column>
                        <Column field="reason" :header="$t('student_permission.reason')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.reason }}</div>
                            </template>
                        </Column>
                        <Column field="permissent_status" class="capitalize" :header="$t('student_permission.status')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <Tag :severity="getStatusSeverity(slotProps.data.permissent_status)" :value="slotProps.data.permissent_status"></Tag>
                            </template>
                        </Column>
                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-inbox" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    <Button @click="handleDeleteConfirm(slotProps.data._id, slotProps.data)" icon="pi pi-trash" severity="danger" rounded aria-label="Delete" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                    <div v-else>
                        <NotFound message="No permission requests found for the selected criteria." />
                    </div>
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="closeModal" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                                <div class="">
                                    <StudentApproveForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" @save="handleSave" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

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
                                <div class="mt-2">
                                    <DeleteConfimation :deleteData="deleteId" :datatoedit="datatoedit" :collection="collection" @close="handleCloseDelete" @toast="showToast" />
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
import { ref, onMounted, computed, watch } from 'vue';
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import { useToast } from 'primevue/usetoast';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import StudentApproveForm from '@/form/StudentApproveForm.vue';
import Laoding from './pages/Laoding.vue';
import NotFound from './pages/NotFound.vue';
import moment from 'moment';
import { formatDate2 } from '@/composible/formatDate';
import { useI18n } from 'vue-i18n';
const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};

// Initialize i18n
const { t } = useI18n();
// --- Component State ---
const isOpen = ref(false);
const datatoedit = ref(null);
const isDelete = ref(false);
const deleteId = ref(null);
const collection = ref('student_permissions');
const toast = useToast();

// --- Data Fetching ---
const { data: rawData, loading, fetchData } = useFetch(collection.value);
const { data: students, fetchData: fetchStudents } = useFetch('students');

// --- Filtering ---
const filters = ref({
    status: null,
    date: new Date(), // Default to today
    studentId: null
});

const statusOptions = ref([
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' }
]);

const filteredData = computed(() => {
    if (!rawData.value) return [];

    let data = [...rawData.value];

    // Filter by status
    if (filters.value.status) {
        data = data.filter((item) => item.permissent_status === filters.value.status);
    }

    // Filter by student
    if (filters.value.studentId) {
        data = data.filter((item) => item.studentId === filters.value.studentId);
    }

    // Filter by date
    // ALTERNATIVE (filter only if date selected)
    if (filters.value.date) {
        const selectedDate = moment(filters.value.date);
        data = data.filter((item) => moment(item.created_at).isSame(selectedDate, 'day'));
    }

    return data;
});

// --- UPDATED: New computed property to add a sortable ID ---
const tableData = computed(() => {
    return filteredData.value.map((item, index) => ({
        ...item,
        displayId: index + 1
    }));
});

const isFilterActive = computed(() => {
    return filters.value.status !== null || filters.value.studentId !== null || !moment(filters.value.date).isSame(moment(), 'day');
});

const clearFilters = () => {
    filters.value.status = null;
    filters.value.studentId = null;
    filters.value.date = new Date();
};

// --- Helper Functions ---
const formatStudentName = (studentId) => {
    return students.value?.find((s) => s._id === studentId)?.eng_name || 'Unknown';
};

const getStatusSeverity = (status) => {
    const severityMap = { accepted: 'success', rejected: 'danger', pending: 'warn' };
    return severityMap[status] || 'info';
};

// --- Modal and CRUD Handlers ---
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

const handleSave = () => {
    fetchData(); // Refetch data after a save operation
    closeModal();
};

const handleClose = () => {
    closeModal();
};

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
        await fetchData();
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await Promise.all([fetchData(), fetchStudents()]);
});
</script>
