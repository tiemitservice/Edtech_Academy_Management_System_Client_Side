<template>
    <form @submit.prevent="handleSubmit" class="w-[320px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Assign Teacher' : 'Add Assign Teacher' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="px-4 py-5 space-y-5">
            <!-- Class Name -->
            <div class="space-y-1 text-start flex flex-col">
                <label for="select_staff"> Staff </label>
                <Select id="select_staff" v-model="selectStaff" :options="staffs" filter show-clear optionLabel="en_name" optionValue="_id" placeholder="Select a staff" class="w-full" />
            </div>
        </div>
        <Message severity="error" variant="simple" v-if="isValidateTeacher"> Class name is required. </Message>

        <div class="flex justify-end gap-2 p-4">
            <Button label="Cancel" @click="$emit('close')" severity="danger" outlined />
            <Button :label="isSubmitting ? 'Saving...' : 'Save'" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>
<script>
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { data: staffs, fetchData: fetchStaff } = useFetch('staffs');

        const selectStaff = ref(null); // Renamed from "departments" for consistency
        const selectStudent = ref(null); // Renamed from "departments" for consistency
        const collection = ref('classes');
        const { postData, data, loading, error, updateData } = useFetch(collection.value);
        const name = ref(null);
        const isValidateTeacher = ref(false);
        const isSubmitting = ref(false);
        const validateTeacher = () => {
            if (!name.value) {
                isValidateTeacher.value = 'Teacher is required.';
                return false;
            }
            isValidateTeacher.value = '';
            return true;
        };
        watch(name, () => {
            validateTeacher();
        });
        const handleSubmit = async () => {
            if (!validateTeacher()) {
                return;
            }
            try {
                isSubmitting.value = true;
                const req = {
                    name: name.value,
                    staff: selectStaff.value
                };
                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('close');
                    emit('toast', 'update');
                } else {
                    await postData(req);
                }
            } catch (error) {
                console.log('error', error);
            }
        };

        onMounted(async () => {
            if (props.datatoedit) {
                name.value = props.datatoedit.name;
                selectStaff.value = props.datatoedit.staff;
                console.log('prop.datatoedit', props.datatoedit);
            }
            await fetchStaff();
        });
        return {
            staffs,
            selectStaff,

            collection,
            data,
            loading,
            error,
            fetchStaff,
            handleSubmit,
            name,
            isSubmitting,
            isValidateTeacher
        };
    }
};
</script>

<style lang="scss" scoped></style>
