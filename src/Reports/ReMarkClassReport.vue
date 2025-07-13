<template>
    <div class="space-y-4 main-content">
        <div class="py-2 flex flex-col md:flex-row justify-between items-center mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Class History</label>

            <!-- Filters and search -->
            <div class="flex flex-wrap gap-4 items-end">
                <div class="flex flex-col">
                    <label for="student-select" class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Student <span><span class="text-red-500">*</span></span>
                    </label>
                    <Dropdown id="student-select" v-model="selectedStudent" showClear filter :options="studentOptions" optionLabel="eng_name" optionValue="_id" placeholder="Select Student" class="w-full md:w-64" />
                </div>
                <div class="flex gap-2 items-end">
                    <Button label="Apply Filter" @click="applyFilter" :loading="loading" />
                    <!-- <Button label="Fetch Report" @click="fetchScoreReport" :loading="reportFetching" severity="secondary" /> -->
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
                                <Button icon="pi pi-print" @click="printReport(data)" v-tooltip.top="'Print Score Report'" />
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

        <!-- Display Fetched Score Report -->
        <div v-if="fetchedReport" class="mt-8">
            <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Saved Score Report</h3>
            <DataTable :value="[fetchedReport]" showGridlines>
                <Column field="student_id" header="Student">
                    <template #body="{ data }">
                        {{ student.find((s) => s._id === data.student_id)?.eng_name || 'N/A' }}
                    </template>
                </Column>
                <Column field="class_id" header="Class">
                    <template #body="{ data }">
                        {{ classes.find((c) => c._id === data.class_id)?.name || 'N/A' }}
                    </template>
                </Column>
                <Column field="total_score" header="Total Score"></Column>
                <Column field="createdAt" header="Date Saved">
                    <template #body="{ data }">
                        {{ moment(data.createdAt).format('YYYY-MM-DD HH:mm') }}
                    </template>
                </Column>
            </DataTable>
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
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import moment from 'moment';
import { useToast } from 'primevue/usetoast';
import NotFound from '@/views/pages/NotFound.vue';

// --- Data Fetching ---
const { data: student, fetchData: fetchStudents } = useFetch('students');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const { data: staffs, fetchData: fetchStaff } = useFetch('staffs');
const { data: scoreReports, fetchData: fetchScoreReports, loading: reportFetching } = useFetch('scorereportcompleteds');

// --- Component State ---
const selectedStudent = ref(null);
const filteredClasses = ref([]);
const loading = ref(false);
const searched = ref(false);
const toast = useToast();
const reportDataToPrint = ref(null);
const fetchedReport = ref(null); // To store the fetched report

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
const formatDuration = (id) => sections.value?.find((s) => s._id === id)?.duration || 'N/A';
const formatStaffName = (id) => staffs.value?.find((s) => s._id === id)?.en_name || 'N/A';
const formatYear = (date) => moment(date).format('YYYY');

// --- Toast Notification ---
const showToast = (payload) => {
    const action = typeof payload === 'string' ? payload : payload.action;
    const customMessage = typeof payload === 'object' ? payload.message : null;
    const severity = action === 'error' ? 'error' : 'success';
    const summary = action === 'error' ? 'Error' : 'Success';
    toast.add({ severity, summary: customMessage || summary, life: 3000 });
};

// --- Filter Logic ---
const applyFilter = () => {
    searched.value = true;
    fetchedReport.value = null; // Clear previous report
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

// --- Fetch Score Report Logic ---
const fetchScoreReport = async () => {
    if (!selectedStudent.value) {
        showToast({ action: 'error', message: 'Please select a student first.' });
        return;
    }
    await fetchScoreReports(); // Fetch all reports
    const report = scoreReports.value?.find((r) => r.student_id === selectedStudent.value);

    if (report) {
        // Recalculate total score on the client side to ensure it's always correct
        report.total_score =
            (report.attendance_score ?? 0) + (report.class_practice ?? 0) + (report.home_work ?? 0) + (report.assignment_score ?? 0) + (report.presentation ?? 0) + (report.work_book ?? 0) + (report.revision_test ?? 0) + (report.final_exam ?? 0);

        fetchedReport.value = report;
        showToast({ message: 'Report found!' });
    } else {
        fetchedReport.value = null;
        showToast({ action: 'error', message: 'No saved report found for this student.' });
    }
};

// --- Image Preloader ---
const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

// --- Print Handler (No Submission) ---
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

    // Calculate the total score by summing up all individual scores
    const calculatedTotalScore =
        (studentScores.attendance_score ?? 0) +
        (studentScores.class_practice ?? 0) +
        (studentScores.home_work ?? 0) +
        (studentScores.assignment_score ?? 0) +
        (studentScores.presentation ?? 0) +
        (studentScores.work_book ?? 0) +
        (studentScores.revision_test ?? 0) +
        (studentScores.final_exam ?? 0);

    // Populate the data structure for the printable view
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
        total_score: calculatedTotalScore
    };

    try {
        // Wait for Vue to update the DOM with the report data
        await nextTick();

        // Preload the student's image
        if (studentInfo.image) {
            await preloadImage(studentInfo.image);
        }

        // This function will be called after the print dialog is closed
        const handleAfterPrint = () => {
            reportDataToPrint.value = null; // Hide the printable area
            window.removeEventListener('afterprint', handleAfterPrint); // Clean up the event listener
        };

        window.addEventListener('afterprint', handleAfterPrint);

        // Add a small delay to ensure rendering is complete
        setTimeout(() => {
            // Trigger the browser's native print dialog
            window.print();
        }, 100); // 100ms delay
    } catch (error) {
        console.error('Could not preload image for printing:', error);
        showToast({ action: 'error', message: 'Could not load image for printing.' });
        reportDataToPrint.value = null; // Also hide on error
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await Promise.allSettled([fetchClasses(), fetchStudents(), fetchSections(), fetchSubjects(), fetchStaff()]);
});
</script>
