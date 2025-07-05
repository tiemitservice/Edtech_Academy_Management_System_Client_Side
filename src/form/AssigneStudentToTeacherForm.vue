<template>
    <form @submit.prevent="handleSubmit" class="w-[320px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Assign Student</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4">
            <div>
                <!-- Personal Information -->
                <div>
                    <!-- student category -->
                    <div class="flex flex-col space-y-1">
                        <label for="categorySelected" class="text-sm font-medium"
                            >Select Teacher<span><span class="text-red-500"></span></span
                        ></label>
                        <Dropdown id="categorySelected" v-model="teacher" :options="staff" optionLabel="en_name" optionValue="_id" placeholder="Select a teacher" showClear class="w-full" />
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="w-full flex items-center justify-end mt-8 space-x-2">
                <Button @click="$emit('close')" label="Cancel" severity="danger" />
                <Button :label="isSubmitting ? 'Saving...' : 'Save'" :disabled="isSubmitting" type="submit" />
            </div>
        </div>
    </form>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { data: staff, fetchData: fetchStaff } = useFetch('staffs');
        const { postData, data, loading, error, updateData } = useFetch('students');
        const teacher = ref(null);
        const isSubmitting = ref(false);
        const handleSubmit = async () => {
            try {
                isSubmitting.value = true;

                const req = {
                    teacher: teacher.value
                };

                if (props.datatoedit) {
                    // Update existing student
                    await updateData(req, props.datatoedit._id);
                    emit('close');
                    emit('toast', 'update');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
            } finally {
                isSubmitting.value = false;
            }
        };

        onMounted(async () => {
            if (props.datatoedit) {
                teacher.value = props.datatoedit.teacher;
            }
            await fetchStaff();

            console.log('Mounted with data:', props.datatoedit);
        });

        return {
            teacher,
            handleSubmit,
            staff,
            isSubmitting
        };
    }
};
</script>

<style lang="scss" scoped>
/* Add any scoped styles if needed */
</style>
