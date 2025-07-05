<template>
    <div>
        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Users List</label>
            <div class="flex items-center gap-4 justify-end">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText placeholder="Search by name" v-model="filters.search" />
                </IconField>
                <div class="flex items-center gap-4">
                    <!-- <Dropdown placeholder="Select a role" class="dropdown" /> -->
                    <Button v-if="user?.role === 'admin' || user?.role === 'superadmin'" @click="handleAdd" label="Add new" />
                </div>
            </div>
        </div>
        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2">
                    <DataTable v-if="users" :value="users" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                        <Column field="_id" header="ID" sortable style="width: 70px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.index + 1 }}</p>
                                <!-- <p class="font-medium">{{ slotProps.data._id }}</p> -->
                            </template>
                        </Column>
                        <Column field="image" header="Profile" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex items-center space-x-3">
                                    <div class="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                        <img :src="slotProps.data.image || 'https://placehold.co/40'" :alt="slotProps.data.name" class="object-cover w-full h-full" />
                                    </div>
                                </div>
                            </template>
                        </Column>
                        <Column field="name" header="Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.name }}</p>
                            </template>
                        </Column>

                        <Column field="role" header="Role" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.role || 'N/A' }}</p>
                            </template>
                        </Column>
                        <Column field="email" header="Email" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.email || 'N/A' }}</p>
                            </template>
                        </Column>
                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button v-if="user?.role === 'admin' || user?.role === 'superadmin'" icon="pi pi-info-circle" @click="openStaffModal(slotProps.data)" severity="success" rounded aria-label="Info" />
                                    <Button v-if="user?.role === 'admin' || user?.role === 'superadmin'" icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    <Button @click="handleDelete(slotProps.data._id)" icon="pi pi-trash" severity="danger" rounded aria-label="Delete" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>
        <Dialog v-model:visible="isOpen" class="w-full md:w-1/2" header="Add User" :modal="true">
            <component :is="currentComponent" @close="handleClose" :datatoedit="datatoedit" />
        </Dialog>
    </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import useAuth from '@/composible/useAuth';
import { useFetch } from '@/composible/useFetch';
import socket from '@/composible/socket';
import UsersForm from '@/form/UsersForm.vue';
export default {
    components: {
        UsersForm
    },
    setup() {
        const { user } = useAuth();
        const currentComponent = ref(null);
        const { data: users, fetchData: fetchUsers, deleteData } = useFetch('users');
        const filters = ref({
            status: 'true',
            limit: 10,
            page: 1,
            search: '',
            searchColumn: ['name']
        });
        const isOpen = ref(false);
        const handleAdd = () => {
            isOpen.value = true;
            currentComponent.value = UsersForm;
        };
        const datatoedit = ref(null);

        const handleEdit = (data) => {
            isOpen.value = true;
            datatoedit.value = data;
            currentComponent.value = UsersForm;
        };

        const handleClose = () => {
            isOpen.value = false;
        };
        const handleDatabaseUpdate = async () => {
            await fetchUsers(filters.value);
        };
        watch(
            () => filters.value.search,
            async (newSearch) => {
                await fetchUsers(filters.value);
            }
        );
        const handleDelete = async (id) => {
            try {
                await deleteData(id);
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        };
        onMounted(async () => {
            socket.on('database_realTime', handleDatabaseUpdate);
            await fetchUsers(filters.value);
        });
        return {
            users,
            isOpen,
            handleAdd,
            handleClose,
            currentComponent,
            handleDelete,
            filters,
            handleEdit,
            datatoedit,
            user
        };
    }
};
</script>

<style lang="scss" scoped></style>
