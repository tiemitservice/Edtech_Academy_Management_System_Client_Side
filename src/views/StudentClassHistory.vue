<template>
    <div class="space-y-4">
        <div class="py-2 flex flex-col md:flex-row justify-between items-center mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Students Class History</label>

            <!-- Left: All filters and search in a row, wrap on small screens -->
            <div class="flex flex-wrap gap-4 items-end">
                <div class="flex flex-col">
                    <label for="student-select" class="text-sm font-medium text-gray-700 mb-1"> Select Student <span class="text-red-500">*</span> </label>
                    <Dropdown id="student-select" v-model="selectedStudent" showClear filter :options="studentOptions" optionLabel="eng_name" optionValue="_id" placeholder="Select Student" class="w-full md:w-64" />
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
                    <!-- Teacher Column Added -->
                    <Column field="staff" header="Teacher">
                        <template #body="{ data }">
                            {{ formatStaffName(data.staff) }}
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
                </DataTable>
                <NotFound v-else-if="searched" message="No active classes found for the selected student." />
                <div v-else class="text-center p-8 bg-white rounded-lg shadow-md">
                    <p class="text-gray-500">Please select a student and apply the filter to see their class history.</p>
                </div>
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
import moment from 'moment';
import NotFound from './pages/NotFound.vue';
import { useToast } from 'primevue/usetoast';

// --- Data Fetching ---
const { data: student, fetchData: fetchStudents } = useFetch('students');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
// **NEW:** Fetching staff data
const { data: staffs, fetchData: fetchStaff } = useFetch('staffs');

// --- Component State ---
const selectedStudent = ref(null);
const filteredClasses = ref([]);
const loading = ref(false);
const searched = ref(false); // To track if a filter has been applied
const toast = useToast();

// --- Computed Properties ---
const studentOptions = computed(
    () =>
        student.value?.map((s) => ({
            _id: s._id,
            eng_name: s.eng_name,
            kh_name: s.kh_name
        })) || []
);

// --- Formatting Functions ---
const formatSubject = (id) => {
    const subject = subjects.value?.find((subject) => subject._id === id);
    return subject ? subject.name : 'N/A';
};

const formatDuration = (id) => {
    const section = sections.value?.find((s) => s._id === id);
    return section ? section.duration : 'N/A'; // Assuming section has a 'name' property
};

// **NEW:** Function to format the teacher's name
const formatStaffName = (id) => {
    const staffMember = staffs.value?.find((s) => s._id === id);
    return staffMember ? staffMember.en_name : 'N/A';
};

const formatYear = (date) => {
    return moment(date).format('YYYY');
};

// --- Toast Notification ---
const showToast = (payload) => {
    let action = typeof payload === 'string' ? payload : payload.action;
    let customMessage = typeof payload === 'object' ? payload.message : null;
    let severity;
    let summary;

    switch (action) {
        case 'not_found':
            severity = 'warn';
            summary = customMessage || 'No matching records found';
            break;
        case 'found':
            severity = 'info';
            summary = customMessage || 'Data found successfully';
            break;
        default:
            severity = 'warn';
            summary = customMessage || 'Please select a student to filter';
    }
    toast.add({ severity, summary, life: 3000 });
};

// --- Filter Logic ---
const applyFilter = () => {
    searched.value = true;
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
                    cls.mark_as_completed === false &&
                    cls.students?.some((s) => {
                        const studentId = typeof s.student === 'object' ? s.student._id : s.student;
                        return studentId === selectedStudent.value;
                    })
            ) || [];

        filteredClasses.value = result;
        loading.value = false;

        if (result.length > 0) {
            showToast({ action: 'found', message: `Found ${result.length} class(es)` });
        } else {
            showToast({ action: 'not_found', message: 'No active classes found for the selected student' });
        }
    }, 300);
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await Promise.allSettled([fetchClasses(), fetchStudents(), fetchSections(), fetchSubjects(), fetchStaff()]);
});
</script>
