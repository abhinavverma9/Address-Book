import api from './axios';

export const getContacts = async () => {
    const response = await api.get('/routes/Contact.cfc?method=getContacts');
    return response.data;
};

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('method', 'uploadImage');
    formData.append('file', file);

    const response = await api.post('/routes/Upload.cfc', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const createContact = async (contactData) => {
    const params = new URLSearchParams();
    params.append('method', 'createContact');

    Object.keys(contactData).forEach(key => {
        if (contactData[key] !== null && contactData[key] !== undefined) {
             // Include image now
             params.append(key, contactData[key]);
        }
    });

    const response = await api.post('/routes/Contact.cfc', params);
    return response.data;
};

export const bulkCreateContact = async (contacts) => {
    const params = new URLSearchParams();
    params.append('method', 'bulkCreateContact');
    params.append('contacts', JSON.stringify(contacts));

    const response = await api.post('/routes/Contact.cfc', params);
    return response.data;
};

export const updateContact = async (id, contactData) => {
    const params = new URLSearchParams();
    params.append('method', 'updateContact');
    params.append('id', id);
    
    Object.keys(contactData).forEach(key => {
        if (contactData[key] !== null && contactData[key] !== undefined) {
             // Include image now
             params.append(key, contactData[key]);
        }
    });

    const response = await api.post('/routes/Contact.cfc', params); 
    return response.data;
};

export const deleteContact = async (id) => {
    const params = new URLSearchParams();
    params.append('method', 'deleteContact');
    params.append('id', id);
    
    const response = await api.post('/routes/Contact.cfc', params);
    return response.data;
};
