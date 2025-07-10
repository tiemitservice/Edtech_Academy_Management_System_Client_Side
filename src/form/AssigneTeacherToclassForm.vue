<template>
    <form @submit.prevent="handleSubmit" class="w-[320px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">
                {{ datatoedit ? 'Edit Assign Teacher' : 'Add Assign Teacher' }}
            </label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="px-4 py-5 space-y-5">
            <!-- Staff Selection -->
            <div class="space-y-1 text-start flex flex-col">
                <label for="select_staff">Teacher</label>
                <Select id="select_staff" v-model="selectStaff" :options="staffs" filter show-clear optionLabel="en_name" optionValue="_id" placeholder="Select a Teacher" class="w-full" />
                <!-- Validation Message -->
                <Message severity="error" variant="simple" v-if="isValidateTeacher">
                    <p class="text-sm text-start">
                        {{ isValidateTeacher }}
                    </p>
                </Message>
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
        const selectStaff = ref(null);
        const name = ref(null); // class name
        const isSubmitting = ref(false);
        const isValidateTeacher = ref('');

        // Fetch class and staff data
        const { postData, data, loading, error, updateData, fetchData: fetchClasses } = useFetch('classes');
        const { data: staffs, fetchData: fetchStaff } = useFetch('staffs');
        const { data: sections, fetchData: fetchSections } = useFetch('sections');
        const formatDuration = (id) => {
            const section_id = sections.value?.find((section_id) => section_id._id === id);
            return section_id ? section_id.duration : 'N/A';
        };
        const allClasses = ref([]);

        const validateTeacher = () => {
            if (!selectStaff.value) {
                isValidateTeacher.value = 'Staff is required.';
                return false;
            }

            if (!Array.isArray(allClasses.value) || allClasses.value.length === 0) {
                isValidateTeacher.value = 'Class data not loaded.';
                return false;
            }

            const currentClass = allClasses.value.find((c) => c._id === props.datatoedit?._id || name.value === c.name);
            const currentSection = currentClass?.duration;

            if (!currentSection) {
                isValidateTeacher.value = 'This class has no section (duration) assigned yet.';
                return false;
            }

            const conflict = allClasses.value.find((cls) => cls.staff === selectStaff.value && cls._id !== props.datatoedit?._id && cls.duration === currentSection);

            if (conflict) {
                isValidateTeacher.value = `This staff is already assigned to another class with session ${formatDuration(conflict.duration)}`;
                return false;
            }

            isValidateTeacher.value = '';
            return true;
        };

        const handleSubmit = async () => {
            if (!validateTeacher()) return;

            try {
                isSubmitting.value = true;
                const req = {
                    name: name.value,
                    staff: selectStaff.value
                };

                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('toast', 'update');
                } else {
                    await postData(req);
                }

                emit('close');
            } catch (error) {
                console.error('Submit error:', error);
            } finally {
                isSubmitting.value = false;
            }
        };

        onMounted(async () => {
            await fetchStaff();
            await fetchClasses();
            await fetchSections();
            allClasses.value = data.value || [];

            if (props.datatoedit) {
                name.value = props.datatoedit.name;
                selectStaff.value = props.datatoedit.staff;
            }
        });

        watch(selectStaff, validateTeacher);

        return {
            staffs,
            selectStaff,
            name,
            isSubmitting,
            handleSubmit,
            isValidateTeacher
        };
    }
};
</script>

<style lang="scss" scoped></style>
