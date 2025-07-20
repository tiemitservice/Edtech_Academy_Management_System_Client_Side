<template>
    <form @submit.prevent="handleSubmit" class="w-[320px] bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">
                {{ datatoedit ? $t('element.edit') : $t('element.addnew') }}
            </label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded text aria-label="Close" />
        </div>

        <!-- Form Body -->
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900"> {{ $t('session.start_time') }} : <span class="text-red-500">*</span> </label>
                <div class="relative">
                    <DatePicker timeOnly class="w-full" :placeholder="$t('session.enter_time')" id="start-time" v-model="start_time" :class="{ 'p-invalid': startTimeError }" />
                    <!-- Real-time error message -->
                    <p v-if="startTimeError" class="mt-1 text-xs text-red-500">{{ startTimeError }}</p>
                </div>
            </div>
            <div>
                <label for="end-time" class="block mb-2 text-sm font-medium text-gray-900"> {{ $t('session.end_time') }}: <span class="text-red-500">*</span> </label>
                <div class="relative">
                    <DatePicker timeOnly class="w-full" :placeholder="$t('session.enter_time')" id="end-time" v-model="end_time" :class="{ 'p-invalid': endTimeError }" />
                    <!-- Real-time error message -->
                    <p v-if="endTimeError" class="mt-1 text-xs text-red-500">{{ endTimeError }}</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 p-4 border-t bg-gray-50">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" outlined />
            <Button :label="isSubmitting ? $t('element.adding') : $t('element.save')" type="submit" :loading="isSubmitting" :disabled="isSubmitting || !!startTimeError || !!endTimeError" />
        </div>
    </form>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import moment from 'moment';
// Assuming useFetch and $t are correctly imported from your project structure
import { useFetch } from '@/composible/useFetch';
// import { $t } from '@primeuix/themes';

// Mocking for standalone functionality
// const useFetch = (collection) => ({
//     postData: async (data) => console.log(`Posting to ${collection}:`, data),
//     updateData: async (data, id) => console.log(`Updating ${collection} with ID ${id}:`, data)
// });
const $t = (key) => key.split('.').pop().replace('_', ' ');

export default {
    props: ['datatoedit'],
    emits: ['close', 'toast'],
    setup(props, { emit }) {
        const collection = ref('sections');
        const { postData, updateData } = useFetch(collection.value);

        const start_time = ref(null);
        const end_time = ref(null);
        const isSubmitting = ref(false);

        const startTimeError = ref('');
        const endTimeError = ref('');

        /**
         * Validates the form fields and sets error messages.
         * @returns {boolean} - True if the form is valid, false otherwise.
         */
        const validate = () => {
            // Clear previous errors
            startTimeError.value = '';
            endTimeError.value = '';
            let isValid = true;

            if (!start_time.value) {
                startTimeError.value = $t('session.enter_time');
                isValid = false;
            }
            if (!end_time.value) {
                endTimeError.value = $t('session.enter_time');
                isValid = false;
            }

            // Only check the time range if both fields are filled
            if (isValid && !moment(end_time.value).isAfter(start_time.value)) {
                endTimeError.value = 'End time must be after start time.';
                isValid = false;
            }

            return isValid;
        };

        // Watch for changes on time inputs to provide real-time feedback
        watch([start_time, end_time], () => {
            validate();
        });

        const handleSubmit = async () => {
            // Run final validation on submit. If invalid, just stop.
            if (!validate()) {
                return; // The toast notification is removed from here.
            }

            isSubmitting.value = true;
            try {
                const req = {
                    duration: `${moment(start_time.value).format('h:mm a')} - ${moment(end_time.value).format('h:mm a')}`,
                    status: true
                };

                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('toast', 'update', 'success');
                } else {
                    await postData(req);
                    emit('toast', 'created', 'info');
                }
                emit('close');
            } catch (error) {
                console.error('Submission error:', error);
                emit('toast', 'error', 'Submission failed!');
            } finally {
                isSubmitting.value = false;
            }
        };

        // Initialize form state when editing existing data
        onMounted(() => {
            if (props.datatoedit?.duration) {
                const [startString, endString] = props.datatoedit.duration.split(' - ');
                if (startString) {
                    start_time.value = moment(startString, 'h:mm a').toDate();
                }
                if (endString) {
                    end_time.value = moment(endString, 'h:mm a').toDate();
                }
            }
        });

        return {
            handleSubmit,
            start_time,
            end_time,
            isSubmitting,
            startTimeError,
            endTimeError
        };
    }
};
</script>

<style>
/* Basic styling for PrimeVue invalid state */
.p-invalid {
    border-color: #e24c4c !important;
}
</style>
