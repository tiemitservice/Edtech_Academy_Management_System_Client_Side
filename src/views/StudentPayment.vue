<template>
    <section class="px-4 mx-auto">
        <div class="card">
            <Tabs value="0">
                <TabList>
                    <Tab value="0">Student Payment</Tab>
                    <Tab value="1">Student Late Payment</Tab>
                    <Tab value="2">Student Next Payment</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <h2 class="text-lg font-medium text-gray-800 dark:text-white">Students Payment</h2>

                        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <IconField>
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="searchQuery" placeholder="Search by name" />
                            </IconField>
                            <div class="flex items-center gap-4">
                                <div class="w-64">
                                    <Dropdown :options="genders" show-clear option-value="value" v-model="selectGender" option-label="label" placeholder="Filter by gender" class="w-full" />
                                </div>
                                <div>
                                    <Dropdown :options="category" show-clear option-value="name" v-model="selectCategory" option-label="name" placeholder="Filter by category" class="w-full" />
                                </div>
                                <div class="w-64">
                                    <DatePicker selectionMode="range" show-button-bar v-model="selectDOB" filter show-clear option-value="_id" option-label="name" placeholder="Filter by date of birth" class="w-full" />
                                </div>
                                <div class="w-64">
                                    <DatePicker selectionMode="range" show-button-bar v-model="selectEntered" filter show-clear option-value="_id" option-label="name" placeholder="Filter by entered" class="w-full" />
                                </div>
                                <Button @click="openModal" label="Add new" />
                            </div>
                        </div>

                        <div class="flex flex-col">
                            <div class="overflow-x-auto">
                                <div class="py-2">
                                    <DataTable v-if="payment" :value="payment" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                                        <Column field="_id" header="ID" sortable style="min-width: 150px">
                                            <template #body="slotProps">
                                                <p class="font-medium">{{ slotProps.index + 1 }}</p>
                                                <!-- <p class="font-medium">{{ slotProps.data._id }}</p> -->
                                            </template>
                                        </Column>

                                        <Column field="student" header="Name" sortable style="min-width: 200px">
                                            <template #body="slotProps">
                                                <p>{{ formatName(slotProps.data.student) }}</p>
                                            </template>
                                        </Column>

                                        <Column field="amount" header="Amount" sortable style="min-width: 200px">
                                            <template #body="slotProps">
                                                <p>{{ slotProps.data.amount }} $</p>
                                            </template>
                                        </Column>
                                        <Column field="paid_date" header="Paid Date" sortable style="min-width: 200px">
                                            <template #body="slotProps">
                                                <p>{{ formatDate2(slotProps.data.paid_date) }}</p>
                                            </template>
                                        </Column>

                                        <Column field="next_due_date" header="Next Due Date" sortable style="min-width: 200px">
                                            <template #body="slotProps">
                                                <p>{{ formatDate2(slotProps.data.next_due_date) }}</p>
                                            </template>
                                        </Column>
                                        <Column header="Payment Status">
                                            <template #body="slotProps">
                                                <div class="flex items-center justify-center">
                                                    <div v-if="slotProps.data.late_days > 0" class="px-4 py-2 bg-yellow-500 text-white font-bold rounded-xl">Dou</div>
                                                    <div v-else class="px-4 py-2 bg-green-500 text-white font-bold rounded-xl">
                                                        {{ slotProps.data.payment_status }}
                                                    </div>
                                                </div>
                                            </template>
                                        </Column>

                                        <Column header="Actions" style="min-width: 150px">
                                            <template #body="slotProps">
                                                <div class="flex space-x-2">
                                                    <Button
                                                        icon="pi pi-bookmark-fill
"
                                                        @click="openModal(slotProps.data)"
                                                        severity="success"
                                                        rounded
                                                        aria-label="Info"
                                                    />
                                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                                    <Button @click="handleDelete(slotProps.data._id)" icon="pi pi-trash" severity="danger" rounded aria-label="Delete" />
                                                </div>
                                            </template>
                                        </Column>
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value="1">
                        <StudentLatePayment />
                    </TabPanel>
                    <TabPanel value="2">
                        <StudentNextPayment />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
        <Dialog v-model:visible="isOpen" class="!w-[300px]" header="Mark Payment" :modal="true">
            <StudentsMarkPayment @close="isOpen = false" :datatoedit="datatoedit" />
        </Dialog>
    </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { formatDate2 } from '@/composible/formatDate';
import moment from 'moment';
import StudentsMarkPayment from '@/form/StudentsMarkPayment.vue';
import StudentLatePayment from './StudentLatePayment.vue';
import StudentNextPayment from './StudentNextPayment.vue';
const today = moment().startOf('day'); // set to start of day to avoid time mismatch
const collection = ref('student_payments');
const { data: payment, fetchData: fetchPayment, updateData: updatePayment } = useFetch(collection.value);
const { data: students, fetchData: fetchStudent } = useFetch('students');

const formatName = (id) => {
    const student = students.value?.find((student) => student._id === id);
    return student ? student.eng_name : 'Unknown';
};
const isOpen = ref(false);
const datatoedit = ref(null);
const openModal = (data) => {
    if (data) {
        datatoedit.value = data;
    } else {
        datatoedit.value = null;
    }
    isOpen.value = true;
};
onMounted(async () => {
    await fetchPayment();
    await fetchStudent();
});
</script>

<style lang="scss" scoped></style>
