<template>
    <form @submit.prevent="handleSubmit" class="w-[320px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Book' : 'Add New Book' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Subject Name <span class="text-red-500">*</span></label>
                <div class="relative">
                    <InputText class="w-full" placeholder="Subject Name" :required="true" required id="name" v-model="name" />
                </div>
            </div>
            <div>
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Book Type <span class="text-red-500">*</span></label>
                <div class="relative">
                    <Select filter show-clear class="w-full" :options="book_categories" optionLabel="name" optionValue="_id" placeholder="Book Type" id="name" v-model="book_type" />
                </div>
            </div>
            <div>
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price <span class="text-red-500">*</span></label>
                <div class="relative">
                    <InputNumber class="w-full" placeholder="Price" :required="true" required id="name" v-model="price" />
                </div>

                <div class="space-y-1 text-start flex items-end mt-4">
                    <ToggleSwitch id="switch2" aria-labelledby="switch2" v-model="status" />
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

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const collection = ref('books');
        const { postData, updateData } = useFetch(collection.value);
        const { data: book_categories, fetchData: fetchSubjects } = useFetch('book_categories');
        const loading = ref(false);
        const name = ref(null);
        const status = ref(true);
        const book_type = ref(null);
        const price = ref(null);
        const handleSubmit = async () => {
            try {
                loading.value = true;
                const req = {
                    name: name.value,
                    status: status.value,
                    bookType: book_type.value,
                    price: price.value
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

        onMounted(async () => {
            if (props.datatoedit) {
                name.value = props.datatoedit.name;
                status.value = props.datatoedit.status;
                book_type.value = props.datatoedit.bookType;
                price.value = props.datatoedit.price;
            }

            await fetchSubjects();
        });

        return {
            handleSubmit,
            name,
            loading,
            status,
            book_type,
            price,
            book_categories
        };
    }
};
</script>
