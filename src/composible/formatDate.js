import moment from 'moment';

export const formatDate = (timestamp) => {
    return moment(timestamp).format('DD-MMM-YYYY HH:mm:ss A');
};

export const formatTime = (timestamp) => {
    return moment(timestamp).format('HH:mm:ss A');
};

export const formatDate2 = (timestamp) => {
    return moment(timestamp).format('DD-MM-YYYY');
};

// formate year only

export const formatYear = (timestamp) => {
    return moment(timestamp).format('YYYY');
};
export function formatDateParts(dateStr) {
    if (!dateStr || !moment(dateStr).isValid()) {
        return { day: '--', month: '--', year: '----' };
    }

    const day = moment(dateStr).format('DD');
    const month = moment(dateStr).format('MM');
    const year = moment(dateStr).format('YYYY');

    return { day, month, year };
}

// formate age

export const calculateAge = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
