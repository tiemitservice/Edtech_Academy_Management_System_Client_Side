<template>
    <form @submit.prevent="handleSubmit" class="w-[320px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Category' : 'Add New Category' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="start-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category Name <span class="text-red-500">*</span></label>
                <InputText :required="true" v-model="name" placeholder="Name" class="w-full" />
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
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const name = ref(null);
        const { postData, loading, updateData } = useFetch('student_categories');
        const handleSubmit = async () => {
            try {
                loading.value = true;

                const req = {
                    name: name.value
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
