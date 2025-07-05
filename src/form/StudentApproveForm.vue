<template>
    <form @submit.prevent="handleSubmit" class="w-[420px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Approve Permissions</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start grid grid-cols-2 gap-4">
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Reason </label>
                <div class="relative">
                    <InputText id="reason" v-model="reason" placeholder="Reason" class="w-full" />
                </div>
            </div>
            <!-- student -->
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Student </label>
                <div class="relative">
                    <Dropdown id="student" :filter="true" v-model="selectStudent" :options="student" option-value="_id" option-label="eng_name" placeholder="Select Student" class="w-full" />
                </div>
            </div>
            <!-- staff -->
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Staff </label>
                <div class="relative">
                    <Dropdown id="staff" :filter="true" v-model="selectStaff" :options="user" option-value="_id" option-label="en_name" placeholder="Select Staff" class="w-full" />
                </div>
            </div>
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Date - End Date </label>
                <div class="relative">
                    <DatePicker v-model="date" placeholder="Start Date - End Date" selectionMode="range" showClear class="w-full" />
                </div>
            </div>
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Status </label>
                <div class="relative">
                    <Dropdown v-model="status" :options="enums" optionLabel="label" optionValue="value" placeholder="Select Status" showClear class="w-full" />
                </div>
            </div>
        </div>
        <div class="w-full flex justify-end gap-3 p-4">
            <Button :label="loading ? 'Loading...' : 'Submit'" type="submit" :disabled="loading" />
            <Button @click="$emit('close')" label="Cancel" severity="danger" />
        </div>
    </form>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';
import moment from 'moment';
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const collection = ref('student_permissions');
        const { postData, data, error, updateData } = useFetch(collection.value);
        const { data: user, fetchData: fetchUser } = useFetch('staffs');
        const { data: student, fetchData: fetchStudent } = useFetch('students');
        const enums = ref([
            { label: 'Pending', value: 'pending' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Rejected', value: 'rejected' }
        ]);
        const selectStudent = ref(null);
        const selectStaff = ref(null);
        const status = ref(null);
        const loading = ref(false);
        const reason = ref(null);
        const date = ref(null);
        const handleSubmit = async () => {
            try {
                loading.value = true;
                const dateArray = date.value?.map((date) => moment(date).format('YYYY-MM-DD'));
                const req = {
                    permissent_status: status.value,
                    reason: reason.value,
                    hold_date: dateArray,
                    sent_to: selectStaff.value,
                    studentId: selectStudent.value
                };
                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('close');
                    emit('toast', 'updated');
                } else {
                    await postData(req);
                    emit('close');
                    emit('toast', 'created');
                }
            } catch (error) {
                console.log(error);
            }
        };

        onMounted(async () => {
            if (props.datatoedit) {
                status.value = props.datatoedit?.permissent_status;
                reason.value = props.datatoedit?.reason;
                date.value = props.datatoedit?.hold_date?.map((date) => moment(date, 'YYYY-MM-DD').toDate());
                selectStudent.value = props.datatoedit?.studentId;
                selectStaff.value = props.datatoedit?.sent_to;
                console.log(date.value);
            }
            await fetchUser();
            await fetchStudent();
            console.log(user.value);
        });

        return {
            handleSubmit,
            enums,
            loading,
            status,
            reason,
            date,
            selectStudent,
            selectStaff,
            student,
            user
        };
    }
};
</script>
