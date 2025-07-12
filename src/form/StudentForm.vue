<template>
    <form @submit.prevent="handleSubmit" class="w-full">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Student' : 'Add New Student' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4">
            <!-- Profile Image Section -->
            <div class="w-full flex items-center justify-center mb-8">
                <div class="flex flex-col items-center space-y-3">
                    <div v-if="previewUrl" class="size-32 overflow-hidden mx-auto rounded-full border-2 border-gray-300">
                        <img :src="previewUrl" alt="Profile Preview" class="object-cover w-full h-full" />
                    </div>
                    <div v-else class="size-32 overflow-hidden mx-auto rounded-full border-2 border-gray-300">
                        <img src="https://placehold.co/128" alt="Placeholder" class="object-cover w-full h-full" />
                    </div>
                    <input
                        type="file"
                        id="image"
                        @change="handleChange"
                        accept="image/*"
                        class="block w-full px-3 py-1.5 text-sm text-gray-600 dark:bg-gray-900 bg-white border border-gray-300 rounded-lg file:bg-gray-200 file:text-gray-900 file:text-sm file:px-4 file:py-1 file:border-none file:rounded-full dark:text-gray-300 placeholder-gray-400/70 dark:placeholder-gray-500 focus:lue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:focus:lue-300"
                    />
                </div>
            </div>

            <!-- Form Fields -->
            <div class="grid grid-cols-2 gap-6 p-5 items-start">
                <!-- Personal Information -->
                <div>
                    <h4 class="text-lg font-medium">Personal Information</h4>
                    <div class="rounded p-2 border grid grid-cols-3 gap-4">
                        <div class="flex flex-col space-y-1">
                            <label for="kh_name" class="text-sm font-medium">Khmer Name <span class="text-red-500">*</span></label>
                            <InputText :required="true" id="kh_name" type="text" placeholder="Khmer name" v-model="formState.kh_name" />
                            <small v-if="errors.kh_name" class="text-red-500 mt-1">{{ errors.kh_name }}</small>
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="eng_name" class="text-sm font-medium">English Name <span class="text-red-500">*</span></label>
                            <InputText :required="true" id="eng_name" type="text" placeholder="English name" v-model="formState.eng_name" />
                            <small v-if="errors.eng_name" class="text-red-500 mt-1">{{ errors.eng_name }}</small>
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="selectedGender" class="text-sm font-medium">Gender <span class="text-red-500">*</span></label>
                            <Select show-clear id="selectedGender" v-model="formState.gender" :options="genderOptions" optionLabel="name" optionValue="name" placeholder="Select a Gender" class="w-full" />
                            <small v-if="errors.gender" class="text-red-500 mt-1">{{ errors.gender }}</small>
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="date_of_birth" class="text-sm font-medium">Date of Birth <span class="text-red-500">*</span></label>
                            <Calendar id="date_of_birth" v-model="formState.date_of_birth" placeholder="Date of birth" showButtonBar dateFormat="yy-mm-dd" />
                            <small v-if="errors.date_of_birth" class="text-red-500 mt-1">{{ errors.date_of_birth }}</small>
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="categorySelected" class="text-sm font-medium">Student Category <span class="text-red-500">*</span></label>
                            <Dropdown id="categorySelected" v-model="formState.student_type" :options="category" optionLabel="name" optionValue="_id" placeholder="Select a category" showClear class="w-full" />
                            <small v-if="errors.student_type" class="text-red-500 mt-1">{{ errors.student_type }}</small>
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="email" class="text-sm font-medium">Email</label>
                            <InputText id="email" type="email" placeholder="Email" v-model="formState.email" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="phoneNumber" class="text-sm font-medium">Phone Number <span class="text-red-500">*</span></label>
                            <InputText id="phoneNumber" type="text" placeholder="Phone number" v-model="formState.phoneNumber" />
                            <small v-if="errors.phoneNumber" class="text-red-500 mt-1">{{ errors.phoneNumber }}</small>
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="date_entered" class="text-sm font-medium">Date Entered</label>
                            <Calendar id="date_entered" v-model="formState.date_intered" placeholder="Date entered" showButtonBar dateFormat="yy-mm-dd" />
                        </div>
                    </div>
                </div>
                <!-- Other sections... -->
                <div>
                    <h4 class="text-lg font-medium">Live Address</h4>
                    <div class="rounded p-2 border grid grid-cols-3 gap-4">
                        <div class="flex flex-col space-y-1">
                            <label for="selectedProvince" class="text-sm font-medium">Province</label>
                            <Dropdown filter id="selectedProvince" v-model="formState.province" :options="provinces" optionLabel="properties.NAME1" optionValue="properties.ADMIN_ID1" placeholder="Select Province" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="selectedDistrict" class="text-sm font-medium">District</label>
                            <Dropdown id="selectedDistrict" v-model="formState.district" :options="filteredDistricts" optionLabel="properties.NAME2" optionValue="properties.ADMIN_ID2" placeholder="Select District" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="selectedCommune" class="text-sm font-medium">Commune</label>
                            <Dropdown id="selectedCommune" v-model="formState.commune" :options="filteredCommunes" optionLabel="properties.NAME3" optionValue="properties.ADMIN_ID3" placeholder="Select Commune" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="selectedVillage" class="text-sm font-medium">Village</label>
                            <Dropdown v-model="formState.village" :options="formattedVillages" optionLabel="label" optionValue="value" placeholder="Select Village" showClear class="w-full" />
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="text-lg font-medium">Place of Birth</h4>
                    <div class="rounded p-2 border grid grid-cols-3 gap-4">
                        <div class="flex flex-col space-y-1">
                            <label for="plb_province" class="text-sm font-medium">Province</label>
                            <Dropdown filter id="plb_province" v-model="formState.st_birth_province" :options="provinces" optionLabel="properties.NAME1" optionValue="properties.ADMIN_ID1" placeholder="Select Province" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="plb_district" class="text-sm font-medium">District</label>
                            <Dropdown
                                id="plb_district"
                                v-model="formState.st_birth_district"
                                :options="filteredDistrictsForBirth"
                                optionLabel="properties.NAME2"
                                optionValue="properties.ADMIN_ID2"
                                placeholder="Select District"
                                showClear
                                class="w-full"
                            />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="plb_commune" class="text-sm font-medium">Commune</label>
                            <Dropdown id="plb_commune" v-model="formState.st_birth_commune" :options="filteredCommunesForBirth" optionLabel="properties.NAME3" optionValue="properties.ADMIN_ID3" placeholder="Select Commune" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="plb_village" class="text-sm font-medium">Village</label>
                            <Dropdown v-model="formState.st_birth_village" :options="formattedVillagesForBirth" optionLabel="label" optionValue="value" placeholder="Select Village" showClear class="w-full" />
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="text-lg font-medium pb-2">Family Information</h4>
                    <div class="rounded p-2 border grid grid-cols-3 gap-4">
                        <div class="flex flex-col space-y-1">
                            <label for="father_name" class="text-sm font-medium">Father's Name</label>
                            <InputText id="father_name" type="text" placeholder="Father's name" v-model="formState.father_name" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="mother_name" class="text-sm font-medium">Mother's Name</label>
                            <InputText id="mother_name" type="text" placeholder="Mother's name" v-model="formState.mother_name" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="father_phone" class="text-sm font-medium">Father's Phone</label>
                            <InputText id="father_phone" type="text" placeholder="Father's phone" v-model="formState.father_phone" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="mother_phone" class="text-sm font-medium">Mother's Phone</label>
                            <InputText id="mother_phone" type="text" placeholder="Mother's phone" v-model="formState.mother_phone" />
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="text-lg font-medium pb-2">Document Information</h4>
                    <div class="rounded p-2 border grid grid-cols-2 gap-4">
                        <div class="flex flex-col space-y-1">
                            <label for="document_type" class="text-sm font-medium">Document Type</label>
                            <Dropdown id="document_type" v-model="formState.document_type" :options="documentTypeOptions" optionLabel="label" optionValue="value" placeholder="Select document type" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="documentNumber" class="text-sm font-medium">Document Number</label>
                            <InputText id="documentNumber" type="text" placeholder="Document number" v-model="formState.document_number" />
                        </div>
                        <div class="col-span-2">
                            <div class="flex flex-col items-center space-y-3">
                                <div v-if="document_image_preview" class="w-full h-[200px] overflow-hidden mx-auto rounded-xl border-2 border-gray-300">
                                    <img :src="document_image_preview" alt="Document Preview" class="object-contain w-full h-full" />
                                </div>
                                <div v-else class="w-full h-[200px] overflow-hidden mx-auto rounded-xl border-2 border-gray-300 flex items-center justify-center">
                                    <img src="https://placehold.co/400x200?text=Document" alt="Placeholder" class="object-cover w-full h-full" />
                                </div>
                                <input
                                    type="file"
                                    id="document_image"
                                    @change="handleDocumentChange"
                                    accept="image/*"
                                    class="block w-full text-sm text-gray-600 file:rounded-full file:border-none file:px-4 file:py-1 file:bg-gray-200 file:text-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Status Toggle -->
                <div class="col-span-2">
                    <h4 class="text-lg font-medium pb-2">Status</h4>
                    <div class="rounded p-4 border flex items-center gap-4">
                        <label for="status" class="text-sm font-medium">Active</label>
                        <ToggleSwitch v-model="formState.status" inputId="status" />
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="w-full flex items-center justify-end mt-8 space-x-2">
                <Button @click="$emit('close')" label="Cancel" severity="danger" outlined />
                <Button :label="isSubmitting ? 'Saving...' : 'Save'" :disabled="isSubmitting" type="submit" />
            </div>
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, watch, computed, reactive, nextTick } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { useToast } from 'primevue/usetoast';
import provinceJson from '@/json/province.json';
import districtJson from '@/json/district.json';
import communeJson from '@/json/commune.json';
import villageJson from '@/json/village.json';
import moment from 'moment';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => null
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Composables ---
const { data: category, fetchData: fetchCategory } = useFetch('student_categories');
const { postData, updateData, loading: isSubmitting } = useFetch('students');
const toast = useToast();

// --- Reactive Form State ---
const formState = reactive({
    kh_name: '',
    eng_name: '',
    gender: null,
    date_of_birth: null,
    student_type: null,
    email: '',
    phoneNumber: '',
    date_intered: new Date(),
    province: null,
    district: null,
    commune: null,
    village: null,
    st_birth_province: null,
    st_birth_district: null,
    st_birth_commune: null,
    st_birth_village: null,
    father_name: '',
    mother_name: '',
    father_phone: '',
    mother_phone: '',
    document_type: null,
    document_number: '',
    status: true
});

const errors = ref({});
const image = ref(null);
const previewUrl = ref(null);
const document_image = ref(null);
const document_image_preview = ref(null);

// --- Static Data ---
const genderOptions = ref([{ name: 'Male' }, { name: 'Female' }, { name: 'Others' }]);
const documentTypeOptions = ref([
    { label: 'National ID', value: 'national_id' },
    { label: 'Passport', value: 'passport' },
    { label: 'Birth Certificate', value: 'birth_certificate' }
]);
const provinces = ref(provinceJson);
const districts = ref(districtJson);
const communes = ref(communeJson);
const villages = ref(villageJson);

// --- Image Handling ---
const handleChange = (e) => {
    image.value = e.target.files[0];
    previewUrl.value = image.value ? URL.createObjectURL(image.value) : null;
};
const handleDocumentChange = (e) => {
    document_image.value = e.target.files[0];
    document_image_preview.value = document_image.value ? URL.createObjectURL(document_image.value) : null;
};

// --- Address Logic ---
const filteredDistricts = computed(() => districts.value.filter((d) => d.properties.ADMIN_ID1 === formState.province));
const filteredCommunes = computed(() => communes.value.filter((c) => c.properties.ADMIN_ID2 === formState.district));
const filteredVillages = computed(() => villages.value.filter((v) => v.properties.ADMIN_ID3 === formState.commune));
const formattedVillages = computed(() => filteredVillages.value.map((v) => ({ label: `${v.properties.NAME} (${v.properties.NAME_ENG})`, value: v.properties.ADMIN_ID })));

const filteredDistrictsForBirth = computed(() => districts.value.filter((d) => d.properties.ADMIN_ID1 === formState.st_birth_province));
const filteredCommunesForBirth = computed(() => communes.value.filter((c) => c.properties.ADMIN_ID2 === formState.st_birth_district));
const filteredVillagesForBirth = computed(() => villages.value.filter((v) => v.properties.ADMIN_ID3 === formState.st_birth_commune));
const formattedVillagesForBirth = computed(() => filteredVillagesForBirth.value.map((v) => ({ label: `${v.properties.NAME} (${v.properties.NAME_ENG})`, value: v.properties.ADMIN_ID })));

watch(
    () => formState.province,
    () => {
        formState.district = null;
        formState.commune = null;
        formState.village = null;
    }
);
watch(
    () => formState.district,
    () => {
        formState.commune = null;
        formState.village = null;
    }
);
watch(
    () => formState.commune,
    () => {
        formState.village = null;
    }
);
watch(
    () => formState.st_birth_province,
    () => {
        formState.st_birth_district = null;
        formState.st_birth_commune = null;
        formState.st_birth_village = null;
    }
);
watch(
    () => formState.st_birth_district,
    () => {
        formState.st_birth_commune = null;
        formState.st_birth_village = null;
    }
);
watch(
    () => formState.st_birth_commune,
    () => {
        formState.st_birth_village = null;
    }
);

// --- Form Validation and Submission ---
const validateForm = () => {
    errors.value = {};
    if (!formState.kh_name) errors.value.kh_name = 'Khmer name is required.';
    if (!formState.eng_name) errors.value.eng_name = 'English name is required.';
    if (!formState.gender) errors.value.gender = 'Gender is required.';
    if (!formState.date_of_birth) errors.value.date_of_birth = 'Date of birth is required.';
    if (!formState.student_type) errors.value.student_type = 'Student category is required.';
    if (!formState.phoneNumber) errors.value.phoneNumber = 'Phone number is required.';
    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields.', life: 3000 });
        return;
    }

    const formData = new FormData();
    for (const key in formState) {
        if (formState[key] !== null && formState[key] !== undefined) {
            if (key === 'date_of_birth' || key === 'date_intered') {
                formData.append(key, moment(formState[key]).format('YYYY-MM-DD'));
            } else {
                formData.append(key, formState[key]);
            }
        }
    }
    if (image.value) formData.append('image', image.value);
    if (document_image.value) formData.append('document_image', document_image.value);

    try {
        if (props.datatoedit) {
            await updateData(formData, props.datatoedit._id);
            emit('toast', 'update');
        } else {
            await postData(formData);
            emit('toast', 'create');
        }
        emit('save');
        emit('close');
    } catch (error) {
        console.error('Error submitting form:', error);
        toast.add({ severity: 'error', summary: 'Submission Error', detail: 'Failed to save student data.', life: 3000 });
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await fetchCategory({ status: 'true' });
    if (props.datatoedit) {
        // Populate formState with data from datatoedit prop
        for (const key in formState) {
            if (props.datatoedit[key] !== undefined) {
                if (key === 'date_of_birth' || key === 'date_intered') {
                    formState[key] = props.datatoedit[key] ? moment(props.datatoedit[key]).toDate() : null;
                } else {
                    formState[key] = props.datatoedit[key];
                }
            }
        }
        previewUrl.value = props.datatoedit.image;
        document_image_preview.value = props.datatoedit.document_image;
    }
});
</script>
