<template>
    <form @submit.prevent="handleConfirm">
        <div>
            <div class="w-full flex justify-between items-center">
                <h2>Room Rejection</h2>
                <Button @click="$emit('close')" icon="pi pi-times" severity="danger" aria-label="Close" />
            </div>
            <h2>Are you sure you want to reject this room?</h2>
            <div class="flex gap-2 w-full justify-end">
                <Button @click="$emit('close')" label="Cancel" severity="danger" aria-label="Close">No</Button>
                <Button type="submit">Yes</Button>
            </div>
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
                    name: 'sss',
                    booking_pending: false, // Corrected typo from "booking_peding"
                    booked_by: null,
                    section: null,
                    booking_date: null
                };
                if (props.datetoedit) {
                    await updateData(req, props.datetoedit._id);
                    emit('socket'); // Uncomment to trigger socket event if needed
                    emit('close'); // Uncomment to close the form on success
                }
            } catch (error) {
                console.error('Update failed:', error); // Improved error logging
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
