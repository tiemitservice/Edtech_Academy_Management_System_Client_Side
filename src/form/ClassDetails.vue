<template>
    <div class="w-[820px] max-w-full bg-white dark:bg-gray-800 h-auto rounded-lg shadow-lg">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ $t('class.class_details') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded :aria-label="$t('actions.close')" />
        </div>

        <!-- Content -->
        <div>
            <div class="w-full flex items-start justify-center gap-5 p-5" v-if="datatoedit">
                <!-- Teacher Information Card -->
                <div v-if="datatoedit" class="flex flex-col py-4 px-4 border w-[420px] rounded-lg space-y-2 sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6">
                    <p class="w-full text-lg text-black bg-white font-semibold text-start">{{ $t('staff.teacher') }}</p>
                    <div v-if="datatoedit.staff" class="flex items-center justify-start space-x-4 sm:space-x-6">
                        <img class="block size-24 overflow-hidden object-cover rounded-full sm:mx-0 sm:shrink-0" :src="formatStaffNestedField(datatoedit.staff, 'image')" :alt="$t('staff.teacher_details')" />
                        <div class="text-center space-y-2 sm:text-left">
                            <div class="space-y-0.5">
                                <p class="text-lg text-black font-semibold">{{ formatStaffNestedField(datatoedit.staff, 'en_name') }}</p>
                                <p class="text-slate-500 font-medium">
                                    <span> <i class="pi pi-phone text-primary"></i> : </span>
                                    {{ formatStaffNestedField(datatoedit.staff, 'phoneNumber') }}
                                </p>
                                <p class="text-slate-500 font-medium">
                                    <span> <i class="pi pi-calendar text-primary"></i> : </span>
                                    {{ formatDate2(formatStaffNestedField(datatoedit.staff, 'date_of_birth')) }}
                                </p>
                                <p class="text-slate-500 font-medium">
                                    <span> <i class="pi pi-map-marker text-primary"></i> : </span>
                                    {{ formatStaffNestedField(datatoedit.staff, 'address') }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <!-- Placeholder for when there is no teacher -->
                    <div v-else class="flex flex-col items-center justify-center py-4 px-4 w-full h-[200px]">
                        <i class="pi pi-user text-4xl text-gray-400 mb-2"></i>
                        <p class="text-gray-500 font-medium">{{ $t('staff.no_teacher_details') }}</p>
                    </div>
                </div>

                <!-- Class Details Card -->
                <div class="py-4 px-4 border w-[420px] bg-white rounded-lg space-y-2 sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6">
                    <div class="text-center space-y-2 sm:text-left">
                        <div class="space-y-2">
                            <p class="text-lg text-black font-semibold">{{ $t('class.class_details') }}</p>
                            <div class="flex items-center flex-wrap gap-4">
                                <span class="text-primary font-medium text-nowrap"> {{ $t('class.name') }} : </span>
                                <span class="inline-block px-3 py-1 text-lg font-semibold text-gray-800">
                                    {{ datatoedit.name }}
                                </span>
                            </div>
                            <div class="flex items-center flex-wrap gap-4">
                                <span class="text-primary font-medium text-nowrap"> {{ $t('class.day_class') }} : </span>
                                <span v-for="day in datatoedit.day_class" :key="day" class="inline-block px-3 py-1 text-lg font-semibold rounded-full bg-gray-100 text-gray-800">
                                    {{ day }}
                                </span>
                            </div>
                            <div class="flex items-center flex-wrap gap-4">
                                <span class="text-primary font-medium text-nowrap"> {{ $t('class.total_student') }} : </span>
                                <span class="inline-block px-3 py-1 text-lg font-semibold rounded-full bg-gray-100 text-gray-800">
                                    {{ datatoedit.students?.length }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { formatDate2 } from '@/composible/formatDate';
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { data: students, fetchData: fetchStudents } = useFetch('students');
        const { data: staffs, fetchData: fetchStaff } = useFetch('staffs');
        const { data: positions, fetchData: fetchPositions } = useFetch('positions');
        const formatStaffNestedField = (id, fieldPath, fallback = 'Unknown') => {
            const staff = staffs.value?.find((staff) => staff._id === id);
            if (!staff) return fallback;

            const fields = fieldPath.split('.');
            const result = fields.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), staff);

            if (Array.isArray(result)) return result.join(', ');
            return result ?? fallback;
        };

        const formatStudentName = (id) => {
            const student = students.value?.find((student) => student._id === id);
            return student ? student.en_name : 'Unknown';
        };
        const formatPositionName = (id) => {
            const position = positions.value?.find((position) => position._id === id);
            return position ? position.name : 'Unknown';
        };
        onMounted(async () => {
            await Promise.allSettled([fetchStaff(), fetchStudents(), fetchPositions()]);
            if (props.datatoedit) {
                console.log('Editing class:', props.datatoedit);
            }
        });
        return { formatStaffNestedField, formatStudentName, formatDate2 };
    }
};
</script>

<style lang="sass" scoped></style>
