<template>
    <form @submit.prevent="handleSubmit" class="w-[420px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Staff Attendance</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start grid grid-cols-2 gap-4">
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name <span class="text-red-500"></span></label>
                <InputText :required="true" v-model="name" placeholder="Name" disabled class="w-full" />
            </div>
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Entry Time <span class="text-red-500">*</span></label>
                <DatePicker timeOnly :required="true" v-model="Entry_time" placeholder="Entry Time" class="w-full" />
                <!-- <Message severity="error" variant="simple" v-if="isValidateEntryTime"> {{ isValidateEntryTime }} </Message> -->
            </div>
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Exit Time <span class="text-red-500">*</span></label>
                <DatePicker timeOnly :required="true" v-model="Exit_time" placeholder="Exit Time" class="w-full" />
                <!-- <Message severity="error" variant="simple" v-if="isValidateExiteTime"> {{ isValidateEntryTime }} </Message> -->
            </div>
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Note <span class="text-red-500"></span></label>
                <InputText v-model="note" placeholder="Note" class="w-full" />
            </div>
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mark Status <span class="text-red-500"></span></label>
                <Select :options="Attendance_Enum" :required="true" v-model="selectAttendance" option-label="name" option-value="value" placeholder="Select Attendance" class="w-full" />
            </div>
        </div>
        <div class="w-full flex justify-end gap-3 p-4">
            <Button :label="loading ? 'Loading...' : 'Submit'" type="submit" :disabled="loading" />
            <Button @click="$emit('close')" label="Cancel" severity="danger" />
        </div>
    </form>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';
import useAuth from '@/composible/useAuth';
import { DatePicker } from 'primevue';
import moment from 'moment';
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { user } = useAuth();
        const { loading, updateData } = useFetch('staffs');
        const { postData: postAttendance } = useFetch('staffattendances');
        const selectAttendance = ref(null);
        const Entry_time = ref(null);
        const Exit_time = ref(null);
        const note = ref(null);
        const isValidateExiteTime = ref(false);
        const isValidateEntryTime = ref(false);
        const isValidateAttendance = ref(false);

        const validateAttendance = () => {
            if (!selectAttendance.value) {
                isValidateAttendance.value = 'Attendance is required.';
                return false;
            }
            isValidateAttendance.value = '';
            return true;
        };

        const validateEntryTime = () => {
            if (!Entry_time.value) {
                isValidateEntryTime.value = 'Entry time is required.';
                return false;
            }
            isValidateEntryTime.value = '';
            return true;
        };

        const validateExiteTime = () => {
            if (!Exit_time.value) {
                isValidateExiteTime.value = 'Exit time is required.';
                return false;
            }
            isValidateExiteTime.value = '';
            return true;
        };

        watch(Entry_time, () => {
            validateExiteTime();
        });
        watch(Exit_time, () => {
            validateEntryTime();
        });

        watch(selectAttendance, () => {
            validateAttendance();
        });

        const Attendance_Enum = ref([
            { name: 'Present', value: 'present' },
            { name: 'Absent', value: 'absent' },
            { name: 'Late', value: 'late' },
            { name: 'Permission', value: 'permission' }
        ]);
        const name = ref(null);
        const handleSubmit = async () => {
            if (!validateEntryTime()) {
                emit('toast', { action: 'check_fields', message: 'Entry time is required.' });

                return;
            }
            if (!validateExiteTime()) {
                emit('toast', { action: 'check_fields', message: 'Exit time is required.' });

                return;
            }
            if (!validateAttendance()) {
                emit('toast', { action: 'check_fields', message: 'Attendance is missing.' });

                return;
            }
            try {
                loading.value = true;

                const req = {
                    attendance: selectAttendance.value,
                    department: props.datatoedit.department,
                    position: props.datatoedit.position,
                    entry_time: moment(Entry_time.value).format('HH:mm a'),
                    exit_time: moment(Exit_time.value).format('HH:mm a'),
                    note: note.value
                };

                if (props.datatoedit) {
                    const updated = await updateData(req, props.datatoedit._id);
                    emit('close');
                    emit('toast', 'updated');

                    // ✅ Only proceed if update succeeded
                    if (updated && updated._id) {
                        const req_attendance = {
                            staff: props.datatoedit._id,
                            set_by: user.value.id,
                            status: selectAttendance.value,
                            entry_time: moment(Entry_time.value).format('HH:mm a'),
                            exit_time: moment(Exit_time.value).format('HH:mm a'),
                            note: note.value
                        };
                        await postAttendance(req_attendance);
                    }
                }
            } catch (error) {
                console.log(error);
                // emit('toast', 'check_fields');
            }
        };

        onMounted(() => {
            if (props.datatoedit) {
                selectAttendance.value = props.datatoedit?.attendance;
                name.value = props.datatoedit?.en_name;
                Entry_time.value = props.datatoedit?.entry_time;
                Exit_time.value = props.datatoedit?.exit_time;
                note.value = props.datatoedit?.note;
            }
        });
        return {
            name,
            handleSubmit,
            loading,
            selectAttendance,
            Attendance_Enum,
            user,
            Entry_time,
            Exit_time,
            note,
            isValidateExiteTime,
            isValidateEntryTime
        };
    }
};
</script>

<style lang="scss" scoped></style>
