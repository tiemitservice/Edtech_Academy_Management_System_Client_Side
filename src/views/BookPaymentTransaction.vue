<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white text-nowrap"> {{ $t('book_payment_transaction.title') }} </label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select filter v-model="filters.studentId" :options="students" optionLabel="eng_name" optionValue="_id" :placeholder="$t('book_payment_transaction.student_name')" showClear class="min-w-[180px]" />
                <Calendar v-model="filters.date" selectionMode="range" showIcon dateFormat="yy-mm-dd" :placeholder="$t('element.createdat')" class="min-w-[220px]" />

                <!-- Action Buttons -->
                <Button @click="applyFilters" :label="$t('element.filter')" icon="pi pi-filter" />
                <Button v-if="isFilterActive" @click="clearFilters" :label="$t('element.clear')" icon="pi pi-times" class="p-button-secondary" />
            </div>
        </div>

        <!-- Data Table -->
        <div class="flex flex-col" v-if="!loading">
            <div class="overflow-x-auto">
                <div v-if="tableData.length > 0" class="py-2">
                    <DataTable :value="tableData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="displayId" :header="$t('element.num')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.displayId }}</p>
                            </template>
                        </Column>

                        <Column field="createdAt" :header="$t('element.createdat')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ formatDate(slotProps.data.createdAt) }}</p>
                            </template>
                        </Column>

                        <Column field="student_name" :header="$t('student_payment_transaction.student_name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg rounded-full">{{ slotProps.data.student_name }}</div>
                            </template>
                        </Column>

                        <Column field="book_names" :header="$t('book_payment.book_name')" sortable style="min-width: 250px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg rounded-full">{{ slotProps.data.book_names }}</div>
                            </template>
                        </Column>

                        <Column field="book_amount" :header="$t('book_payment.total_amount')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.book_amount }}</p>
                            </template>
                        </Column>

                        <Column field="final_price" :header="$t('book_payment.total_price')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-bold text-green-600">${{ slotProps.data.final_price?.toFixed(2) }}</p>
                            </template>
                        </Column>

                        <Column field="mark_as_completed" :header="$t('element.status')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <Tag :severity="slotProps.data.mark_as_completed ? 'success' : 'danger'" :value="slotProps.data.mark_as_completed ? 'Completed' : 'Pending'"></Tag>
                            </template>
                        </Column>

                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-undo" severity="warn" rounded aria-label="Undo" @click="handleEdit(slotProps.data)" />
                                    <Button icon="pi pi-print" rounded aria-label="Print" @click="$router.push(`/book-invoice/${slotProps.data._id}`)" />
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
                                <div class="mt-2">
                                    <RemarkBookInvoice :datatoedit="datatoedit" @close="handleClose" @toast="showToast" @save="fetchData" />
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
import moment from 'moment';

// Import all components used in the template
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import RemarkBookInvoice from '@/form/RemarkBookInvoice.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import { useToast } from 'primevue/usetoast';
import Select from 'primevue/select';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action'));
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};
// === DATA FETCHING ===
const collection = ref('bookpayments');
const { data: rawData, loading, fetchData } = useFetch(collection.value);
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: books, fetchData: fetchBooks } = useFetch('books');

// === COMPONENT STATE ===
const isOpen = ref(false);
const datatoedit = ref(null);

// === FILTERING LOGIC ===
const filters = ref({
    studentId: null,
    date: null
});
const activeFilters = ref({
    studentId: null,
    date: null
});

const isFilterActive = computed(() => {
    return activeFilters.value.studentId !== null || activeFilters.value.date !== null;
});

const applyFilters = () => {
    activeFilters.value = { ...filters.value };
};

const clearFilters = () => {
    filters.value = { studentId: null, date: null };
    activeFilters.value = { studentId: null, date: null };
};

// === DATA PROCESSING & COMPUTED PROPS ===
const tableData = computed(() => {
    if (!rawData.value || !students.value || !books.value) return [];

    let dataToFilter = rawData.value.filter((item) => item.mark_as_completed === true);

    // Filter by date range
    const dateFilter = activeFilters.value.date;
    if (dateFilter && dateFilter[0]) {
        if (dateFilter[1]) {
            // If a complete range is selected
            const startDate = moment(dateFilter[0]).startOf('day');
            const endDate = moment(dateFilter[1]).endOf('day');
            dataToFilter = dataToFilter.filter((item) => moment(item.createdAt).isBetween(startDate, endDate));
        } else {
            // If only a single date is selected
            const selectedDate = moment(dateFilter[0]);
            dataToFilter = dataToFilter.filter((item) => moment(item.createdAt).isSame(selectedDate, 'day'));
        }
    }

    // Filter by student
    if (activeFilters.value.studentId) {
        dataToFilter = dataToFilter.filter((item) => item.student_id === activeFilters.value.studentId);
    }

    // Add display-friendly and sortable fields
    return dataToFilter.map((item, index) => ({
        ...item,
        displayId: index + 1,
        student_name: formatStudentName(item.student_id),
        book_names: formatBookNames(item.book_id)
    }));
});

// === HELPER FUNCTIONS ===
const toast = useToast();

const formatDate = (date) => (date ? moment(date).format('YYYY-MM-DD') : 'N/A');
const formatStudentName = (studentId) => students.value?.find((s) => s._id === studentId)?.eng_name || 'Unknown';
const formatBookNames = (bookIds) => {
    if (!bookIds?.length || !books.value) return 'No books';
    return bookIds.map((id) => books.value.find((b) => b._id === id)?.name || 'Unknown').join(', ');
};

// === MODAL & CRUD HANDLING ===
const openModal = () => {
    datatoedit.value = null;
    isOpen.value = true;
};

const closeModal = () => {
    isOpen.value = false;
    datatoedit.value = null;
};

const handleEdit = (item) => {
    datatoedit.value = item;
    isOpen.value = true;
};

const handleClose = async (shouldRefetch) => {
    closeModal();
    if (shouldRefetch) {
        await fetchData();
    }
};

// === LIFECYCLE HOOK ===
onMounted(async () => {
    await Promise.all([fetchStudents(), fetchBooks(), fetchData()]);
});
</script>
