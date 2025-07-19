<template>
    <form @submit.prevent="handleSubmit" class="w-[320px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? $t('element.edit') : $t('element.addnew') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"> {{ $t('session.start_time') }} : <span class="text-red-500">*</span></label>
                <div class="relative">
                    <DatePicker require="true" timeOnly class="w-full" :placeholder="$t('session.enter_time')" :required="true" required id="start-time" v-model="start_time" />
                </div>
            </div>
            <div>
                <label for="end-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('session.end_time') }}: <span class="text-red-500">*</span></label>
                <div class="relative">
                    <DatePicker require="true" timeOnly class="w-full" :placeholder="$t('session.enter_time')" :required="true" v-model="end_time" id="end-time" required />
                </div>
            </div>
        </div>
        <div class="flex justify-end gap-2 p-4 border-t">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" />
            <Button :label="isSubmitting ? $t('element.adding') : $t('element.save')" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import moment from 'moment';
import { useFetch } from '@/composible/useFetch';
import { $t } from '@primeuix/themes';

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
            if (!start_time.value || !end_time.value) return emit('toast', 'error', $t('session.enter_time'));
            try {
                loading.value = true;
                const req = {
                    duration: `${moment(start_time.value).format('HH:mm a')} - ${moment(end_time.value).format('HH:mm a')}`,
                    status: true
                };

                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('close');
                    emit('toast', 'update', 'success');
                } else {
                    await postData(req);
                    emit('close');
                    emit('toast', 'created', 'info');
                }
            } catch (error) {
                console.error('Submission error:', error);
                emit('toast', 'error', error.message);
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
