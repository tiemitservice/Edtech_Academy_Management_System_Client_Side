<template>
    <form @submit.prevent="handleSubmit" class="w-[320px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? $t('element.edit') : $t('element.addnew') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"> {{ $t('subject.name') }} <span class="text-red-500">*</span></label>
                <div class="relative">
                    <InputText class="w-full" :placeholder="$t('subject.enter_subject_name')" :required="true" required id="start-time" v-model="name" />
                </div>

                <div class="space-y-1 text-start flex items-end mt-4">
                    <ToggleSwitch id="switch2" aria-labelledby="switch2" v-model="status" />
                </div>
            </div>
        </div>
        <div class="flex justify-end border-t gap-2 p-4">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" />
            <Button :label="isSubmitting ? $t('element.adding') : $t('element.save')" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const collection = ref('subjects');
        const { postData, updateData } = useFetch(collection.value);
        const loading = ref(false);
        const name = ref(null);
        const status = ref(true);
        const handleSubmit = async () => {
            try {
                loading.value = true;
                const req = {
                    name: name.value,
                    status: status.value
                };

                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('close');
                    emit('toast', 'updated', 'success');
                } else {
                    await postData(req);
                    emit('close');
                    emit('toast', 'created', 'info');
                }
            } catch (error) {
                console.error('Submission error:', error);
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            if (props.datatoedit) {
                name.value = props.datatoedit.name;
                status.value = props.datatoedit.status;
            }
        });

        return {
            handleSubmit,
            name,
            loading,
            status
        };
    }
};
</script>
