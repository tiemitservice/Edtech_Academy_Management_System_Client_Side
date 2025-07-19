<template>
    <section class="px-4 mx-auto">
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Book categories</label>
            <div class="flex items-center gap-4">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText :placeholder="$t('element.Searchbyname')" v-model="searchQuery" class="w-full" />
                </IconField>
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
                        <Column field="name" :header="$t('book_category.name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.name }}</div>
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
                    <div v-else>
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
                                    <BookCategoryForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
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
        <Toast position="top-right" />
    </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '../composible/useFetch';
import { useToast } from 'primevue/usetoast';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';

import BookCategoryForm from '@/form/BookCategoryForm.vue';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
const toast = useToast();
import { useI18n } from 'vue-i18n'; // Initialize i18n
const { t } = useI18n();
const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};
// === Refs ===
const isOpen = ref(false);
const isDelete = ref(false);
const datatoedit = ref(null);
const deleteData = ref(null);
const searchQuery = ref('');
const collection = ref('book_categories');

// === Fetch Hook ===
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);

// === Filtering and Data Processing Logic ===
const filteredData = computed(() => {
    if (!rawData.value) return [];
    const q = (searchQuery.value || '').trim().toLowerCase();
    if (!q) {
        return rawData.value;
    }
    return rawData.value.filter((item) => item.name?.toLowerCase().includes(q));
});

const tableData = computed(() => {
    return filteredData.value.map((item, index) => ({
        ...item,
        displayId: index + 1
    }));
});

// === Modal Logic ===
const openModal = () => {
    datatoedit.value = null;
    isOpen.value = true;
};

const closeModal = () => {
    isOpen.value = false;
    datatoedit.value = null;
};

const handleClose = async () => {
    isOpen.value = false;
    datatoedit.value = null;
    await fetchData();
};

const handleEdit = (item) => {
    openModal();
    datatoedit.value = item;
};

// === Delete Logic ===
const handleDeleteConfirm = (id, item) => {
    deleteData.value = id;
    datatoedit.value = item;
    isDelete.value = true;
};

const handleCloseDelete = async () => {
    deleteData.value = null;
    isDelete.value = false;
    await fetchData();
};

// === Lifecycle ===
onMounted(async () => {
    await fetchData();
});
</script>
