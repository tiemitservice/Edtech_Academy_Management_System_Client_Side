<template>
    <div class="space-y-4">
        <div class="py-2 flex flex-col md:flex-row justify-between items-center mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Students Class Info</label>

            <!-- Left: All filters and search in a row, wrap on small screens -->
            <div class="flex flex-wrap gap-4 items-end">
                <div class="flex flex-col">
                    <label for="" class="text-lg font-medium text-gray-700 mb-1">
                        Select Student <span><span class="text-red-500">*</span></span>
                    </label>
                    <Dropdown v-model="selectedStudent" showClear filter :options="studentOptions" optionLabel="eng_name" optionValue="_id" placeholder="Select Student" class="w-full md:w-64" />
                </div>
                <div>
                    <label class="invisible mb-1 select-none">&nbsp;</label>
                    <Button label="Apply Filter" @click="applyFilter" />
                </div>
            </div>
        </div>
        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <DataTable :value="filteredClasses" showGridlines class="mt-4" v-if="filteredClasses.length > 0">
                    <Column field="name" header="Class Name" />
                    <Column field="subject" header="Subject">
                        <template #body="{ data }">
                            {{ formatSubject(data.subject) }}
                        </template>
                    </Column>
                    <Column field="duration" header="Section">
                        <template #body="{ data }">
                            {{ formatDuration(data.duration) }}
                        </template>
                    </Column>
                    <Column field="createdAt" header="Year">
                        <template #body="{ data }">
                            {{ formatYear(data.createdAt) }}
                        </template>
                    </Column>
                    <!-- <Column header="Mark Completed">
                        <template #body="{ data }">
                            <Tag :value="data.mark_as_completed ? 'Yes' : 'No'" :severity="data.mark_as_completed ? 'success' : 'danger'" />
                        </template>
                    </Column> -->
                </DataTable>
                <NotFound v-else />
            </div>
        </div>
        <Toast position="top-right" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import moment from 'moment';
import NotFound from './pages/NotFound.vue';
import { useToast } from 'primevue';
const { data: student, fetchData: fetchStudents } = useFetch('students');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const selectedStudent = ref(null);
const filteredClasses = ref([]);
const loading = ref(false);
const formatSubject = (id) => {
    const subject = subjects.value?.find((subject) => subject._id === id);
    return subject ? subject.name : 'N/A';
};
const studentOptions = computed(
    () =>
        student.value?.map((s) => ({
            _id: s._id,
            eng_name: s.eng_name,
            kh_name: s.kh_name
        })) || []
);

const formatDuration = (id) => {
    const section = sections.value?.find((s) => s._id === id);
    return section ? section.duration : 'N/A';
};

const formatYear = (date) => {
    return moment(date).format('YYYY');
};
const toast = useToast();

const showToast = (payload) => {
    let action = typeof payload === 'string' ? payload : payload.action;
    let customMessage = typeof payload === 'object' ? payload.message : null;

    let severity;
    let summary;

    switch (action) {
        case 'create':
            severity = 'success';
            summary = 'Created Successfully';
            break;
        case 'update':
            severity = 'info';
            summary = 'Updated Successfully';
            break;
        case 'delete':
            severity = 'error';
            summary = 'Deleted Successfully';
            break;
        case 'check_fields':
            severity = 'warn';
            summary = customMessage || 'Please fill all the required fields';
            break;
        case 'server_error':
            severity = 'error';
            summary = customMessage || 'Server error occurred';
            break;
        case 'asociate':
            severity = 'warn';
            summary = 'Please delete the associated data first';
            break;
        case 'not_found':
            severity = 'warn';
            summary = customMessage || 'No matching records found';
            break;
        case 'found':
            severity = 'info';
            summary = customMessage || 'Data found successfully';
            break;
        default:
            severity = 'info';
            summary = 'Action Completed';
    }

    toast.add({ severity, summary, life: 3000 });
};
const applyFilter = () => {
    if (!selectedStudent.value) {
        filteredClasses.value = [];
        showToast({ action: 'not_found', message: 'Please select a student to filter' });
        return;
    }

    loading.value = true;

    setTimeout(() => {
        const result =
            classes.value?.filter(
                (cls) =>
                    cls.mark_as_completed === true &&
                    cls.students?.some((s) => {
                        const id = typeof s.student === 'object' ? s.student._id : s.student;
                        return id === selectedStudent.value;
                    })
            ) || [];

        filteredClasses.value = result;
        loading.value = false;

        if (result.length > 0) {
            showToast({ action: 'found', message: `Found ${result.length} class` });
        } else {
            showToast({ action: 'not_found', message: 'No classes found for the selected student' });
        }
    }, 300);
};

onMounted(async () => {
    await Promise.allSettled([fetchClasses(), fetchStudents(), fetchSections(), fetchSubjects()]);
});
</script>
