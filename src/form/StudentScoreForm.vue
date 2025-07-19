<template>
    <form class="max-h-[90vh] h-fit overflow-auto">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? $t('element.edit') : $t('element.addnew') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded :aria-label="$t('actions.close')" />
        </div>

        <div class="p-4">
            <!-- Scores Table -->
            <DataTable :value="editableStudents" striped-rows showGridlines responsiveLayout="scroll">
                <!-- NEW: Sortable 'No.' column -->
                <Column field="displayId" :header="$t('element.num')" sortable frozen style="width: 5rem">
                    <template #body="{ data }">
                        {{ data.displayId }}
                    </template>
                </Column>

                <!-- UPDATED: Sortable 'Student Name' column -->
                <Column class="text-nowrap w-[150px]" field="eng_name" :header="$t('student.name')" frozen sortable>
                    <template #body="{ data }">
                        {{ data.eng_name }}
                    </template>
                </Column>

                <Column class="text-nowrap w-[150px]" field="attendance_score" :header="$t('student_score.attendance_score')">
                    <template #body="{ data }">
                        <InputNumber fluid size="small" v-model="data.attendance_score" :min="0" :max="100" @input="calculateTotalScore(data)" />
                    </template>
                </Column>

                <Column class="text-nowrap w-[150px]" v-for="field in scoreFields" :key="field.key" :header="field.label">
                    <template #body="{ data }">
                        <InputNumber fluid size="small" v-model="data[field.key]" :min="0" @input="calculateTotalScore(data)" />
                    </template>
                </Column>

                <Column class="text-nowrap w-[150px]" :header="$t('student_score.total_score')" frozen alignFrozen="right">
                    <template #body="{ data }">
                        <span class="font-bold">{{ data.total_score }}</span>
                    </template>
                </Column>
            </DataTable>

            <!-- Action Buttons -->
        </div>
        <div class="py-4 flex items-center border-t justify-end gap-4 p-4">
            <Button @click="$emit('close')" :label="$t('element.cancel')" severity="secondary" outlined />
            <Button :label="loading ? $t('element.saving') : $t('element.save')" :disabled="loading" :loading="loading" @click="submitScores" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
const editableStudents = ref([]);

const scoreFields = [
    { key: 'class_practice', label: t('student_score.practice') },
    { key: 'home_work', label: t('student_score.home_work') },
    { key: 'assignment_score', label: t('student_score.assigment_score') },
    { key: 'presentation', label: t('student_score.prentation') },
    { key: 'work_book', label: t('student_score.work_book') },
    { key: 'revision_test', label: t('student_score.revision') },
    { key: 'final_exam', label: t('student_score.final_exam') }
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

        // **FIX:** Create a SINGLE payload object that matches the new ScoreReport schema.
        const reportPayload = {
            // Top-level fields required by the schema
            class_id: props.datatoedit._id,
            subject: props.datatoedit.subject?._id || props.datatoedit.subject,
            duration: props.datatoedit.duration?._id || props.datatoedit.duration,
            // The schema has a top-level `student_id`. We'll populate it with the first student's ID to pass validation.
            student_id: editableStudents.value.length > 0 ? editableStudents.value[0].student : null,

            // The nested array of student scores
            students: editableStudents.value.map((s) => {
                // This inner object matches the nested part of the schema
                return {
                    student: s.student, // The schema uses 'student' for the ID here
                    attendance_score: s.attendance_score,
                    class_practice: s.class_practice,
                    home_work: s.home_work,
                    assignment_score: s.assignment_score,
                    presentation: s.presentation,
                    work_book: s.work_book,
                    revision_test: s.revision_test,
                    final_exam: s.final_exam,
                    total_score: s.total_score
                };
            })
        };

        // Validate that the required top-level IDs are present before sending
        if (!reportPayload.class_id || !reportPayload.subject || !reportPayload.duration || !reportPayload.student_id) {
            const missing = [!reportPayload.class_id && 'class', !reportPayload.subject && 'subject', !reportPayload.duration && 'duration', !reportPayload.student_id && 'student'].filter(Boolean).join(', ');
            const errorMessage = `Cannot submit. Missing required data: ${missing}.`;
            console.error(errorMessage, 'Payload:', reportPayload);
            emit('toast', 'error', errorMessage);
            return;
        }

        console.log('Final payload being sent to scorereports:', reportPayload);

        // Create the payload to update the "live" Class document. This remains the same.
        const classUpdatePayload = {
            students: editableStudents.value.map((s) => {
                const { displayId, eng_name, ...payload } = s;
                return payload;
            })
        };

        // Execute both operations concurrently.
        // postScoreReport now sends a SINGLE object.
        await Promise.all([postScoreReport(reportPayload), updateClassScores(classUpdatePayload, props.datatoedit._id)]);

        emit('toast', 'update', 'success');
        emit('close');
    } catch (error) {
        console.error('Error submitting scores:', error);
        const message = error.response?.data?.details || error.message || 'Failed to submit scores.';
        emit('toast', 'error', message);
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    // 1. Fetch all student master data needed for names
    await fetchStudents();

    // 2. Process the student list for the data table
    const studentMap = new Map((students.value || []).map((s) => [s._id, s]));
    const classStudents = JSON.parse(JSON.stringify(props.datatoedit.students || []));

    editableStudents.value = classStudents.map((cs, index) => {
        const studentId = cs.student?._id || cs.student;
        const studentInfo = studentMap.get(studentId);
        return {
            ...cs,
            displayId: index + 1,
            eng_name: studentInfo ? studentInfo.eng_name : 'Unknown',
            student: studentId // Ensure student field is just the ID for processing
        };
    });

    // 3. Calculate initial total scores for all students
    editableStudents.value.forEach(calculateTotalScore);
});
</script>
