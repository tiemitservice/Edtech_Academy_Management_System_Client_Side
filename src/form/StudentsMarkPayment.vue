<template>
    <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
        <div class="grid grid-cols-1 gap-4">
            <div class="flex flex-col space-y-1 w-full">
                <label for="payment_date"> Payment Date </label>
                <DatePicker id="" v-model="datatoedit.paid_date" dateFormat="dd/mm/yy" optionValue="_id" class="w-full" />
            </div>

            <div class="flex flex-col space-y-1 w-full">
                <label for="next_dou_date"> Next DOU Date </label>
                <DatePicker id="" v-model="datatoedit.next_due_date" dateFormat="dd/mm/yy" optionValue="_id" class="w-full" />
            </div>
        </div>
        <div class="w-full flex items-center justify-end mt-8">
            <Button label="Save" type="submit" class="mr-2" />
            <Button @click="$emit('close')" label="Cancel" severity="danger" />
        </div>
    </form>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { DatePicker } from 'primevue';
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const collection = ref('student_payments');
        const { data: payment, fetchData: fetchPayment, updateData: updatePayment } = useFetch(collection.value);

        const handleSubmit = async () => {
            try {
                const req = {
                    paid_date: props.datatoedit.paid_date,
                    next_due_date: props.datatoedit.next_due_date
                };

                if (props.datatoedit._id) {
                    await updatePayment(req, props.datatoedit?._id);
                }
                emit('close');
            } catch (error) {
                console.error('Error saving payment:', error);
            }
        };
        onMounted(() => {
            if (props.datatoedit) {
                console.log('Editing data:', props.datatoedit);
            } else {
                console.log('Creating new payment');
            }
        });

        return {
            handleSubmit
        };
    }
};
</script>

<style lang="scss" scoped></style>
