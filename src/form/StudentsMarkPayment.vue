<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden text-start">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Payment' : 'Add New Payment' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-5">
            <div class="grid grid-cols-1 gap-4">
                <div class="flex flex-col space-y-1 w-full">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="payment_date">Name </label>
                    <Select v-model="selectStudent" :disabled="datatoedit" :options="students" :filter="true" option-value="_id" option-label="eng_name" show-clear placeholder="Select a student" class="min-w-[180px]" />
                </div>
                <div class="flex flex-col space-y-1 w-full">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="payment_date"> Payment Date </label>
                    <DatePicker id="payment_date" dateFormat="dd/mm/yy" class="w-full" v-model="payment_date" />
                </div>
                <div class="flex flex-col space-y-1 w-full">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="payment_type"> Payment Type </label>
                    <Select v-model="paymentType" :options="paymentTypes" option-value="value" option-label="name" show-clear placeholder="Select a payment type" class="min-w-[180px]" />
                </div>
                <div v-if="next_payment_date" class="flex flex-col space-y-1 w-full">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="next_payment_date"> Next Payment Date </label>
                    <input type="text" :value="formattedNextPaymentDate" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed" disabled />
                </div>
            </div>
            <div class="w-full flex items-center justify-end mt-8">
                <Button label="Save" type="submit" class="mr-2" />
                <Button @click="$emit('close')" label="Cancel" severity="danger" />
            </div>
        </div>
    </form>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import { useFetch } from '@/composible/useFetch';
import moment from 'moment';

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const collection = ref('students');
        const { data: students, fetchData: fetchStudents, updateData: updatePayment, addData: addPayment } = useFetch(collection.value);
        const paymentTypes = ref([
            { name: 'Quarter', value: 'Quarter' },
            { name: 'Monthly', value: 'Monthly' }
        ]);

        const payment_date = ref(null);
        const next_payment_date = ref(null);
        const selectStudent = ref(null);
        const paymentType = ref(null);

        // Watch for changes in paymentType and payment_date to calculate the next payment date
        watch([paymentType, payment_date], ([newType, newDate]) => {
            if (newType && newDate) {
                const date = moment(newDate, 'DD/MM/YYYY');
                if (newType === 'Monthly') {
                    next_payment_date.value = date.add(1, 'months').toDate();
                } else if (newType === 'Quarter') {
                    next_payment_date.value = date.add(3, 'months').toDate();
                } else {
                    next_payment_date.value = null;
                }
            } else {
                next_payment_date.value = null;
            }
        });

        const formattedNextPaymentDate = computed(() => {
            return next_payment_date.value ? moment(next_payment_date.value).format('DD/MM/YYYY') : '';
        });

        const handleSubmit = async () => {
            try {
                const paymentDate = moment(payment_date.value, 'DD/MM/YYYY').format('YYYY-MM-DD');
                const nextPaymentDate = next_payment_date.value ? moment(next_payment_date.value).format('YYYY-MM-DD') : null;

                const req = {
                    payment_date: paymentDate,
                    payment_type: paymentType.value,
                    next_payment_date: nextPaymentDate
                };

                if (props.datatoedit && props.datatoedit._id) {
                    await updatePayment(req, props.datatoedit._id);
                } else {
                    await addPayment(req);
                }
                emit('close');
            } catch (error) {
                console.error('Error saving payment:', error);
            }
        };

        onMounted(async () => {
            await fetchStudents();
            if (props.datatoedit) {
                selectStudent.value = props.datatoedit?._id;
                payment_date.value = moment(props.datatoedit?.payment_date).format('DD/MM/YYYY');
                paymentType.value = props.datatoedit?.payment_type;
            }
            console.log('====================================');
            console.log('students', props.datatoedit);
            console.log('====================================');
        });

        return {
            handleSubmit,
            payment_date,
            next_payment_date,
            formattedNextPaymentDate,
            selectStudent,
            paymentType,
            students,
            paymentTypes
        };
    }
};
</script>
