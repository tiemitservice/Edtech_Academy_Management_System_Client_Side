<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('asign_student.title') }}</label>
            <div class="flex flex-wrap gap-4 items-start">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" :placeholder="$t('element.Searchbyname')" class="min-w-[200px]" />
                </IconField>
                <div class="w-64">
                    <Calendar show-icon v-model="createdAt_select" selectionMode="range" show-button-bar placeholder="Filter by created at" />
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2" v-if="!loading">
                    <DataTable v-if="data.length > 0" :value="data" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="_id" :header="$t('element.num')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.index + 1 }}</p>
                            </template>
                        </Column>

                        <Column field="name" :header="$t('class.name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    {{ slotProps.data.name }}
                                </div>
                            </template>
                        </Column>

                        <Column field="duration" :header="$t('class.duration')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    {{ formatDuration(slotProps.data.duration) }}
                                </div>
                            </template>
                        </Column>

                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                    <div v-else>
                        <NotFound message="No available classes found for the selected criteria." />
                    </div>
                </div>
                <div v-else>
                    <Laoding />
                </div>
            </div>
        </div>

        <!-- Modal for Assigning Students -->
        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="closeModal" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <AssigneStudentForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" @save="fetchData" />
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
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import { useToast } from 'primevue/usetoast';
import AssigneStudentForm from '@/form/AssigneStudentForm.vue';
import Laoding from './pages/Laoding.vue';
import NotFound from './pages/NotFound.vue';
import moment from 'moment';

const toast = useToast();
const showToast = (action, severity) => {
    let summary;
    switch (action) {
        case 'create':
            severity = 'success';
            summary = ' Created Success';
            break;
        case 'update':
            severity = 'info';
            summary = ' Updated Success';
            break;
        case 'delete':
            summary = ' Deleted Success';
            break;
        default:
            severity = 'info';
            summary = 'Action Completed';
    }

    toast.add({
        severity: severity,
        summary: summary,
        life: 3000
    });
};

const { data: sections, fetchData: fetchSections } = useFetch('sections');

const formatDuration = (id) => {
    const section = sections.value?.find((s) => s._id === id);
    return section ? section.duration : 'N/A';
};
const collection = ref('classes');
const isOpen = ref(false);
const datatoedit = ref(null);

const handleEdit = (item) => {
    datatoedit.value = item;
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

const { data: rawData, loading, error, fetchData } = useFetch(collection.value);

const searchQuery = ref('');
const createdAt_select = ref([moment().startOf('year').toDate(), moment().endOf('year').toDate()]);
const data = ref([]);

const filterData = () => {
    const q = searchQuery.value.trim().toLowerCase();
    const start = Array.isArray(createdAt_select.value) ? createdAt_select.value[0] : null;
    const end = Array.isArray(createdAt_select.value) ? createdAt_select.value[1] : null;

    data.value =
        rawData.value?.filter((item) => {
            const matchesName = !q || item.name?.toLowerCase().includes(q);
            const matchesCreatedAt = !start || !end ? true : moment(item.createdAt).isBetween(moment(start).startOf('day'), moment(end).endOf('day'), undefined, '[]');
            // Corrected logic: Show classes that are NOT completed to assign students.
            const isNotCompleted = item.mark_as_completed !== false;
            return matchesName && matchesCreatedAt && isNotCompleted;
        }) || [];
};

// Watch for changes in filters to re-apply filtering
watch([searchQuery, createdAt_select], filterData);

// **FIX:** Watch for changes in the raw data (from real-time updates) to re-apply filtering
watch(rawData, filterData, { deep: true });

onMounted(async () => {
    await Promise.all([fetchData(), fetchSections()]);
    // The watcher on rawData will now handle the initial filtering
});
</script>
