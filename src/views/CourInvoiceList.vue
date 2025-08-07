<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('student_payment_transaction.title') }}</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select v-model="filters.period" :options="periodOptions" optionLabel="label" optionValue="value" class="min-w-[180px]" />
                <Select v-model="filters.studentId" :options="students" filter optionLabel="eng_name" optionValue="_id" :placeholder="$t('student_payment.filter_by_student')" showClear class="min-w-[180px]" />
                <Select v-model="filters.classId" :options="classes" filter optionLabel="name" optionValue="_id" :placeholder="$t('student_payment.filter_by_class')" showClear class="min-w-[180px]" />

                <!-- Action Buttons -->
                <Button @click="applyFilters" :label="$t('element.filter')" icon="pi pi-filter" />
                <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <div class="flex flex-col" v-if="!loading">
            <div class="overflow-x-auto">
                <div class="py-2" v-if="tableData.length > 0">
                    <DataTable :value="tableData" :paginator="true" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                        <Column field="displayId" :header="$t('element.num')" sortable style="min-width: 80px">
                            <template #body="slotProps">
                                <p class="font-bold">{{ slotProps.data.displayId }}</p>
                            </template>
                        </Column>

                        <Column field="student_id" :header="$t('student_payment_transaction.student_name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="font-semibold">{{ formatStudentNestedField(slotProps.data.student_id, 'eng_name') }}</div>
                            </template>
                        </Column>

                        <Column field="course_id" :header="$t('student_payment_transaction.class')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="font-semibold">{{ formatClassName(slotProps.data.course_id, 'name') }}</div>
                            </template>
                        </Column>

                        <Column field="amount" :header="$t('student_payment_transaction.amount')" sortable style="min-width: 120px">
                            <template #body="slotProps"> ${{ slotProps.data.amount?.toFixed(2) }} </template>
                        </Column>

                        <Column field="discount" :header="$t('student_payment_transaction.discount')" sortable style="min-width: 120px">
                            <template #body="slotProps"> {{ slotProps.data.discount }}% </template>
                        </Column>

                        <Column field="final_price" :header="$t('student_payment_transaction.final_price')" sortable style="min-width: 120px">
                            <template #body="slotProps">
                                <span class="font-bold text-green-600">${{ slotProps.data.final_price?.toFixed(2) }}</span>
                            </template>
                        </Column>

                        <Column field="first_payment_date" :header="$t('student_payment_transaction.first_payment')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                {{ formatDate2(slotProps.data.first_payment_date) }}
                            </template>
                        </Column>

                        <Column field="next_payment_date" :header="$t('student_payment_transaction.next_payment')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                {{ formatDate2(slotProps.data.next_payment_date) }}
                            </template>
                        </Column>

                        <Column field="payment_type" :header="$t('student_payment_transaction.payment_type')" sortable style="min-width: 120px"></Column>

                        <Column field="status" :header="$t('student_payment_transaction.status')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <Tag :severity="slotProps.data.status === false ? 'success' : 'danger'" :value="slotProps.data.status ? 'Pending' : 'Completed'"></Tag>
                            </template>
                        </Column>

                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-undo" severity="warn" rounded aria-label="Mark as Pending" @click="handleEdit(slotProps.data)" v-tooltip.top="'Mark as Pending'" />
                                    <Button icon="pi pi-print" rounded aria-label="Print" @click="$router.push(`/print_invoice/${slotProps.data._id}`)" v-tooltip.top="'Print Invoice'" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else-if="!loading && tableData.length === 0">
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
                                    <MarkInvoiceForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
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
import MarkInvoiceForm from '@/form/MarkInvoiceForm.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import { useToast } from 'primevue/usetoast';
import { formatDate2 } from '@/composible/formatDate';
import moment from 'moment';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const toast = useToast();

const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action'));
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};

const collection = ref('studentinvoicegenerates');
const { data: rawData, loading, fetchData } = useFetch(collection.value);
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');

const isOpen = ref(false);
const datatoedit = ref(null);
const filteredData = ref([]);

const filters = ref({
    period: 'current_month',
    studentId: null,
    classId: null
});

const periodOptions = ref([
    { label: t('periods.current_month'), value: 'current_month' },
    { label: t('periods.last_month'), value: 'last_month' },
    { label: t('periods.last_3_months'), value: 'last_3_months' }
]);

const isFilterActive = computed(() => {
    return filters.value.period !== 'current_month' || filters.value.studentId !== null || filters.value.classId !== null;
});

const formatClassName = (id, fieldPath, fallback = 'Unknown') => {
    const className = classes.value?.find((cl) => cl._id?.toString() === id?.toString());
    if (!className) return fallback;
    return className[fieldPath] || fallback;
};

const formatStudentNestedField = (id, fieldPath, fallback = 'Unknown') => {
    const student = students.value?.find((s) => s._id?.toString() === id?.toString());
    if (!student) return fallback;
    return student[fieldPath] || fallback;
};

const applyFilters = () => {
    let processed = rawData.value || [];

    // --- Filter for completed transactions ---
    processed = processed.filter((item) => item.status === false);

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

const tableData = computed(() => {
    return filteredData.value.map((item, index) => ({
        ...item,
        displayId: index + 1
    }));
});

watch(rawData, applyFilters, { deep: true, immediate: true });

const handleEdit = (data) => {
    datatoedit.value = data;
    openModal();
};
const handleClose = () => {
    isOpen.value = false;
    datatoedit.value = null;
    fetchData();
};
function closeModal() {
    isOpen.value = false;
    datatoedit.value = null;
}
function openModal() {
    isOpen.value = true;
}

onMounted(async () => {
    await Promise.all([fetchClasses(), fetchStudents(), fetchData()]);
});
</script>
