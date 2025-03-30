<template>
    <form @submit.prevent="handleConfirm" class="w-full">
        <div class="flex justify-between items-center">
            <h2 for="room" class="block font-medium text-gray-700">Room</h2>
            <Button @click="$emit('close')" icon="pi pi-times" rounded />
        </div>
        <h2>Are you sure you want to confirm this room?</h2>
        <div class="flex gap-2 w-full justify-end">
            <Button @click="$emit('close')" label="Cancel" severity="danger" aria-label="Close">No</Button>
            <Button type="submit" @click="handleConfirm">Yes</Button>
        </div>
    </form>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';
export default {
    props: ['datetoedit'],
    setup(props, { emit }) {
        const { data, error, isPending, updateData } = useFetch('rooms');
        const handleConfirm = async () => {
            try {
                const req = {
                    booking_peding: true
                };
                if (props.datetoedit) {
                    const res = await updateData(req, props.datetoedit._id);
                    console.log('data updated', res);
                    emit('socket');
                    emit('close');
                }
            } catch (error) {
                console.log(error);
            }
        };
        onMounted(() => {
            if (props.datetoedit) {
                console.log(props.datetoedit._id);
            }
        });
        return {
            handleConfirm
        };
    }
};
</script>

<style lang="scss" scoped></style>
