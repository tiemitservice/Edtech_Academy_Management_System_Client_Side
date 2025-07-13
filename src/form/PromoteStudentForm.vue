<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Promote Students to New Class</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4 text-start space-y-4">
            <!-- From Class (Disabled) -->
            <div>
                <label for="from_class" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">From Class</label>
                <InputText id="from_class" :value="datatoedit?.name" class="w-full" disabled />
            </div>

            <!-- To Class (Selectable) -->
            <div>
                <label for="to_class" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">To Class <span class="text-red-500">*</span></label>
                <Select id="to_class" filter show-clear class="w-full" :options="availableClasses" optionLabel="name" optionValue="_id" placeholder="Select a destination class" v-model="toClassId" />
                <small v-if="error" class="text-red-500 mt-1">{{ error }}</small>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="w-full flex justify-end gap-3 p-4 border-t bg-gray-50">
            <Button @click="$emit('close')" label="Cancel" severity="secondary" outlined />
            <Button :label="loading ? 'Promoting...' : 'Submit'" type="submit" :loading="loading" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '@/composible/useFetch';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        // This is the "From Class" object
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
const error = ref('');

// --- Computed Properties ---
const availableClasses = computed(() => {
    if (!Array.isArray(allclasses.value)) {
        return [];
    }
    return allclasses.value.filter((cls) => (!cls.students || cls.students.length === 0) && cls._id !== props.datatoedit?._id);
});

// --- Form Submission ---
const handleSubmit = async () => {
    error.value = '';
    // 1. Validation
    if (!toClassId.value) {
        error.value = 'Please select a destination class.';
        return;
    }
    if (!props.datatoedit?.students || props.datatoedit.students.length === 0) {
        error.value = 'The original class has no students to transfer.';
        return;
    }

    try {
        // 2. Prepare Payloads
        const studentsToTransfer = props.datatoedit.students.map((s) => ({ student: s.student?._id })).filter((s) => s.student);
        const toClassPayload = { students: studentsToTransfer };
        const fromClassPayload = { students: [] };

        // **FIX:** Prepare the report payload according to the new schema
        const reportPayload = {
            from_class_id: props.datatoedit._id, // The class they are coming FROM
            class_id: toClassId.value, // The class they are going TO
            // The report only needs the student IDs, not their full score objects
            students: props.datatoedit.students.map((s) => ({ student: s.student?._id })).filter((s) => s.student)
        };

        // 3. Execute all three database operations concurrently
        await Promise.all([updateData(toClassPayload, toClassId.value), updateData(fromClassPayload, props.datatoedit._id), postPromoteReport(reportPayload)]);

        // 4. Emit events on success
        emit('toast', 'update');
        emit('close');
    } catch (e) {
        console.error('Error promoting students:', e);
        error.value = 'An error occurred during the promotion.';
        emit('toast', 'error', 'Promotion failed.');
    }
};

// --- Lifecycle Hook ---
onMounted(() => {
    fetchData();
});
</script>
