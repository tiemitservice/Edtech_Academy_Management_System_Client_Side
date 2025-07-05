<template>
    <form @submit.prevent="handleSubmit" class="w-[320px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Approve Permissions</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="staff" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Staff </label>
                <div class="relative">
                    <Dropdown id="staff" :filter="true" v-model="selectStaff" :options="User" option-value="_id" option-label="name" placeholder="Select Staff" class="w-full" />
                </div>
            </div>
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Reason </label>
                <div class="relative">
                    <InputText id="reason" v-model="reason" placeholder="Reason" class="w-full" />
                </div>
            </div>
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Date - End Date </label>
                <div class="relative">
                    <DatePicker v-model="start_date_end_date" placeholder="Start Date - End Date" selectionMode="range" showClear class="w-full" />
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
import { DatePicker } from 'primevue';
import moment from 'moment';

// import moment from 'moment';
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const collection = ref('staffpermissions');
        const { postData, data, error, updateData } = useFetch(collection.value);
        const { data: User, fetchData: fetchUser } = useFetch('users');
        const enums = ref([
            { label: 'Pending', value: 'pending' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Rejected', value: 'rejected' }
        ]);

        const status = ref(null);
        const start_date_end_date = ref(null);
        const reason = ref(null);
        const loading = ref(false);
        const selectStaff = ref(null);
        const handleSubmit = async () => {
            try {
                loading.value = true;
                const formattedDates = start_date_end_date.value?.map((date) => moment(date).format('YYYY-MM-DD'));

                const req = {
                    staff: selectStaff.value,
                    status: status.value,
                    reason: reason.value,
                    hold_date: formattedDates
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
                status.value = props.datatoedit?.status;
                start_date_end_date.value = props.datatoedit?.hold_date?.map((date) => moment(date, 'YYYY-MM-DD').toDate());
                reason.value = props.datatoedit?.reason;
            }
            await fetchUser();
        });

        return {
            handleSubmit,
            enums,
            loading,
            status,
            start_date_end_date,
            reason,
            User,
            selectStaff
        };
    }
};
</script>
