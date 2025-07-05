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
