<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? $t('element.edit') : $t('element.addnew') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <!-- Form Fields -->
        <div class="px-4 py-5 space-y-5">
            <!-- Class Name -->
            <div class="space-y-1 text-start">
                <label for="eng_name" class="block text-sm font-medium text-gray-700">{{ $t('class.namePlaceholder') }} <span class="text-red-500">*</span> </label>
                <InputText id="eng_name" v-model="name" type="text" :placeholder="$t('element.name_placeholder')" :required="true" class="w-full" />
            </div>
            <Message severity="error" variant="simple" v-if="isValidateName"> Class name is required. </Message>

            <!-- Status Toggle -->

            <div class="space-y-1 text-start">
                <label for="section" class="block text-sm font-medium text-gray-700"> {{ $t('class.select_day') }} </label>
                <MultiSelect id="day_class" v-model="dayclass" :options="workDay" optionLabel="name" optionValue="name" filter show-clear placeholder="Select days of week" class="w-full" />
            </div>
            <!-- Holiday -->
            <div class="space-y-1 text-start">
                <label for="holiday" class="block text-sm font-medium text-gray-700"> {{ $t('class.holiday_schedule') }} </label>
                <Select id="holiday" :options="holidays" option-label="year" option-value="_id" v-model="selectHoliday" filter show-clear placeholder="Select a Holiday Year" class="w-full" />
            </div>

            <div class="space-y-1 text-start">
                <label for="section" class="block text-sm font-medium text-gray-700"> {{ $t('class.session') }} </label>
                <Select id="section" :options="section" option-label="duration" option-value="_id" v-model="duration" filter show-clear :placeholder="$t('class.select_session')" class="w-full" />
            </div>
            <div class="space-y-1 text-start">
                <label for="section" class="block text-sm font-medium text-gray-700"> {{ $t('class.subject') }} </label>
                <Select id="section" :options="subjects" option-label="name" option-value="_id" v-model="subject" filter show-clear :placeholder="$t('class.select_subject')" class="w-full" />
            </div>
            <div class="space-y-1 text-start">
                <label for="Status" class="block text-sm font-medium text-gray-700"> {{ $t('element.status') }} </label>
                <ToggleSwitch aria-labelledby="switch2" v-model="status" />
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 p-4">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" />
            <Button :label="isSubmitting ? $t('element.adding') : $t('element.save')" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { useI18n } from 'vue-i18n';

// Initialize i18n
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { t } = useI18n();
        const { data: staffs, fetchData: fetchStaff } = useFetch('staffs');
        const { data: students, fetchData: fetchStudents } = useFetch('students');
        const { data: section, fetchData: fetchSection } = useFetch('sections');
        const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
        const { data: holidays, fetchData: fetchHolidays } = useFetch('holidays');
        const subject = ref(null);
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

        const filterSubjects = ref({
            status: true
        });

        const selectStaff = ref(null); // Renamed from "departments" for consistency
        const selectStudent = ref(null); // Renamed from "departments" for consistency
        const collection = ref('classes');
        const { postData, data, loading, error, updateData } = useFetch(collection.value);
        const name = ref(null);
        const status = ref(true);
        const mark_as_complete = ref(true);
        const selectHoliday = ref(null);
        const isSubmitting = ref(false);
        const isValidateName = ref(false);
        const validateName = () => {
            if (!name.value) {
                isValidateName.value = 'Class name is required.';
                return false;
            }
            isValidateName.value = '';
            return true;
        };
        watch(name, () => {
            validateName();
        });
        const handleSubmit = async () => {
            if (!validateName()) {
                return;
            }
            try {
                isSubmitting.value = true;
                const req = {
                    name: name.value,
                    status: status.value,
                    day_class: dayclass.value || [],
                    subject: subject.value,
                    duration: duration.value,
                    holiday: selectHoliday.value
                };

                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('close');
                    emit('toast', 'update');
                } else {
                    await postData(req);
                    emit('close');
                    emit('toast', 'create');
                }
            } catch (error) {
                console.log('error', error);
            }
        };

        onMounted(async () => {
            if (props.datatoedit) {
                name.value = props.datatoedit.name;
                selectStaff.value = props.datatoedit.staff?._id;
                selectStudent.value = props.datatoedit.students?.map((student) => student._id);
                dayclass.value = Array.isArray(props.datatoedit.day_class) ? props.datatoedit.day_class : [];
                subject.value = props.datatoedit?.subject;
                duration.value = props.datatoedit?.duration;
                mark_as_complete.value = props.datatoedit.mark_as_complete;
                selectHoliday.value = props.datatoedit.holiday;
                console.log('prop.datatoedit', props.datatoedit);
            }
            await fetchStaff(filtersStaffs.value);
            await fetchStudents(filtersStudents.value);
            await fetchSection(filterSection.value);
            await fetchSubjects(filterSubjects.value);
            await fetchHolidays();
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
            isValidateName,
            isSubmitting,
            workDay,
            dayclass,
            section,
            duration,
            mark_as_complete,
            subjects,
            subject,
            holidays,
            selectHoliday,
            t
        };
    }
};
</script>

<style lang="scss" scoped></style>
