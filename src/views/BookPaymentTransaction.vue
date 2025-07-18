<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white"> Book Payment Transactions</label>
            <div class="flex items-center gap-2 flex-wrap justify-end">
                <!-- Filters -->
                <Select filter v-model="filters.studentId" :options="students" optionLabel="eng_name" optionValue="_id" placeholder="Filter by Student" showClear class="min-w-[180px]" />
                <Select v-model="filters.bookId" :options="books" optionLabel="name" optionValue="_id" placeholder="Filter by Book" showClear class="min-w-[180px]" />
                <Select v-model="filters.day" :options="days" placeholder="Day" showClear class="min-w-[100px]" />
                <Select v-model="filters.month" :options="months" optionLabel="name" optionValue="value" placeholder="Month" showClear class="min-w-[120px]" />
                <Select v-model="filters.year" :options="years" placeholder="Year" showClear class="min-w-[120px]" />

                <!-- Action Buttons -->
                <Button v-if="isFilterActive" @click="clearFilters" label="Clear" icon="pi pi-times" class="p-button-secondary" />
                <!-- <Button @click="openModal" label="Add new" /> -->
            </div>
        </div>

        <!-- Data Table -->
        <div class="flex flex-col" v-if="!loading">
            <div class="overflow-x-auto">
                <div v-if="tableData.length > 0" class="py-2">
                    <DataTable :value="tableData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="displayId" header="No." sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.displayId }}</p>
                            </template>
                        </Column>

                        <Column field="createdAt" header="Date" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ formatDate(slotProps.data.createdAt) }}</p>
                            </template>
                        </Column>

                        <Column field="student_name" header="Student" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg rounded-full">{{ slotProps.data.student_name }}</div>
                            </template>
                        </Column>

                        <Column field="book_names" header="Books" sortable style="min-width: 250px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg rounded-full">{{ slotProps.data.book_names }}</div>
                            </template>
                        </Column>

                        <Column field="book_amount" header="Book Amount" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.book_amount }}</p>
                            </template>
                        </Column>

                        <Column field="final_price" header="Total Price" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-bold text-green-600">${{ slotProps.data.final_price?.toFixed(2) }}</p>
                            </template>
                        </Column>

                        <Column field="mark_as_completed" header="Status" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <Tag :severity="slotProps.data.mark_as_completed ? 'success' : 'danger'" :value="slotProps.data.mark_as_completed ? 'Completed' : 'Pending'"></Tag>
                            </template>
                        </Column>

                        <Column header="Actions" style="min-width: 150px">
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
import Toast from 'primevue/toast';
import Tag from 'primevue/tag';

// === DATA FETCHING ===
const collection = ref('bookpayments');
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: books, fetchData: fetchBooks } = useFetch('books');

// === COMPONENT STATE ===
const isOpen = ref(false);
const datatoedit = ref(null);

// === FILTERING LOGIC ===
const filters = ref({
    studentId: null,
    bookId: null,
    day: null,
    month: null,
    year: null
});

const days = ref(Array.from({ length: 31 }, (_, i) => i + 1));
const months = ref(moment.months().map((m, i) => ({ name: m, value: i + 1 })));
const currentYear = moment().year();
const years = ref(Array.from({ length: 10 }, (_, i) => currentYear - 5 + i));

const setDefaultFilters = () => {
    const now = moment();
    filters.value.year = now.year();
    filters.value.month = now.month() + 1;
    filters.value.day = null;
    filters.value.studentId = null;
    filters.value.bookId = null;
};

const isFilterActive = computed(() => {
    const now = moment();
    return filters.value.studentId !== null || filters.value.bookId !== null || filters.value.day !== null || filters.value.month !== now.month() + 1 || filters.value.year !== now.year();
});

const clearFilters = () => {
    setDefaultFilters();
};

// === DATA PROCESSING & COMPUTED PROPS ===
const tableData = computed(() => {
    if (!rawData.value || !students.value || !books.value) return [];

    let dataToFilter = rawData.value.filter((item) => item.mark_as_completed === true);

    // Filter by date
    if (filters.value.year) {
        dataToFilter = dataToFilter.filter((item) => moment(item.createdAt).year() === filters.value.year);
    }
    if (filters.value.month) {
        dataToFilter = dataToFilter.filter((item) => moment(item.createdAt).month() + 1 === filters.value.month);
    }
    if (filters.value.day) {
        dataToFilter = dataToFilter.filter((item) => moment(item.createdAt).date() === filters.value.day);
    }

    // Filter by student
    if (filters.value.studentId) {
        dataToFilter = dataToFilter.filter((item) => item.student_id === filters.value.studentId);
    }

    // Filter by book
    if (filters.value.bookId) {
        dataToFilter = dataToFilter.filter((item) => item.book_id?.includes(filters.value.bookId));
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

const showToast = (action, severity) => {
    const summary = { create: 'Created Success', update: 'Updated Success', delete: 'Deleted Success' }[action] || 'Action Completed';
    const finalSeverity = { create: 'success', update: 'info', delete: 'success' }[action] || severity;
    toast.add({ severity: finalSeverity, summary, life: 3000 });
};

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
    setDefaultFilters();
    await Promise.all([fetchStudents(), fetchBooks(), fetchData()]);
});
</script>
