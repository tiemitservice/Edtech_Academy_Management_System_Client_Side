<template>
    <form class="max-h-[90vh] h-fit overflow-auto">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Student Score' : 'Add New Student Score' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4">
            <DataTable :value="editableStudents" showGridlines responsiveLayout="scroll">
                <Column class="text-nowrap w-[150px]" field="name" header="Khmer Name">
                    <template #body="{ data }">
                        {{ formatStudent(data.student, 'eng_name') }}
                    </template>
                </Column>

                <Column class="text-nowrap w-[150px]" field="attendance_score" header="Attendance">
                    <template #body="{ data }">
                        <InputNumber fluid size="small" v-model="data.attendance_score" :min="0" :max="100" />
                    </template>
                </Column>

                <Column class="text-nowrap w-[150px]" v-for="field in scoreFields" :key="field.key" :header="field.label">
                    <template #body="{ data }">
                        <InputNumber fluid size="small" v-model="data[field.key]" :min="0" @input="calculateTotalScore(data)" />
                    </template>
                </Column>

                <Column class="text-nowrap w-[150px]" header="Total">
                    <template #body="{ data }">
                        {{ data.total_score }}
                    </template>
                </Column>
            </DataTable>
            <div class="py-4 flex items-center justify-end gap-4">
                <Button :label="loading ? 'Updating...' : 'Update Scores'" :disabled="loading" :loading="loading" @click="submitScores" class="float-right" />
                <Button @click="$emit('close')" label="Cancel" severity="danger" />
            </div>
        </div>
    </form>
</template>
<script>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { updateData } = useFetch('classes');
        const { data: students, fetchData: fetchStudents, loading } = useFetch('students');
        const editableStudents = ref(
            props.datatoedit.students.map((s) => ({
                ...s,
                class_practice: s.class_practice || 0,
                home_work: s.home_work || 0,
                assignment_score: s.assignment_score || 0,
                presentation: s.presentation || 0,
                work_book: s.work_book || 0,
                revision_test: s.revision_test || 0,
                final_exam: s.final_exam || 0,
                total_score: s.total_score || 0,
                attendance_score: s.attendance_score || 0
            }))
        );

        const scoreFields = [
            { key: 'class_practice', label: 'Practice' },
            { key: 'home_work', label: 'Homework' },
            { key: 'assignment_score', label: 'Assignment' },
            { key: 'presentation', label: 'Presentation' },
            { key: 'work_book', label: 'Workbook' },
            { key: 'revision_test', label: 'Revision' },
            { key: 'final_exam', label: 'Final Exam' }
        ];

        const formatStudent = (id) => {
            const student = students.value?.find((s) => s._id === id || s._id === id?._id);
            return student?.eng_name || '';
        };

        const calculateTotalScore = (data) => {
            const total = scoreFields.reduce((sum, f) => sum + (Number(data[f.key]) || 0), 0);
            data.total_score = total;
        };

        const submitScores = async () => {
            loading.value = true;
            try {
                const payload = {
                    students: editableStudents.value.map((s) => ({
                        student: s.student._id || s.student,
                        attendance_score: s.attendance_score,
                        class_practice: s.class_practice,
                        home_work: s.home_work,
                        assignment_score: s.assignment_score,
                        presentation: s.presentation,
                        work_book: s.work_book,
                        revision_test: s.revision_test,
                        final_exam: s.final_exam,
                        total_score: s.total_score
                    })),
                    staff: props.datatoedit.staff
                };

                await updateData(payload, props.datatoedit._id);
                emit('close');
                emit('toast', 'update');
            } catch (error) {
                console.error('Update error', error);

                const message = error.response?.data?.details;

                emit('toast', { action: 'server_error', message });
            } finally {
                loading.value = false;
            }
        };
        onMounted(async () => {
            if (props.datatoedit) {
                console.log('====================================');
                console.log(props.datatoedit);
                console.log('====================================');
            }
            await fetchStudents();
        });

        return {
            editableStudents,
            scoreFields,
            formatStudent,
            calculateTotalScore,
            submitScores,
            loading
        };
    }
};
</script>
