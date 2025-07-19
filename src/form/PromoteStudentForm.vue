<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ $t('class.promote_student') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4 text-start space-y-4">
            <!-- From Class (Disabled) -->
            <div>
                <label for="from_class" class="block mb-2 text-sm font-medium text-gray-900">{{ $t('class.from_class') }}</label>
                <InputText id="from_class" :value="datatoedit?.name" class="w-full" disabled />
            </div>

            <!-- Student Selection -->
            <div>
                <label for="student_list" class="block mb-2 text-sm font-medium text-gray-900"> {{ $t('class.student_to_promote') }} <span class="text-red-500">*</span> </label>
                <MultiSelect
                    id="student_list"
                    v-model="selectedStudentIds"
                    :options="studentsInFromClass"
                    filter
                    show-clear
                    optionLabel="student.eng_name"
                    optionValue="student._id"
                    :placeholder="$t('class.promote_selected_student')"
                    class="w-full"
                    :disabled="!datatoedit || studentsInFromClass.length === 0"
                />
                <small v-if="!datatoedit || studentsInFromClass.length === 0" class="text-gray-500 mt-1"> This class has no students to promote. </small>
            </div>

            <!-- To Class (Selectable) -->
            <div>
                <label for="to_class" class="block mb-2 text-sm font-medium text-gray-900"> {{ $t('class.to_class') }} <span class="text-red-500">*</span> </label>
                <Select id="to_class" filter show-clear class="w-full" :options="availableClasses" optionLabel="name" optionValue="_id" :placeholder="$t('class.to_class')" v-model="toClassId" />
            </div>
            <small v-if="error" class="text-red-500 mt-1">{{ error }}</small>
        </div>

        <!-- Action Buttons -->
        <div class="w-full flex justify-end gap-3 p-4 border-t bg-gray-50">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" />
            <Button :label="isSubmitting ? $t('element.adding') : $t('element.save')" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '@/composible/useFetch';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        type: Object,
        required: true
    }
});
const emit = defineEmits(['close', 'save', 'toast']);

// --- Data Fetching ---
const { data: allclasses, loading, fetchData } = useFetch('classes');
const { updateData } = useFetch('classes');
const { postData: postPromoteReport } = useFetch('promotestudentreports');

// --- Component State ---
const toClassId = ref(null);
const selectedStudentIds = ref([]);
const error = ref('');

// --- Computed Properties ---
const studentsInFromClass = computed(() => {
    return (props.datatoedit?.students || []).filter((s) => s.student && s.student._id && s.student.eng_name);
});

const availableClasses = computed(() => {
    if (!Array.isArray(allclasses.value)) {
        return [];
    }
    return allclasses.value.filter((cls) => {
        const isNotEmpty = cls.students && cls.students.length > 0;
        const isOriginalClass = cls._id === props.datatoedit?._id;
        return !isNotEmpty && !isOriginalClass;
    });
});

// --- Form Submission ---
const handleSubmit = async () => {
    error.value = '';

    if (!selectedStudentIds.value || selectedStudentIds.value.length === 0) {
        error.value = 'Please select at least one student to promote.';
        return;
    }
    if (!toClassId.value) {
        error.value = 'Please select a destination class.';
        return;
    }

    try {
        const fromClass = props.datatoedit;
        const toClass = allclasses.value.find((c) => c._id === toClassId.value);

        if (!fromClass || !toClass) {
            error.value = 'Could not find source or destination class.';
            return;
        }

        const studentIdsToPromote = new Set(selectedStudentIds.value);

        // **CORRECTED LOGIC:**
        // 1. Create the list of students who will REMAIN in the original class.
        // It's crucial to "un-populate" the student field to send only the ID back to the server.
        const remainingStudentsPayload = fromClass.students
            .filter((s) => !studentIdsToPromote.has(s.student?._id))
            .map((s) => ({
                ...s, // Copy all score fields
                student: s.student?._id // Ensure the student field is just the ID
            }));

        // 2. Create the list of students to be ADDED to the new class.
        const promotedStudentsPayload = selectedStudentIds.value.map((id) => ({ student: id }));

        // 3. Prepare final payloads for the API calls.
        const fromClassPayload = { students: remainingStudentsPayload };
        const toClassPayload = { students: promotedStudentsPayload };
        const reportPayload = {
            from_class_id: fromClass._id,
            class_id: toClassId.value,
            students: selectedStudentIds.value.map((id) => ({ student: id }))
        };

        // 4. Execute all database operations.
        await Promise.all([updateData(fromClassPayload, fromClass._id), updateData(toClassPayload, toClassId.value), postPromoteReport(reportPayload)]);

        emit('toast', 'update', 'success');
        emit('close');
    } catch (e) {
        console.error('Error promoting students:', e);
        error.value = 'An error occurred during the promotion.';
        emit('toast', 'error', 'Promotion failed.');
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await fetchData();
});
</script>
