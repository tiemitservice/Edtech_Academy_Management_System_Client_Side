<template>
    <form @submit.prevent="handleSubmit" class="w-[320px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? $t('element.edit') : $t('element.addnew') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('position.name') }} <span class="text-red-500">*</span></label>
                <InputText :required="true" v-model="name" placeholder="Name" class="w-full" />
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
        const name = ref(null);
        const { postData, loading, updateData } = useFetch('positions');
        const handleSubmit = async () => {
            try {
                loading.value = true;

                const req = {
                    name: name.value
                };
                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('close');
                    emit('toast', 'update', 'success');
                } else {
                    await postData(req);
                    emit('close');
                    emit('toast', 'create', 'info');
                }
            } catch (error) {
                console.log(error);
            }
        };
        onMounted(() => {
            if (props.datatoedit) {
                name.value = props.datatoedit?.name;
            }
        });
        return {
            name,
            handleSubmit,
            loading
        };
    }
};
</script>

<style lang="scss" scoped></style>
