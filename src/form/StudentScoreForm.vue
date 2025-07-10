<template>
    <form class="max-h-[90vh] h-fit overflow-auto">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50 sticky top-0 z-10">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Student Scores' : 'Add Student Scores' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4">
            <!-- Scores Table -->
            <DataTable :value="editableStudents" showGridlines responsiveLayout="scroll">
                <Column class="text-nowrap w-[150px]" field="name" header="Student Name" frozen>
                    <template #body="{ data }">
                        {{ formatStudentName(data.student) }}
                    </template>
                </Column>

                <Column class="text-nowrap w-[150px]" field="attendance_score" header="Attendance">
                    <template #body="{ data }">
                        <InputNumber fluid size="small" v-model="data.attendance_score" :min="0" :max="100" @input="calculateTotalScore(data)" />
                    </template>
                </Column>

                <Column class="text-nowrap w-[150px]" v-for="field in scoreFields" :key="field.key" :header="field.label">
                    <template #body="{ data }">
                        <InputNumber fluid size="small" v-model="data[field.key]" :min="0" @input="calculateTotalScore(data)" />
                    </template>
                </Column>

                <Column class="text-nowrap w-[150px]" header="Total" frozen alignFrozen="right">
                    <template #body="{ data }">
                        <span class="font-bold">{{ data.total_score }}</span>
                    </template>
                </Column>
            </DataTable>

            <!-- Action Buttons -->
            <div class="py-4 flex items-center justify-end gap-4">
                <Button @click="$emit('close')" label="Cancel" severity="secondary" outlined />
                <Button :label="loading ? 'Saving Report...' : 'Save as Report'" :disabled="loading" :loading="loading" @click="submitScores" />
            </div>
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        type: Object,
        required: true
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Data Fetching ---
// This composable will be used to POST to the 'scorereports' collection
const { postData: postScoreReport, loading } = useFetch('scorereports');
// This is needed to format the student names in the table
const { data: students, fetchData: fetchStudents } = useFetch('students');

// --- Component State ---
// Create a deep, editable copy of the students from the prop
const editableStudents = ref(JSON.parse(JSON.stringify(props.datatoedit.students || [])));

// Define the score fields for dynamic column generation
const scoreFields = [
    { key: 'class_practice', label: 'Practice' },
    { key: 'home_work', label: 'Homework' },
    { key: 'assignment_score', label: 'Assignment' },
    { key: 'presentation', label: 'Presentation' },
    { key: 'work_book', label: 'Workbook' },
    { key: 'revision_test', label: 'Revision' },
    { key: 'final_exam', label: 'Final Exam' }
];

// --- Helper Functions ---
const formatStudentName = (studentData) => {
    // The student data can either be a populated object or just an ID string
    const studentId = typeof studentData === 'object' ? studentData?._id : studentData;
    const student = students.value?.find((s) => s._id === studentId);
    return student?.eng_name || 'Loading...';
};

const calculateTotalScore = (student) => {
    // Calculate the total by summing up all score fields for a given student
    const total = scoreFields.reduce((sum, field) => sum + (Number(student[field.key]) || 0), 0);
    // Also include the attendance score in the total
    student.total_score = total + (Number(student.attendance_score) || 0);
};

// --- Form Submission ---
const submitScores = async () => {
    try {
        // **FIX:** The schema requires a single student_id. We will provide the ID
        // of the first student in the class list to satisfy this requirement.
        if (!editableStudents.value || editableStudents.value.length === 0) {
            emit('toast', 'error', 'There are no students in this class to report.');
            return;
        }
        const firstStudentId = editableStudents.value[0].student?._id || editableStudents.value[0].student;

        const payload = {
            student_id: firstStudentId, // Satisfy the required top-level student_id
            class_id: props.datatoedit._id,
            duration: props.datatoedit.duration,
            subject: props.datatoedit.subject,
            students: editableStudents.value.map((s) => ({
                student: s.student._id || s.student,
                attendance_score: s.attendance_score || 0,
                class_practice: s.class_practice || 0,
                home_work: s.home_work || 0,
                assignment_score: s.assignment_score || 0,
                presentation: s.presentation || 0,
                work_book: s.work_book || 0,
                revision_test: s.revision_test || 0,
                final_exam: s.final_exam || 0,
                total_score: s.total_score || 0
            }))
        };

        // Post the new score report to the database
        await postScoreReport(payload);

        emit('toast', 'create', 'Score report created successfully.');
        emit('save'); // Notify parent component to refresh its data
        emit('close');
    } catch (error) {
        console.error('Error creating score report:', error);
        const message = error.response?.data?.message || 'Failed to create report.';
        emit('toast', 'error', message);
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    // Fetch the full student list to ensure names can be displayed correctly
    await fetchStudents();
    // Initialize total scores for all students when the component loads
    editableStudents.value.forEach(calculateTotalScore);
});
</script>
