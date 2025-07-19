<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('student_payment.title') }}</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.period" :options="periodOptions" optionLabel="label" optionValue="value" class="min-w-[180px]" />
                <Select v-model="filters.studentId" :options="students" filter optionLabel="eng_name" optionValue="_id" :placeholder="$t('student_payment.filter_by_student')" showClear class="min-w-[180px]" />
                <Select v-model="filters.classId" :options="classes" filter optionLabel="name" optionValue="_id" :placeholder="$t('student_payment.filter_by_class')" showClear class="min-w-[180px]" />

                <!-- Action Buttons -->
                <Button @click="applyFilters" :label="$t('element.filter')" icon="pi pi-filter" />
                <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" icon="pi pi-times" class="p-button-secondary" />
                <Button @click="openModal" :label="$t('element.addnew')" />
            </div>
        </div>

        <!-- Data Table -->
        <div class="flex flex-col" v-if="!loading">
            <div class="overflow-x-auto">
                <div class="py-2" v-if="tableData.length > 0">
                    <DataTable :value="tableData" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                        <Column field="displayId" :header="$t('element.num')" sortable style="min-width: 80px">
                            <template #body="slotProps">
                                <div class="p-3 rounded" :class="getHighlightClass(slotProps.data)">
                                    <p class="font-medium">{{ slotProps.data.displayId }}</p>
                                </div>
                            </template>
                        </Column>

                        <Column field="student_name" :header="$t('student.name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="px-3 py-1 text-lg font-semibold text-nowrap rounded" :class="getHighlightClass(slotProps.data)">
                                    {{ slotProps.data.student_name }}
                                </div>
                            </template>
                        </Column>

                        <Column field="class_name" :header="$t('class_history.class_name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="px-3 py-1 text-lg font-semibold text-nowrap rounded" :class="getHighlightClass(slotProps.data)">
                                    {{ slotProps.data.class_name }}
                                </div>
                            </template>
                        </Column>

                        <Column field="first_payment_date" :header="$t('student_payment.payment_date')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="px-3 py-1 text-lg font-semibold text-nowrap rounded" :class="getHighlightClass(slotProps.data)">
                                    {{ slotProps.data?.first_payment_date ? formatDate2(slotProps.data?.first_payment_date) : 'N/A' }}
                                </div>
                            </template>
                        </Column>

                        <Column field="next_payment_date" :header="$t('student_payment.next_payment_date')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="px-3 py-1 text-lg font-semibold text-nowrap rounded" :class="getHighlightClass(slotProps.data)">
                                    {{ slotProps.data?.next_payment_date ? formatDate2(slotProps.data.next_payment_date) : 'N/A' }}
                                </div>
                            </template>
                        </Column>

                        <Column field="payment_type" :header="$t('student_payment.payment_type')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="px-3 py-1 text-lg font-semibold text-nowrap rounded" :class="getHighlightClass(slotProps.data)">
                                    {{ slotProps.data?.payment_type ?? 'N/A' }}
                                </div>
                            </template>
                        </Column>

                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2 p-1 rounded" :class="getHighlightClass(slotProps.data)">
                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    <Button
                                        :disabled="!slotProps.data?.next_payment_date && !slotProps.data?.first_payment_date && !slotProps.data?.payment_type"
                                        @click="handleReset(slotProps.data)"
                                        icon="pi pi-file-export"
                                        severity="success"
                                        rounded
                                        aria-label="Reset"
                                    />
                                    <Button
                                        :disabled="!slotProps.data?.next_payment_date && !slotProps.data?.first_payment_date && !slotProps.data?.payment_type"
                                        @click="handleMakeTracking(slotProps.data)"
                                        icon="pi pi-info"
                                        severity="danger"
                                        rounded
                                        aria-label="Reset"
                                    />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else>
                    <NotFound />
                </div>
            </div>
        </div>
        <div v-else>
            <Laoding />
        </div>

        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="closeModal" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                                <div class="mt-2">
                                    <GenerateStudentInvoiceForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" @save="handleSave" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <TransitionRoot appear :show="isReset" as="template">
            <Dialog as="div" @close="handleCloseReset" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <ResetPaymentForm :datatoedit="datatoedit" :collection="collection" @close="handleCloseReset" @toast="showToast" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
        <TransitionRoot appear :show="isMakeTracking" as="template">
            <Dialog as="div" @close="handleCloseTracking" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <MakeTrackingForm :datatoedit="datatoedit" :collection="collection" @close="handleCloseTracking" @toast="showToast" />
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
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import GenerateStudentInvoiceForm from '@/form/GenerateStudentInvoiceForm.vue';
import ResetPaymentForm from '@/form/ResetPaymentForm.vue';
import MakeTrackingForm from '@/form/MakeTrackingForm.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { formatDate2 } from '@/composible/formatDate';

import { useI18n } from 'vue-i18n'; // Initialize i18n
const { t } = useI18n();
const toast = useToast();

const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};
const collection = ref('studentinvoicegenerates');
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const isMakeTracking = ref(false);
const handleMakeTracking = (doc) => {
    isMakeTracking.value = true;
    datatoedit.value = doc;
};
const handleCloseTracking = () => {
    isMakeTracking.value = false;
    datatoedit.value = null;
};
const isOpen = ref(false);
const datatoedit = ref(null);
const isReset = ref(false);
const filteredData = ref([]);

const filters = ref({
    period: 'current_month',
    studentId: null,
    classId: null
});

const periodOptions = ref([
    { label: 'Current Month', value: 'current_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: 'last_3_months' }
]);

const isFilterActive = computed(() => {
    return filters.value.period !== 'current_month' || filters.value.studentId !== null || filters.value.classId !== null;
});

const applyFilters = () => {
    if (!Array.isArray(rawData.value) || !Array.isArray(students.value) || !Array.isArray(classes.value)) {
        filteredData.value = [];
        return;
    }

    let processed = rawData.value.map((report) => ({
        ...report,
        student_name: students.value.find((s) => s._id === report.student_id)?.eng_name || 'Unknown',
        class_name: classes.value.find((c) => c._id === report.course_id)?.name || 'Unknown'
    }));

    // --- Default filter for status: true ---
    processed = processed.filter((item) => item.status === true && item.mark_as_completed === true);

    // Time-based filtering
    const now = moment();
    switch (filters.value.period) {
        case 'current_month':
            processed = processed.filter((item) => moment(item.createdAt).isSame(now, 'month'));
            break;
        case 'last_month':
            const lastMonth = now.clone().subtract(1, 'month');
            processed = processed.filter((item) => moment(item.createdAt).isSame(lastMonth, 'month'));
            break;
        case 'last_3_months':
            const threeMonthsAgo = now.clone().subtract(3, 'months');
            processed = processed.filter((item) => moment(item.createdAt).isAfter(threeMonthsAgo));
            break;
    }

    // Student filter
    if (filters.value.studentId) {
        processed = processed.filter((item) => item.student_id === filters.value.studentId);
    }

    // Class filter
    if (filters.value.classId) {
        processed = processed.filter((item) => item.course_id === filters.value.classId);
    }

    filteredData.value = processed;
};

const clearFilters = () => {
    filters.value.period = 'current_month';
    filters.value.studentId = null;
    filters.value.classId = null;
    applyFilters();
};

watch(rawData, applyFilters, { deep: true });

// NEW: Computed property to add a sortable ID to the filtered data
const tableData = computed(() => {
    return filteredData.value.map((item, index) => ({
        ...item,
        displayId: index + 1
    }));
});

const getHighlightClass = (data) => {
    if (!data.next_payment_date) return null;
    const today = moment().startOf('day');
    const nextPayment = moment(data.next_payment_date, 'YYYY-MM-DD').startOf('day');
    if (!nextPayment.isValid()) return null;
    if (nextPayment.isBefore(today)) {
        return 'text-[#DC2626]'; // Red for overdue
    }
    const daysUntilPayment = nextPayment.diff(today, 'days');
    if (daysUntilPayment >= 0 && daysUntilPayment <= 5) {
        return 'text-[#F97316]'; // Orange for upcoming
    }
    return null;
};

const handleReset = (item) => {
    isReset.value = true;
    datatoedit.value = item;
};
const handleCloseReset = async () => {
    isReset.value = false;
    await fetchData();
};
const handleEdit = (doc) => {
    openModal();
    datatoedit.value = doc;
};
const handleClose = () => {
    isOpen.value = false;
    datatoedit.value = null;
};
const handleSave = () => {
    fetchData();
    closeModal();
};
function closeModal() {
    isOpen.value = false;
    datatoedit.value = null;
}
function openModal() {
    isOpen.value = true;
    datatoedit.value = null;
}

onMounted(async () => {
    await Promise.all([fetchData(), fetchStudents(), fetchClasses()]);
    applyFilters(); // Apply default filters on mount
});
</script>
