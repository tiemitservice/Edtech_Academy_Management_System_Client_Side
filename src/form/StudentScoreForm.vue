<template>
    <form class="max-h-[90vh] h-fit overflow-auto">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50 sticky top-0 z-10">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Student Scores' : 'Add Student Scores' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4">
            <!-- Scores Table -->
            <DataTable :value="editableStudents" striped-rows showGridlines responsiveLayout="scroll">
                <!-- NEW: Sortable 'No.' column -->
                <Column field="displayId" header="No." sortable frozen style="width: 5rem">
                    <template #body="{ data }">
                        {{ data.displayId }}
                    </template>
                </Column>

                <!-- UPDATED: Sortable 'Student Name' column -->
                <Column class="text-nowrap w-[150px]" field="eng_name" header="Student Name" frozen sortable>
                    <template #body="{ data }">
                        {{ data.eng_name }}
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
                <Button :label="loading ? 'Saving...' : 'Save and Report'" :disabled="loading" :loading="loading" @click="submitScores" />
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
const { postData: postScoreReport } = useFetch('scorereports');
const { updateData: updateClassScores, loading } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');

// --- Component State ---
const editableStudents = ref([]); // Start with an empty array

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
const calculateTotalScore = (student) => {
    const total = scoreFields.reduce((sum, field) => sum + (Number(student[field.key]) || 0), 0);
    student.total_score = total + (Number(student.attendance_score) || 0);
};

// --- Form Submission ---
const submitScores = async () => {
    try {
        if (!editableStudents.value || editableStudents.value.length === 0) {
            emit('toast', 'error', 'There are no students in this class to report.');
            return;
        }

        // Create a clean payload by removing the temporary fields used for display/sorting
        const studentsPayload = editableStudents.value.map((s) => {
            const { displayId, eng_name, ...payload } = s;
            return payload;
        });

        // 1. Payload for the historical ScoreReport
        const reportPayload = {
            class_id: props.datatoedit._id,
            duration: props.datatoedit.duration,
            subject: props.datatoedit.subject,
            students: studentsPayload
        };

        // 2. Payload to update the "live" Class document with the latest scores
        const classUpdatePayload = {
            students: studentsPayload // The structure is the same
        };

        // Execute both operations concurrently
        await Promise.all([postScoreReport(reportPayload), updateClassScores(classUpdatePayload, props.datatoedit._id)]);

        emit('toast', 'create', 'Scores saved and report created successfully.');
        emit('close');
    } catch (error) {
        console.error('Error submitting scores:', error);
        const message = error.response?.data?.message || 'Failed to submit scores.';
        emit('toast', 'error', message);
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    // 1. Fetch all student master data needed for names
    await fetchStudents();

    // 2. Process the student list for the data table
    // Create a map for quick lookups
    const studentMap = new Map((students.value || []).map((s) => [s._id, s]));
    // Deep copy the students from the prop to avoid direct mutation
    const classStudents = JSON.parse(JSON.stringify(props.datatoedit.students || []));

    // Map over the class students to create a new array with added properties for the table
    editableStudents.value = classStudents.map((cs, index) => {
        const studentId = cs.student?._id || cs.student;
        const studentInfo = studentMap.get(studentId);
        return {
            ...cs,
            displayId: index + 1, // Add stable ID for sorting the "No." column
            eng_name: studentInfo ? studentInfo.eng_name : 'Unknown', // Add name for display and sorting
            student: studentId // Ensure student field is just the ID
        };
    });

    // 3. Calculate initial total scores for all students
    editableStudents.value.forEach(calculateTotalScore);
});
</script>
