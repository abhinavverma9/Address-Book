import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as contactService from '../../api/contactService';

// Async thunks
export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactService.getContacts();
      if (response.success) {
        return response.contacts;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch contacts');
    }
  }
);

export const createContact = createAsyncThunk(
  'contacts/create',
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await contactService.createContact(contactData);
      if (response.success) {
        // Since the API doesn't return the created object with ID, we might need to re-fetch
        // or the backend needs to return the created contact. 
        // For now, let's assume we re-fetch or the component handles it. 
        // Ideally, backend returns the new contact. 
        // Returning contactData for optimistic update or just a signal to re-fetch.
        return { ...contactData, id: Date.now() }; // Temporary ID until refresh
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create contact');
    }
  }
);

export const bulkCreateContacts = createAsyncThunk(
  'contacts/bulkCreate',
  async (contacts, { rejectWithValue }) => {
    try {
      const response = await contactService.bulkCreateContact(contacts);
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to bulk create contacts');
    }
  }
);

export const updateContact = createAsyncThunk(
  'contacts/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await contactService.updateContact(id, data);
      if (response.success) {
        return { id, ...data };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update contact');
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contacts/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contactService.deleteContact(id);
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete contact');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  operationSuccess: false, // For tracking create/update/delete success
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearContactError: (state) => {
      state.error = null;
    },
    resetOperationSuccess: (state) => {
      state.operationSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createContact.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(createContact.fulfilled, (state) => {
        state.loading = false;
        state.operationSuccess = true;
        // Ideally we append the new contact here, but since we don't get the full object (ID) from backend yet,
        // we typically re-fetch in the component or rely on 'operationSuccess' to trigger a re-fetch.
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bulk Create
      .addCase(bulkCreateContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(bulkCreateContacts.fulfilled, (state) => {
        state.loading = false;
        state.operationSuccess = true;
      })
      .addCase(bulkCreateContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateContact.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading = false;
        state.operationSuccess = true;
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(c => c.id !== action.payload);
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearContactError, resetOperationSuccess } = contactsSlice.actions;
export default contactsSlice.reducer;
