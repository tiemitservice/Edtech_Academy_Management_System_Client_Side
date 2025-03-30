<template>
    <form @submit.prevent="handleSubmit" class="w-full">
        <h1>Section</h1>
        <div class="flex flex-col space-y-4">
            <div class="flex flex-col space-y-1">
                <label for="start_time">Start Time</label>
                <DatePicker v-model="start_time" timeOnly fluid placeholder="Start time" />
            </div>
            <div class="flex flex-col space-y-1">
                <label for="end_time">End Time</label>
                <DatePicker v-model="end_time" timeOnly fluid placeholder="End time" />
            </div>
            <div class="w-full flex justify-end gap-3">
                <Button type="submit">Submit</Button>
                <Button type="reset" severity="danger">Reset</Button>
            </div>
        </div>
    </form>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const collection = ref('sections');
        const { postData, data, loading, error, updateData } = useFetch(collection.value);
        const start_time = ref(null); // Initialize as null
        const end_time = ref(null); // Initialize as null

        const ensureHmmFormat = (timeString) => {
            if (!timeString) return null;
            // DatePicker might return a string like "8:00" or a Date object
            let hours, minutes;
            if (typeof timeString === 'string') {
                [hours, minutes] = timeString.split(':').map(Number);
            } else if (timeString instanceof Date) {
                hours = timeString.getHours();
                minutes = timeString.getMinutes();
            } else {
                return null;
            }
            return `${hours}:${minutes.toString().padStart(2, '0')}`;
        };

        const handleSubmit = async () => {
            try {
                // Ensure the time is in H:mm format before submitting
                const formattedStartTime = ensureHmmFormat(start_time.value);
                const formattedEndTime = ensureHmmFormat(end_time.value);

                const req = {
                    start_time: formattedStartTime, // e.g., "8:00"
                    end_time: formattedEndTime, // e.g., "9:30"
                    status: true
                };
                if (props.datatoedit) {
                    await updateData(req, props.datatoedit._id);
                    emit('socket');
                    emit('close');
                } else {
                    await postData(req);
                    emit('socket');
                    emit('close');
                }
            } catch (error) {
                console.log(error);
            }
        };

        watch(start_time, (newValue) => {
            console.log('Start Time:', newValue);
        });

        watch(end_time, (newValue) => {
            console.log('End Time:', newValue);
        });

        onMounted(async () => {
            if (props.datatoedit) {
                // Convert ISO strings to H:mm format for the DatePicker
                start_time.value = props.datatoedit.start_time;
                end_time.value = props.datatoedit.end_time;
            }
        });

        return {
            handleSubmit,
            start_time,
            end_time
        };
    }
};
</script>
