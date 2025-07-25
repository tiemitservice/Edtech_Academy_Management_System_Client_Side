<template>
    <section class="px-4 mx-auto">
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between flex-wrap">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('book.title') }}</label>
            <div class="flex items-center gap-4 flex-wrap">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText :placeholder="$t('element.Searchbyname')" v-model="searchQuery" class="w-full" />
                </IconField>
                <Select v-model="selectedBookCategory" :options="book_categories" :filter="true" option-value="_id" option-label="name" show-clear :placeholder="$t('book.select_type')" class="min-w-[180px]" />
                <Button @click="filterData()" :label="$t('element.filter')" />
                <Button @click="openModal" :label="$t('element.addnew')" />
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2" v-if="!loading">
                    <DataTable v-if="tableData.length > 0" :value="tableData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="displayId" :header="$t('element.num')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.displayId }}</p>
                            </template>
                        </Column>

                        <!-- start data -->
                        <Column field="name" :header="$t('book.name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">{{ slotProps.data.name }}</div>
                            </template>
                        </Column>

                        <Column field="price" :header="$t('book.price')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">{{ slotProps.data.price }} $</div>
                            </template>
                        </Column>
                        <Column field="stock" :header="$t('book.quantity')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">{{ slotProps.data.stock }}</div>
                            </template>
                        </Column>
                        <Column field="bookType" :header="$t('book.type')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">{{ formatBookCategory(slotProps.data?.bookType) }}</div>
                            </template>
                        </Column>

                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    <Button @click="handleDeleteConfirm(slotProps.data._id, slotProps.data)" icon="pi pi-trash" severity="danger" rounded aria-label="Delete" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                    <div v-else-if="hasFiltered">
                        <NotFound />
                    </div>
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
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                                <div class="mt-2">
                                    <BookForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
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
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <DeleteConfimation :deleteData="deleteData" :datatoedit="datatoedit" :collection="collection" @close="handleCloseDelete" @toast="showToast" />
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
import BookForm from '@/form/BookForm.vue';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import { useI18n } from 'vue-i18n'; // Initialize i18n
const { t } = useI18n();
const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};
const collection = ref('books');
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);
const { data: book_categories, fetchData: fetchBookCategories } = useFetch('book_categories');

const formatBookCategory = (id) => {
    if (!id || !book_categories.value) return 'N/A';
    const category = book_categories.value.find((cat) => cat?._id === id);
    return category?.name || 'N/A';
};

const isOpen = ref(false);
const datatoedit = ref(null);

const searchQuery = ref('');
const selectedBookCategory = ref(null);
const hasFiltered = ref(false);

// This computed property will handle all filtering logic
const filteredData = computed(() => {
    if (!rawData.value) return [];

    const q = (searchQuery.value || '').trim().toLowerCase();

    return rawData.value.filter((item) => {
        const matchesName = !q || item.name?.toLowerCase().includes(q);
        const matchesBookCategory = !selectedBookCategory.value || item.bookType === selectedBookCategory.value;
        return matchesName && matchesBookCategory;
    });
});

// This computed property adds the sortable displayId to the filtered data
const tableData = computed(() => {
    return filteredData.value.map((item, index) => ({
        ...item,
        displayId: index + 1
    }));
});

const isDelete = ref(false);
const deleteData = ref(null);
const handleDeleteConfirm = async (id, doc) => {
    deleteData.value = id;
    isDelete.value = true;
    datatoedit.value = doc;
};
const handleCloseDelete = async () => {
    isDelete.value = false;
    deleteData.value = null;
    await fetchData();
};
const handleEdit = (data) => {
    datatoedit.value = data;
    openModal();
};
const handleClose = () => {
    isOpen.value = false;
    datatoedit.value = null;
};
function closeModal() {
    isOpen.value = false;
    datatoedit.value = null;
}
function openModal() {
    isOpen.value = true;
}

onMounted(async () => {
    await fetchData();
    await fetchBookCategories();
});
</script>
