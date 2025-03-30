<template>
    <form @submit.prevent="handleSubmit">
        <div class="w-full">
            <div class="flex items-center justify-between">
                <h3>Add new</h3>
                <div>
                    <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
                </div>
            </div>
            <div class="w-full flex items-center justify-center relative">
                <div class="flex flex-col space-y-3">
                    <div v-if="previewUrl" class="mt-2 size-32 overflow-hidden mx-auto rounded-full border-2">
                        <img :src="previewUrl" alt="Preview" class="overflow-hidden" />
                    </div>
                    <div v-else class="mt-2 size-32 overflow-hidden mx-auto rounded-full border-2">
                        <img src="https://placehold.co/128" alt="Preview" class="overflow-hidden" />
                    </div>
                    <div>
                        <input
                            type="file"
                            id="image"
                            @change="handleChange"
                            class="block w-full px-3 py-1.5 text-sm text-gray-600 dark:bg-gray-900 bg-white border border-gray-300 rounded-lg file:bg-gray-200 file:text-gray-900 file:text-sm file:px-4 file:py-1 file:border-none file:rounded-full dark:text-gray-300 placeholder-gray-400/70 dark:placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300"
                        />
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4 mt-8">
                <div class="flex flex-col space-y-1">
                    <label for="kh_name">Khmer Name</label>
                    <InputText id="kh_name" type="text" placeholder="Khmer name" v-model="kh_name" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="eng_name">English Name</label>
                    <InputText id="eng_name" type="text" placeholder="English name" v-model="eng_name" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="selectedGender">Gender</label>
                    <Select id="selectedGender" v-model="selectedGender" :options="gender" optionLabel="name" optionValue="name" placeholder="Select a Gender" class="w-full md:w-56" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="date_of_birth">Date of Birth</label>
                    <DatePicker id="date_of_birth" v-model="date_of_birth" placeholder="Date of birth" showButtonBar />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="selectedCity">City</label>
                    <Select id="selectedCity" v-model="selectedCity" :options="City" optionLabel="name" optionValue="name" placeholder="Select a City" class="w-full md:w-56" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="selectedProvince">Province</label>
                    <Select id="selectedProvince" v-model="selectedProvince" :options="Province" optionLabel="name" optionValue="name" placeholder="Select a Province" class="w-full md:w-56" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="selectedDistrict">District</label>
                    <!-- Fixed typo "Districe" -->
                    <Select id="selectedDistrict" v-model="selectedDistrict" :options="District" optionLabel="name" optionValue="name" placeholder="Select a District" class="w-full md:w-56" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="selectedCommune">Commune</label>
                    <Select id="selectedCommune" v-model="selectedCommune" :options="Commune" optionLabel="name" optionValue="name" placeholder="Select a Commune" class="w-full md:w-56" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="selectedVillage">Village</label>
                    <Select id="selectedVillage" v-model="selectedVillage" :options="Village" optionLabel="name" optionValue="name" placeholder="Select a Village" class="w-full md:w-56" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="phoneNumber">Phone Number</label>
                    <!-- Updated from "Phone" -->
                    <InputText id="phoneNumber" type="text" placeholder="Phone number" v-model="phoneNumber" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="email">Email</label>
                    <InputText id="email" type="email" placeholder="Email" v-model="email" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="selectedPosition">Position</label>
                    <!-- Fixed typo "posistion" -->
                    <Select id="selectedPosition" filter show-clear v-model="selectedPosition" :options="position.data" optionLabel="name" optionValue="_id" placeholder="Select a Position" class="w-full md:w-56" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="selectedDepartment">Department</label>
                    <Select id="selectedDepartment" v-model="selectedDepartment" :options="department.data" filter show-clear optionLabel="name" optionValue="_id" placeholder="Select a Department" class="w-full md:w-56" />
                </div>
                <!-- Added missing fields -->
                <!-- <div class="flex flex-col space-y-1">
                    <label for="role">Role</label>
                    <InputText id="role" type="text" placeholder="Role (e.g., admin)" v-model="role" />
                </div> -->
                <!-- <div class="flex flex-col space-y-1">
                    <label for="status">Status</label>
                    <Select
                        id="status"
                        v-model="status"
                        :options="[
                            { name: 'Active', value: true },
                            { name: 'Inactive', value: false }
                        ]"
                        optionLabel="name"
                        optionValue="value"
                        placeholder="Select Status"
                        class="w-full md:w-56"
                    />
                </div> -->

                <div class="flex flex-col space-y-1">
                    <label for="salary">Salary</label>
                    <InputText id="salary" type="number" placeholder="Salary" v-model="salary" />
                </div>
                <div class="flex flex-col space-y-1">
                    <label for="date_entered">Date Entered</label>
                    <DatePicker id="date_entered" v-model="date_entered" placeholder="Date entered" showButtonBar />
                </div>
            </div>
            <div class="w-full flex items-center justify-end mt-8">
                <Button label="Save" type="submit" class="mr-2" />
                <Button @click="$emit('close')" label="Cancel" severity="danger" />
            </div>
        </div>
    </form>
</template>
<script>
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';

export default {
    props: ['datatoedit'],
    setup(prop, { emit }) {
        const { data: position, fetchData: fetchPositions } = useFetch('positions');
        const { data: department, fetchData: fetchDepartment } = useFetch('departments');

        const filtersDepartment = ref({
            page: 1,
            limit: 50,
            search: '',
            searchColumn: ['', '']
        });

        const filtersPosistion = ref({
            page: 1,
            limit: 50,
            search: '',
            searchColumn: ['', '']
        });

        const gender = ref([{ name: 'Male' }, { name: 'Female' }, { name: 'Others' }]);

        const Province = ref([
            { name: 'Phnom Penh' },
            { name: 'Kampong Cham' },
            { name: 'Battambang' },
            { name: 'Siem Reap' },
            { name: 'Kandal' },
            { name: 'Prey Veng' },
            { name: 'Takeo' },
            { name: 'Svay Rieng' },
            { name: 'Banteay Meanchey' },
            { name: 'Pursat' }
        ]);
        const District = ref([
            { name: 'Chamkar Leu' },
            { name: 'Battambang' },
            { name: 'Angkor Chum' },
            { name: 'Kandal Stung' },
            { name: 'Prey Veng' },
            { name: 'Doun Kaev' },
            { name: 'Svay Chrom' },
            { name: 'Thma Koul' },
            { name: 'Krakor' },
            { name: 'Chbar Mon' }
        ]);
        const Commune = ref([
            { name: 'Svay Chuk' },
            { name: 'Ta Saom' },
            { name: 'Leang Dai' },
            { name: 'Prek Thmei' },
            { name: 'Prey Kandieng' },
            { name: 'Angk Ta Sou' },
            { name: 'Svay Yea' },
            { name: 'Kouk Ballangk' },
            { name: 'Phteah Prey' },
            { name: 'Damnak Reang' }
        ]);
        const Village = ref([
            { name: 'Phum Svay' },
            { name: 'Phum Thmei' },
            { name: 'Phum Kdei' },
            { name: 'Phum Prek' },
            { name: 'Phum Trapeang' },
            { name: 'Phum Angk' },
            { name: 'Phum Chrey' },
            { name: 'Phum Kouk' },
            { name: 'Phum Phteah' },
            { name: 'Phum Damnak' }
        ]);
        const City = ref([
            { name: 'Phnom Penh' },
            { name: 'Kampong Cham' },
            { name: 'Battambang' },
            { name: 'Siem Reap' },
            { name: 'Ta Khmau' },
            { name: 'Prey Veng' },
            { name: 'Takeo' },
            { name: 'Svay Rieng' },
            { name: 'Sisophon' },
            { name: 'Pursat' }
        ]);

        // Form fields
        const kh_name = ref(null);
        const eng_name = ref(null);
        const date_of_birth = ref(null);
        const selectedGender = ref(null); // Renamed from "genders" to match JSON
        const selectedPosition = ref(null); // Renamed from "posistions" and fixed typo
        const selectedCity = ref(null);
        const selectedProvince = ref(null);
        const selectedDistrict = ref(null); // Fixed typo from "selectedDistrice"
        const selectedCommune = ref(null);
        const selectedVillage = ref(null);
        const phoneNumber = ref(null); // Aligned with JSON
        const email = ref(null);
        const selectedDepartment = ref(null); // Renamed from "departments" for consistency
        const role = ref(null); // Added from JSON
        const status = ref(true); // Added from JSON, default to true
        const salary = ref(null); // Added from JSON
        const date_entered = ref(null); // Added from JSON, corrected "date_intered"

        const collection = ref('staffs');
        const { postData, data, loading, error, updateData } = useFetch(collection.value);
        const previewUrl = ref(null);
        const image = ref(null); // Your Vue component script
        const handleChange = (e) => {
            image.value = e.target.files[0]; // Store the File object
            previewUrl.value = URL.createObjectURL(image.value); // For local preview
        };

        const handleSubmit = async () => {
            try {
                const req = {
                    kh_name: kh_name.value,
                    en_name: eng_name.value,
                    date_of_birth: date_of_birth.value,
                    gender: selectedGender.value,
                    position: selectedPosition.value, // Fixed typo "posistion"
                    address: `${selectedVillage.value}, ${selectedCommune.value}, ${selectedDistrict.value}, ${selectedProvince.value}, ${selectedCity.value}`,
                    phoneNumber: phoneNumber.value,
                    email: email.value,
                    department: selectedDepartment.value,
                    role: 'user',
                    // defaulted to true
                    status: true,
                    image: image.value, // Send the File object
                    salary: salary.value,
                    date_entered: date_entered.value,
                    city: selectedCity.value,
                    province: selectedProvince.value,
                    district: selectedDistrict.value,
                    commune: selectedCommune.value,
                    village: selectedVillage.value
                };

                if (prop.datatoedit) {
                    const res = await updateData(req, prop.datatoedit._id);
                    console.log('data updated', res);
                    emit('close');
                } else {
                    const res = await postData(req);
                    console.log('data posted', res);

                    emit('close');
                }
            } catch (error) {
                console.log('error', error);
            }
        };

        onMounted(async () => {
            await fetchPositions(filtersPosistion.value);
            await fetchDepartment(filtersDepartment.value);
            if (prop.datatoedit) {
                console.log('datatoedit', prop.datatoedit);
                kh_name.value = prop.datatoedit.kh_name;
                eng_name.value = prop.datatoedit.en_name;
                date_of_birth.value = prop.datatoedit.date_of_birth;
                selectedGender.value = prop.datatoedit.gender;
                selectedPosition.value = prop.datatoedit.posistion;
                phoneNumber.value = prop.datatoedit.phoneNumber;
                email.value = prop.datatoedit.email;
                selectedDepartment.value = prop.datatoedit.department;
                role.value = prop.datatoedit.role;
                status.value = prop.datatoedit.status;
                salary.value = prop.datatoedit.salary;
                date_entered.value = prop.datatoedit.date_intered;
                selectedCity.value = prop.datatoedit.city;
                selectedProvince.value = prop.datatoedit.province;
                selectedDistrict.value = prop.datatoedit.district;
                selectedCommune.value = prop.datatoedit.commune;
                selectedVillage.value = prop.datatoedit.village;
                previewUrl.value = prop.datatoedit.image;
                image.value = prop.datatoedit.image;
            }
        });
        return {
            position, // Updated from "posistion"
            gender,
            department,
            kh_name,
            eng_name,
            date_of_birth,
            selectedGender, // Updated from "genders"
            selectedPosition, // Updated from "posistions"
            selectedCity,
            selectedProvince,
            selectedDistrict, // Updated from "selectedDistrice"
            selectedCommune,
            selectedVillage,
            phoneNumber, // Updated from "phone"
            email,
            selectedDepartment, // Updated from "departments"
            role,
            status,
            salary,
            date_entered,
            handleSubmit,
            City,
            Province,
            District,
            Commune,
            Village,
            handleChange,
            previewUrl
        };
    }
};
</script>

<style lang="scss" scoped></style>
