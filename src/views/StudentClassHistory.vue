<template>
    <div class="space-y-4 main-content">
        <div class="py-2 flex flex-col md:flex-row justify-between items-center mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Class History</label>

            <!-- Filters and search -->
            <div class="flex flex-wrap gap-4 items-end">
                <div class="flex flex-col">
                    <label for="student-select" class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Student <span><span class="text-red-500">*</span></span>
                    </label>
                    <Dropdown id="student-select" v-model="selectedStudent" showClear filter :options="studentOptions" optionLabel="eng_name" optionValue="_id" placeholder="Select Student" class="w-full md:w-64" />
                </div>
                <div>
                    <label class="invisible mb-1 select-none">&nbsp;</label>
                    <Button label="Apply Filter" @click="applyFilter" :loading="loading" />
                </div>
            </div>
        </div>
        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <DataTable :value="filteredClasses" stripedRows showGridlines class="mt-4" v-if="filteredClasses.length > 0">
                    <Column field="name" header="Class Name" />
                    <Column field="subject" header="Subject">
                        <template #body="{ data }">
                            {{ formatSubject(data.subject) }}
                        </template>
                    </Column>
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
                    <Column header="Actions">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <!-- Updated button to call printReport -->
                                <Button icon="pi pi-print" severity="info" @click="printReport(data)" v-tooltip.top="'Print and Save Score Report'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
                <NotFound v-else-if="searched" message="No class history found for the selected student." />
                <div v-else class="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p class="text-gray-500 dark:text-gray-400">Please select a student and apply the filter to see their class history.</p>
                </div>
            </div>
        </div>
        <Toast position="top-right" />
    </div>

    <!-- This section is hidden by default and will only be visible for printing -->
    <div class="printable-area">
        <div v-if="reportDataToPrint" class="p-8 font-sans">
            <h1 class="text-2xl font-bold mb-6 text-center">លទ្ធផលការសិក្សា</h1>

            <!-- Updated Header with Student Image -->
            <div class="flex items-start justify-between mb-8">
                <div class="text-base space-y-1">
                    <p><strong>ឈ្មោះ:</strong> {{ reportDataToPrint.studentInfo.eng_name }}</p>
                    <p><strong>ថ្នាក់:</strong> {{ reportDataToPrint.classData.name }}</p>
                    <p><strong>គ្រូបង្រៀន:</strong> {{ formatStaffName(reportDataToPrint.classData.staff) }}</p>
                    <p><strong>ឆ្នាំ:</strong> {{ formatYear(reportDataToPrint.classData.createdAt) }}</p>
                </div>
                <div>
                    <img :src="reportDataToPrint.studentInfo.image" alt="Student Profile" class="w-28 h-28 object-cover rounded-md border-2 border-gray-300" @error="$event.target.src = 'https://placehold.co/112x112/e2e8f0/718096?text=No+Image'" />
                </div>
            </div>

            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-200 text-gray-700">
                        <th class="p-3 border border-gray-300">តាមរាងពិន្ទុ</th>
                        <th class="p-3 border border-gray-300 text-right">Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="score in reportDataToPrint.scores" :key="score.label" class="border-b">
                        <td class="p-3 border border-gray-300">{{ score.label }}</td>
                        <td class="p-3 border border-gray-300 text-right">{{ score.value }}</td>
                    </tr>
                    <tr class="font-bold bg-gray-100">
                        <td class="p-3 border border-gray-300">Total Score</td>
                        <td class="p-3 border border-gray-300 text-right">{{ reportDataToPrint.total_score }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style>
/* These styles are applied globally but only take effect during printing */
@media print {
    body,
    html {
        visibility: hidden;
    }

    /* Hide the main application content */
    .main-content,
    .p-toast,
    .p-tooltip,
    #app-sidebar,
    #app-header {
        display: none !important;
        visibility: hidden !important;
    }

    /* Ensure the printable area is the only thing visible */
    .printable-area,
    .printable-area * {
        visibility: visible;
    }

    .printable-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: auto;
        padding: 20px; /* Add some padding for print */
        margin: 0;
    }

    /* Ensure the body has no margins or padding in print mode */
    body {
        margin: 0 !important;
        padding: 0 !important;
    }
}
</style>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useFetch } from '@/composible/useFetch';

import moment from 'moment';
import { useToast } from 'primevue/usetoast';
import NotFound from './pages/NotFound.vue';

// --- Data Fetching ---
const { data: student, fetchData: fetchStudents } = useFetch('students');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const { data: staffs, fetchData: fetchStaff } = useFetch('staffs');
// --- Data Submission ---
const { postData } = useFetch('scorereportcompleteds');

// --- Component State ---
const selectedStudent = ref(null);
const filteredClasses = ref([]);
const loading = ref(false);
const searched = ref(false);
const toast = useToast();
// This ref will hold the data for the printable report
const reportDataToPrint = ref(null);

// --- Computed Properties ---
const studentOptions = computed(
    () =>
        student.value?.map((s) => ({
            _id: s._id,
            eng_name: s.eng_name,
            kh_name: s.kh_name,
            image: s.image
        })) || []
);

// --- Formatting Functions ---
const formatSubject = (id) => subjects.value?.find((s) => s._id === id)?.name || 'N/A';
const formatDuration = (id) => sections.value?.find((s) => s._id === id)?.name || 'N/A';
const formatStaffName = (id) => staffs.value?.find((s) => s._id === id)?.en_name || 'N/A';
const formatYear = (date) => moment(date).format('YYYY');

// --- Toast Notification ---
const showToast = (payload) => {
    const action = typeof payload === 'string' ? payload : payload.action;
    const customMessage = typeof payload === 'object' ? payload.message : null;
    const severity = action === 'error' ? 'error' : 'success'; // Changed default to success
    const summary = action === 'error' ? 'Error' : 'Success'; // Changed default to Success
    toast.add({ severity, summary: customMessage || summary, life: 3000 });
};

// --- Filter Logic ---
const applyFilter = () => {
    searched.value = true;
    if (!selectedStudent.value) {
        filteredClasses.value = [];
        showToast({ action: 'error', message: 'Please select a student to filter' });
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
            showToast({ action: 'not_found', message: 'No classes found for the selected student' });
        }
    }, 300);
};

// --- Modified Print and Submit Handler ---
const printReport = async (classData) => {
    if (!selectedStudent.value) {
        showToast({ action: 'error', message: 'Please select a student first.' });
        return;
    }

    const studentInfo = student.value.find((s) => s._id === selectedStudent.value);
    const studentScores = classData.students.find((s) => (s.student?._id || s.student) === selectedStudent.value);

    if (!studentInfo || !studentScores) {
        showToast({ action: 'error', message: 'Could not find score details for this student.' });
        return;
    }

    // 1. Prepare the payload for the 'scorereportcompleteds' collection
    const scoreReportPayload = {
        student_id: studentInfo._id,
        class_id: classData._id,
        subject_id: classData.subject,
        duration: classData.duration,
        attendance_score: studentScores.attendance_score ?? 0,
        class_practice: studentScores.class_practice ?? 0,
        home_work: studentScores.home_work ?? 0,
        assignment_score: studentScores.assignment_score ?? 0,
        presentation: studentScores.presentation ?? 0,
        work_book: studentScores.work_book ?? 0,
        revision_test: studentScores.revision_test ?? 0,
        final_exam: studentScores.final_exam ?? 0,
        total_score: studentScores.total_score ?? 0
    };

    try {
        // 2. Submit the data to the server
        const response = await postData(scoreReportPayload);
        if (response) {
            showToast({ message: 'Score report saved successfully!' });

            // 3. Populate the data for the printable view
            reportDataToPrint.value = {
                studentInfo,
                classData,
                scores: [
                    { label: 'Attendance Score', value: studentScores.attendance_score ?? 0 },
                    { label: 'Class Practice', value: studentScores.class_practice ?? 0 },
                    { label: 'Homework', value: studentScores.home_work ?? 0 },
                    { label: 'Assignment Score', value: studentScores.assignment_score ?? 0 },
                    { label: 'Presentation', value: studentScores.presentation ?? 0 },
                    { label: 'Workbook', value: studentScores.work_book ?? 0 },
                    { label: 'Revision Test', value: studentScores.revision_test ?? 0 },
                    { label: 'Final Exam', value: studentScores.final_exam ?? 0 }
                ],
                total_score: studentScores.total_score ?? 0
            };

            // 4. Wait for Vue to update the DOM
            await nextTick();

            // 5. Preload the image to ensure it's ready for printing
            const imageToLoad = new Image();
            imageToLoad.src = studentInfo.image || 'https://placehold.co/112x112/e2e8f0/718096?text=No+Image';

            // --- ✨ NEW: Function to handle printing and cleanup ---
            const handlePrintAndCleanup = () => {
                // Trigger the browser's native print dialog
                window.print();
                // After printing (or canceling), hide the printable area by resetting the data
                reportDataToPrint.value = null;
            };

            // When the image is loaded, call the print and cleanup function
            imageToLoad.onload = handlePrintAndCleanup;

            // If the image fails to load, still print but with the placeholder/broken image
            imageToLoad.onerror = () => {
                console.error('Image failed to load for printing.');
                handlePrintAndCleanup();
            };
        } else {
            showToast({ action: 'error', message: 'Failed to save the score report.' });
        }
    } catch (error) {
        console.error('Error submitting score report:', error);
        showToast({ action: 'error', message: error.message || 'An unexpected error occurred.' });
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await Promise.allSettled([fetchClasses(), fetchStudents(), fetchSections(), fetchSubjects(), fetchStaff()]);
});
</script>
