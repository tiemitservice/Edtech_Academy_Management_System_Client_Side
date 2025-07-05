<template>
    <form @submit.prevent="handleSubmit" class="w-[320px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Assign Student' : 'Add Assign Student' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="px-4 py-5 space-y-5 flex flex-col text-start">
            <!-- Class Name -->
            <label for="select_staff"> Students </label>
            <MultiSelect id="select_staff" v-model="selectStudent" :options="students" filter show-clear optionLabel="eng_name" optionValue="_id" placeholder="Select  Students" class="w-full" />
        </div>
        <Message severity="error" variant="simple" v-if="isValidateName"> Student is required. </Message>
        <div class="w-full flex items-center justify-end mt-8 p-4">
            <Button label="Save" type="submit" class="mr-2" />
            <Button @click="$emit('close')" label="Cancel" severity="danger" />
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

        const handleSubmit = async () => {
            try {
                const req = {
                    name: name.value,
                    staff: selectStaff.value,
                    students: selectStudent.value.map((id) => ({
                        student: id
                    }))
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
                console.log('Sending students:', selectStudent.value);
            } catch (error) {
                console.log('error', error);
            }
        };

        onMounted(async () => {
            if (props.datatoedit) {
                name.value = props.datatoedit.name;
                selectStaff.value = props.datatoedit.staff?._id;
                selectStudent.value = props.datatoedit.students?.map((student) => student.student._id);

                console.log('prop.datatoedit', props.datatoedit);
            }
            await fetchStaff(filtersStaffs.value);
            await fetchStudents(filtersStudents.value);
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
            name
        };
    }
};
</script>

<style lang="scss" scoped></style>
