<template>
    <form class="max-h-[90vh] h-fit overflow-auto">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800"> Check Attendance </label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4">
            <DataTable :value="editableStudents" showGridlines responsiveLayout="scroll">
                <Column field="name" header="No" class="text-nowrap text-center">
                    <template #body="{ index }">
                        {{ index + 1 }}
                    </template>
                </Column>

                <Column field="name" header="Khmer Name" class="text-nowrap">
                    <template #body="{ data }">
                        {{ formatStudent(data.student, 'eng_name') }}
                    </template>
                </Column>

                <Column header="Attendance">
                    <template #body="{ data }">
                        <Dropdown v-model="data.attendance" :options="attendanceOptions" optionLabel="label" optionValue="value" placeholder="Select" class="w-[150px]" />
                    </template>
                </Column>

                <Column header="Checked At">
                    <template #body="{ data }">
                        <InputText v-model="data.checking_at" class="w-[180px]" placeholder="YYYY-MM-DD HH:mm" />
                    </template>
                </Column>
                <Column header="Note">
                    <template #body="{ data }">
                        <Textarea v-model="data.note" rows="1" class="w-[250px]" autoResize placeholder="Optional note..." />
                    </template>
                </Column>
            </DataTable>

            <div class="py-4 flex items-center justify-end gap-4">
                <Button :label="loading ? 'Updating...' : 'Submit Attendance'" :disabled="loading" :loading="loading" @click="submitAttendance" />
                <Button @click="$emit('close')" label="Cancel" severity="danger" />
            </div>
        </div>
    </form>
</template>

<script>
import { ref, onMounted } from 'vue';
import moment from 'moment';
import { useFetch } from '@/composible/useFetch';

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { updateData } = useFetch('classes');
        const { data: students, fetchData: fetchStudents, loading } = useFetch('students');

        const attendanceOptions = [
            { label: 'Present', value: 'present' },
            { label: 'Absent', value: 'absent' },
            { label: 'Late', value: 'late' },
            { label: 'Permission', value: 'permission' }
        ];

        const editableStudents = ref(
            props.datatoedit.students.map((s) => ({
                ...s,
                attendance: s.attendance || '',
                checking_at: moment().format('YYYY-MM-DD HH:mm'),
                note: s.note || ''
            }))
        );

        const formatStudent = (id) => {
            const student = students.value?.find((s) => s._id === id || s._id === id?._id);
            return student?.eng_name || '';
        };

        const submitAttendance = async () => {
            loading.value = true;
            try {
                const payload = {
                    students: editableStudents.value.map((s) => ({
                        student: s.student._id || s.student,
                        attendance: s.attendance,
                        checking_at: s.checking_at,
                        note: s.note
                    })),
                    staff: props.datatoedit.staff
                };

                await updateData(payload, props.datatoedit._id);
                emit('close');
                emit('toast', 'Attendance submitted');
            } catch (error) {
                const message = error.response?.data?.details || 'Error submitting attendance';
                emit('toast', { action: 'server_error', message });
                console.error('Attendance update error:', error);
            } finally {
                loading.value = false;
            }
        };

        onMounted(async () => {
            await fetchStudents();
        });

        return {
            editableStudents,
            formatStudent,
            attendanceOptions,
            submitAttendance,
            loading
        };
    }
};
</script>
