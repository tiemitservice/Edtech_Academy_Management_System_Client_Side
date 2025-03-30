<template>
    <div>
        <h2>Are you sure to delete</h2>
        <div class="w-full justify-end flex space-x-2">
            <Button @click="$emit('close')" label="Cancel" severity="danger" aria-label="Close">No</Button>
            <Button @click="handleDelete">Yes</Button>
        </div>
    </div>
</template>

<script>
import { useFetch } from '@/composible/useFetch';
import { onMounted } from 'vue';
export default {
    props: ['deleteData', 'collection'],
    setup(props, { emit }) {
        const { deleteData } = useFetch(props.collection);
        const handleDelete = () => {
            deleteData(props.deleteData);
            emit('socket');
            emit('close');
        };
        onMounted(() => {
            if (props.collection && props.deleteData) {
                console.log(props.collection, props.deleteData);
            }
        });
        return { handleDelete };
    }
};
</script>

<style lang="scss" scoped></style>
