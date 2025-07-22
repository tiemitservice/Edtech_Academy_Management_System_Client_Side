<template>
    <form @submit.prevent="handleSubmit" class="w-[320px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? $t('element.edit') : $t('element.addnew') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="px-4 py-5 space-y-5">
            <!-- Staff Selection -->
            <div class="space-y-2 text-start flex flex-col">
                <label for="select_staff">{{ $t('asign_teacher.teacher') }}</label>
                <!-- 
                  - Removed optionLabel and optionValue to use the full object.
                  - Added filterFields to enable searching by both English and Khmer names.
                  - Added #value template to show both names in the input.
                  - Added #option template to show both names in the dropdown list.
                -->
                <Select id="select_staff" v-model="selectStaff" :options="staffs" filter show-clear :placeholder="$t('asign_teacher.select_teacher')" class="w-full" :filterFields="['en_name', 'kh_name']">
                    <template #value="slotProps">
                        <div v-if="slotProps.value" class="flex items-center">
                            <div>{{ slotProps.value.en_name }} ({{ slotProps.value.kh_name }})</div>
                        </div>
                        <span v-else>
                            {{ slotProps.placeholder }}
                        </span>
                    </template>
                    <template #option="slotProps">
                        <div class="flex flex-col items-start p-2">
                            <div class="font-bold">{{ slotProps.option.en_name }}</div>
                            <div class="text-sm text-gray-600">{{ slotProps.option.kh_name }}</div>
                        </div>
                    </template>
                </Select>

                <!-- Validation Message -->
                <Message severity="error" variant="simple" v-if="isValidateTeacher">
                    <p class="text-sm text-start">
                        {{ isValidateTeacher }}
                    </p>
                </Message>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end border-t gap-2 p-4">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" />
            <Button :label="isSubmitting ? $t('element.adding') : $t('element.save')" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        // --- MODIFIED: This will now hold the full staff object ---
        const selectStaff = ref(null);
        const name = ref(null); // class name
        const isSubmitting = ref(false);
        const isValidateTeacher = ref('');

        // Fetch class and staff data
        const { postData, data, loading, error, updateData, fetchData: fetchClasses } = useFetch('classes');
        const { data: staffs, fetchData: fetchStaff } = useFetch('staffs');
        const { data: sections, fetchData: fetchSections } = useFetch('sections');

        const formatDuration = (id) => {
            const section_id = sections.value?.find((section) => section._id === id);
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

            // --- MODIFIED: Check against the staff object's _id ---
            const staffId = selectStaff.value?._id;
            const conflict = allClasses.value.find((cls) => cls.staff === staffId && cls._id !== props.datatoedit?._id && cls.duration === currentSection);

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
                    // --- MODIFIED: Send the staff's _id from the selected object ---
                    staff: selectStaff.value?._id
                };

                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('toast', 'update', 'success');
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
            await Promise.all([fetchStaff(), fetchClasses(), fetchSections()]);
            allClasses.value = data.value || [];

            if (props.datatoedit) {
                name.value = props.datatoedit.name;
                // --- MODIFIED: Find the full staff object based on the ID ---
                if (staffs.value && props.datatoedit.staff) {
                    selectStaff.value = staffs.value.find((s) => s._id === props.datatoedit.staff);
                }
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
