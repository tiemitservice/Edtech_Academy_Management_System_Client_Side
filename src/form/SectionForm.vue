<template>
    <form @submit.prevent="handleSubmit" class="w-[320px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Section' : 'Add New Section' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start time: <span class="text-red-500">*</span></label>
                <div class="relative">
                    <DatePicker timeOnly class="w-full" placeholder="Start  Time" :required="true" required id="start-time" v-model="start_time" />
                </div>
            </div>
            <div>
                <label for="end-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">End time: <span class="text-red-500">*</span></label>
                <div class="relative">
                    <DatePicker timeOnly class="w-full" placeholder="End Time" :required="true" v-model="end_time" id="end-time" required />
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
import { ref, onMounted, watch } from 'vue';
import moment from 'moment';
import { useFetch } from '@/composible/useFetch';

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const collection = ref('sections');
        const { postData, updateData } = useFetch(collection.value);
        const start_time = ref(null);
        const end_time = ref(null);
        const loading = ref(false);

        // Format to h:mm A (e.g., 1:30 PM)

        const handleSubmit = async () => {
            try {
                loading.value = true;
                const req = {
                    duration: `${moment(start_time.value).format('HH:mm a')} - ${moment(end_time.value).format('HH:mm a')}`,
                    status: true
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
                console.error('Submission error:', error);
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            if (props.datatoedit?.duration) {
                const [start, end] = props.datatoedit.duration.split(' - ');
                start_time.value = start;
                end_time.value = end;
            }
        });

        return {
            handleSubmit,
            start_time,
            end_time,
            loading
        };
    }
};
</script>
