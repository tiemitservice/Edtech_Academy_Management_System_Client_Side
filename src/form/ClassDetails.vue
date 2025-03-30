<template>
    <div class="p-6">
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 border-b pb-4">
            <div class="mb-4 md:mb-0">
                <h2 class="text-2xl font-bold text-gray-800">
                    {{ datatoedit?.name }}
                </h2>
                <div class="flex items-center mt-2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ formatTime(datatoedit?.section.start_time) }} - {{ formatTime(datatoedit?.section.end_time) }}</span>
                </div>
            </div>

            <div class="flex items-center bg-gray-50 rounded-lg p-3">
                <Avatar :image="datatoedit?.staff.image" class="mr-3" size="xlarge" shape="circle" />
                <div>
                    <p class="text-sm text-gray-500">Teaching by</p>
                    <p class="font-semibold text-gray-800">{{ datatoedit?.staff.en_name }}</p>
                </div>
            </div>
        </div>

        <!-- Students Count Summary -->
        <div class="mb-4 flex items-center">
            <div class="bg-blue-50 text-blue-700 rounded-full px-4 py-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span class="font-medium">{{ datatoedit?.students?.length || 0 }} Students</span>
            </div>
        </div>

        <!-- DataTable Section -->
        <div class="overflow-hidden rounded-lg border border-gray-200">
            <DataTable :value="datatoedit?.students" tableStyle="min-width: 50rem" class="p-datatable-sm" stripedRows responsiveLayout="scroll">
                <Column field="kh_name" header="Khmer Name">
                    <template #body="slotProps">
                        <p class="font-medium">{{ slotProps.data.kh_name }}</p>
                    </template>
                </Column>

                <Column field="eng_name" header="English Name">
                    <template #body="slotProps">
                        <p class="font-medium">{{ slotProps.data.eng_name }}</p>
                    </template>
                </Column>

                <Column field="gender" header="Gender">
                    <template #body="slotProps">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="slotProps.data.gender.toLowerCase() === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'">
                            {{ slotProps.data.gender }}
                        </span>
                    </template>
                </Column>

                <Column field="date_of_birth" header="Age">
                    <template #body="slotProps">
                        <div class="flex items-center">
                            <span class="font-medium">{{ calculateAge(slotProps.data.date_of_birth) }}</span>
                            <span class="text-gray-500 ml-1">years</span>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const currentDate = ref(new Date());

        // Function to calculate age
        const calculateAge = (dateOfBirth) => {
            if (!dateOfBirth) return 'N/A';

            const dob = new Date(dateOfBirth);
            const today = new Date();

            let age = today.getFullYear() - dob.getFullYear();
            const monthDifference = today.getMonth() - dob.getMonth();

            // Adjust age if the birthday hasn't occurred this year yet
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            return age;
        };

        // Format time for better display
        const formatTime = (timeString) => {
            if (!timeString) return '';

            // If timeString is already in a good format, just return it
            // Otherwise, you could implement formatting logic here
            return timeString;
        };

        onMounted(() => {
            if (props.datatoedit) {
                console.log(props.datatoedit);
            }
        });

        return {
            currentDate,
            calculateAge,
            formatTime
        };
    }
};
</script>

<style lang="scss" scoped>
:deep(.p-datatable-wrapper) {
    border-radius: 0.5rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #f9fafb;
    color: #374151;
    font-weight: 600;
    padding: 0.75rem 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #f3f4f6;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem 1rem;
    border-color: #e5e7eb;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
    background-color: #f9fafb;
}
</style>
