<template>
    <form @submit.prevent="handleSubmit" class="w-[320px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? $t('element.edit') : $t('element.addnew') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 space-y-4">
            <div class="flex flex-col text-start">
                <label for="student_list" class="mb-2 font-medium">{{ $t('asign_student.student') }}</label>

                <!-- 
                  - Removed optionLabel and optionValue to use full objects.
                  - Added display="chip" for a better UI for multiple selections.
                  - Added custom templates for #option and #chip to display both names.
                  - ADDED filterFields to specify which object properties to use for searching.
                -->
                <MultiSelect
                    v-if="!loading"
                    id="student_list"
                    v-model="selectedStudents"
                    :options="availableStudents"
                    filter
                    show-clear
                    :placeholder="$t('asign_student.select_student')"
                    class="w-full"
                    display="chip"
                    :filterFields="['eng_name', 'kh_name']"
                >
                    <template #option="slotProps">
                        <div class="flex flex-col items-start p-2">
                            <div class="font-bold">{{ slotProps.option.eng_name }}</div>
                            <div class="text-sm text-gray-600">{{ slotProps.option.kh_name }}</div>
                        </div>
                    </template>
                    <template #chip="slotProps">
                        <div class="flex items-center px-2 py-1">
                            <span>{{ slotProps.value.eng_name }} ({{ slotProps.value.kh_name }})</span>
                        </div>
                    </template>
                </MultiSelect>

                <div v-else class="w-full p-2 border rounded-md bg-gray-100 text-gray-500">Loading students...</div>
                <small v-if="error" class="text-red-500 mt-1">{{ error }}</small>
            </div>
        </div>
        <div class="flex justify-end border-t gap-2 p-4">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" />
            <Button :label="isSubmitting ? $t('element.adding') : $t('element.save')" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => null
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Data Fetching ---
const { data: allStudents, fetchData: fetchStudents, loading: studentsLoading } = useFetch('students');
const { data: allclasses, fetchData: fetchAllClasses, loading: classesLoading } = useFetch('classes');
const { updateData, loading: isSubmitting } = useFetch('classes');

// --- Component State ---
// This will now hold an array of full student objects, not just IDs.
const selectedStudents = ref([]);
const error = ref('');
const loading = computed(() => studentsLoading.value || classesLoading.value);

// --- Computed Properties ---
const availableStudents = computed(() => {
    if (loading.value || !props.datatoedit) {
        return [];
    }

    const currentSubjectId = typeof props.datatoedit.subject === 'object' ? props.datatoedit.subject?._id : props.datatoedit.subject;
    if (!currentSubjectId) {
        return allStudents.value;
    }

    const unavailableStudentIds = new Set();
    for (const cls of allclasses.value) {
        if (cls._id === props.datatoedit._id || cls.mark_as_completed !== false) {
            continue;
        }
        const classSubjectId = typeof cls.subject === 'object' ? cls.subject?._id : cls.subject;
        if (classSubjectId === currentSubjectId) {
            for (const student of cls.students) {
                const studentId = student.student?._id || student.student;
                if (studentId) {
                    unavailableStudentIds.add(studentId);
                }
            }
        }
    }

    const studentsInThisClass = new Set((props.datatoedit.students || []).map((s) => s.student?._id || s.student));

    return allStudents.value.filter((student) => {
        return !unavailableStudentIds.has(student._id) || studentsInThisClass.has(student._id);
    });
});

// --- Form Submission ---
const handleSubmit = async () => {
    error.value = '';
    if (!props.datatoedit?._id) {
        console.error('No class data provided to edit.');
        return;
    }

    try {
        const originalStudents = props.datatoedit.students || [];

        // --- MODIFIED ---
        // Get an array of IDs from the selected student objects.
        const finalStudentIds = (selectedStudents.value || []).map((student) => student._id);

        // Rebuild the student list, preserving data for existing students.
        const studentsPayload = finalStudentIds.map((id) => {
            const existingData = originalStudents.find((s) => (s.student?._id || s.student) === id);
            return existingData || { student: id };
        });

        await updateData({ students: studentsPayload }, props.datatoedit._id);
        emit('toast', 'update');
        emit('save');
        emit('close');
    } catch (e) {
        console.error('Error assigning students:', e);
        emit('toast', 'error');
    }
};

// --- Lifecycle Hooks ---
onMounted(async () => {
    await Promise.all([fetchStudents({ status: true }), fetchAllClasses()]);
});

// --- MODIFIED ---
// Watch both the prop and the fetched students list.
// This now populates `selectedStudents` with full student objects.
watch(
    () => [props.datatoedit, allStudents.value],
    ([newData, students]) => {
        if (newData?.students && students?.length > 0) {
            const selectedIds = new Set(newData.students.map((s) => s.student?._id || s.student).filter(Boolean));
            // Filter the full student list to get the selected student objects.
            selectedStudents.value = students.filter((student) => selectedIds.has(student._id));
        } else {
            selectedStudents.value = [];
        }
    },
    { immediate: true, deep: true }
);
</script>
