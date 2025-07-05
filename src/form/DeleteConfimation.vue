<template>
    <div class="w-[420px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800"> Are you sure you want to delete this item? </label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <p class="text-gray-700">
                This data can not be restored <span class="font-semibold text-primary"> [ {{ displayName }} ] </span>
            </p>
        </div>
        <div class="w-full justify-end flex space-x-2 p-4">
            <Button @click="$emit('close')" label="Cancel" severity="danger" aria-label="Close">No</Button>
            <Button @click="handleDelete">Yes</Button>
        </div>
    </div>
</template>

<script>
import { useFetch } from '@/composible/useFetch';
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
export default {
    props: ['deleteData', 'collection', 'datatoedit'],
    setup(props, { emit }) {
        const route = useRoute();
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
            if (route.path === '/staffpermission') {
                return (props.datatoedit?.staff && formatStaffNestedField(props.datatoedit.staff, 'name')) || '';
            }
            if (route.path === '/posistion') return props.datatoedit.name;
            if (route.path === '/department') return props.datatoedit?.name;
            if (route.path === '/section') return props.datatoedit?.duration;
            return '';
        });

        const handleDelete = async () => {
            try {
                await deleteData(props.deleteData); // Pass the correct id
                emit('close');
                emit('toast', 'deleted');
            } catch (err) {
                console.error('Delete failed:', err);
                emit('close'); // Close even if delete fails
                emit('toast', 'asociate');
            }
        };
        onMounted(async () => {
            if (props.datatoedit) {
                console.log('props.datatoedit', props.datatoedit);
            }
            if (props.deleteData) console.log('props.deleteData', props.deleteData);
            await fetchStaff();
        });

        return { handleDelete, route, displayName };
    }
};
</script>

<style lang="scss" scoped></style>
