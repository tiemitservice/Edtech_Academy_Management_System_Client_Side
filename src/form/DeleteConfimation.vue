<template>
    <div class="w-[420px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800"> {{ $t('element.delete_item') }} </label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <p class="text-gray-700">
                {{ $t('element.can_be_restore') }} <span class="font-semibold text-primary"> [ {{ displayName }} ] </span>
            </p>
        </div>
        <div class="w-full justify-end flex space-x-2 p-4">
            <Button @click="$emit('close')" label="Cancel" severity="danger" aria-label="Close">
                {{ $t('element.cancel') }}
            </Button>
            <Button @click="handleDelete">{{ $t('element.yes') }}</Button>
        </div>
    </div>
</template>

<script>
import { useFetch } from '@/composible/useFetch';
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
export default {
    props: ['deleteData', 'collection', 'datatoedit'],
    setup(props, { emit }) {
        const route = useRoute();
        const { t } = useI18n();
        const { deleteData } = useFetch(props.collection);
        const { data: staffs, fetchData: fetchStaff } = useFetch('users');

        const formatStaffNestedField = (id, fieldPath, fallback = 'Unknown') => {
            const staff = staffs.value?.find((staff) => staff._id === id);
            if (!staff) return fallback;

            const fields = fieldPath.split('.');
            const result = fields.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), staff);

            if (Array.isArray(result)) return result.join(', ');
            return result ?? fallback;
        };
        const displayName = computed(() => {
            if (route.path === '/class') return props.datatoedit?.name;
            if (route.path === '/studentlist') return props.datatoedit?.eng_name;
            if (route.path === '/subject') return props.datatoedit?.name;
            if (route.path === '/student_category') return props.datatoedit?.name;
            if (route.path === '/staffpermission') {
                return (props.datatoedit?.staff && formatStaffNestedField(props.datatoedit.staff, 'name')) || '';
            }
            if (route.path === '/posistion') return props.datatoedit.name;
            if (route.path === '/department') return props.datatoedit?.name;
            if (route.path === '/section') return props.datatoedit?.duration;
            if (route.path === '/holiday') return props.datatoedit?.year;
            if (route.path === '/users') return props.datatoedit?.name;
            if (route.path === '/studentpermission') return props.datatoedit?.reason;
            if (route.path === '/staff') return props.datatoedit?.en_name;
            if (route.path === '/book') return props.datatoedit?.name;
            if (route.path === '/bookcategory') return props.datatoedit?.name;
            if (route.path === '/bookpayment') return props.datatoedit?.displayId;
            // feedbark route
            if (route.path === '/feedback') return props.datatoedit?.feedback;
            return '';
        });

        const handleDelete = async () => {
            try {
                await deleteData(props.deleteData); // Pass the correct id
                emit('close');
                emit('toast', 'delete', 'error');
            } catch (err) {
                console.error('Delete failed:', err);
                emit('close'); // Close even if delete fails
                emit('toast', 'asociate', 'warn');
            }
        };
        onMounted(async () => {
            if (props.datatoedit) {
                console.log('props.datatoedit', props.datatoedit);
            }
            if (props.deleteData) console.log('props.deleteData', props.deleteData);
            await fetchStaff();
        });

        return { handleDelete, route, displayName, t };
    }
};
</script>

<style lang="scss" scoped></style>
