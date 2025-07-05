<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Mark Class Form</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="px-4 py-5 space-y-5">
            <div>
                <label for="date" class="block text-sm font-medium text-gray-700"></label>
                Are you sure you want to mark this class as done?
            </div>
            <div class="space-y-1 text-start flex items-end">
                <ToggleSwitch id="switch2" aria-labelledby="switch2" v-model="mark_as_complete" />
            </div>
        </div>

        <!-- Action Buttons -->
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
        const { data: students, fetchData: fetchStudents } = useFetch('students');
        const { data: section, fetchData: fetchSection } = useFetch('sections');
        const workDay = ref([{ name: 'Monday' }, { name: 'Tuesday' }, { name: 'Wednesday' }, { name: 'Thursday' }, { name: 'Friday' }, { name: 'Saturday' }, { name: 'Sunday' }]);
        const duration = ref(null);
        const filterSection = ref({
            page: 1,
            limit: 50,
            search: '',
            searchColumn: ['', '']
        });

        const dayclass = ref(null);
        const filtersStudents = ref({
            page: 1,
            limit: 50,
            search: '',
            searchColumn: ['', '']
        });

        const filtersStaffs = ref({
            page: 1,
            limit: 50,
            search: '',
            searchColumn: ['', '']
        });

        const selectStaff = ref(null); // Renamed from "departments" for consistency
        const selectStudent = ref(null); // Renamed from "departments" for consistency
        const collection = ref('classes');
        const { postData, data, loading, error, updateData } = useFetch(collection.value);
        const name = ref(null);
        const status = ref(true);
        const mark_as_complete = ref(true);
        const isSubmitting = ref(false);

        const handleSubmit = async () => {
            try {
                isSubmitting.value = true;
                const req = {
                    mark_as_completed: mark_as_complete.value
                };
                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('close');
                    emit('toast', 'update');
                }
            } catch (error) {
                console.log('error', error);
            }
        };

        onMounted(async () => {
            if (props.datatoedit) {
                mark_as_complete.value = props.datatoedit.mark_as_completed;
                console.log('prop.datatoedit', props.datatoedit);
            }
            await fetchStaff(filtersStaffs.value);
            await fetchStudents(filtersStudents.value);
            await fetchSection(filterSection.value);
        });
        return {
            staffs,
            students,
            filtersStudents,
            filtersStaffs,
            selectStaff,
            selectStudent,
            collection,
            data,
            loading,
            error,
            fetchStaff,
            handleSubmit,
            name,
            status,

            isSubmitting,

            mark_as_complete
        };
    }
};
</script>

<style lang="scss" scoped></style>
