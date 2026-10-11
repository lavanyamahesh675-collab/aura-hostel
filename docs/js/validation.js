/**
 * AuraHostel ERP - Form Integrity & Client-Side Validation Engine (Exp 3)
 * Provides regex checks, instant visual focus management, and validation badges.
 */

const ValidationEngine = {
  /**
   * Reset validation states for form controls
   */
  resetFormState(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const inputs = form.querySelectorAll('.form-control-custom, .form-select-custom');
    inputs.forEach(input => {
      input.classList.remove('is-invalid', 'is-valid');
    });

    const alertContainer = document.getElementById('validationAlertContainer');
    if (alertContainer) {
      alertContainer.innerHTML = '';
      alertContainer.classList.add('d-none');
    }
  },

  /**
   * Highlight field with error state and focus directly (Exp 3 Focus Management)
   */
  setError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const alertContainer = document.getElementById('validationAlertContainer');

    if (field) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      // Direct focus management as per Exp 3 specs
      field.focus();
    }

    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-3" role="alert">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div><strong>Validation Error:</strong> ${message}</div>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
      alertContainer.classList.remove('d-none');
    }

    return false;
  },

  /**
   * Set valid state for field
   */
  setSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    }
  },

  /**
   * Validate Student Admission / Edit Form
   */
  validateStudentForm(formData) {
    this.resetFormState('admitStudentForm');

    // 1. Student Name: min 8 characters, text only (regex)
    const name = formData.get('name') ? formData.get('name').trim() : '';
    const nameRegex = /^[a-zA-Z\s]{8,}$/;
    if (!name) {
      return this.setError('studentName', 'Student Name is required.');
    }
    if (name.length < 8) {
      return this.setError('studentName', 'Student Name must be at least 8 characters long.');
    }
    if (!nameRegex.test(name)) {
      return this.setError('studentName', 'Student Name must contain alphabetic characters and spaces only.');
    }
    this.setSuccess('studentName');

    // 2. Email: valid format (regex)
    const email = formData.get('email') ? formData.get('email').trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return this.setError('studentEmail', 'Please enter a valid email address (e.g. student@domain.com).');
    }
    this.setSuccess('studentEmail');

    // 3. Contact No: strictly 10 digits (regex)
    const phone = formData.get('phone') ? formData.get('phone').trim() : '';
    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return this.setError('studentPhone', 'Contact Number must consist strictly of 10 numeric digits.');
    }
    this.setSuccess('studentPhone');

    // 4. Gender selection
    const gender = formData.get('gender');
    if (!gender) {
      return this.setError('studentGender', 'Please select a gender option.');
    }
    this.setSuccess('studentGender');

    // 5. Block selection
    const block = formData.get('block');
    if (!block) {
      return this.setError('studentBlock', 'Please select a hostel block.');
    }
    this.setSuccess('studentBlock');

    // 6. Room Number selection
    const roomNo = formData.get('roomNo');
    if (!roomNo) {
      return this.setError('studentRoomNo', 'Please select an available room number.');
    }
    this.setSuccess('studentRoomNo');

    // Optional Guardian Phone validation if provided
    const guardianPhone = formData.get('guardianPhone') ? formData.get('guardianPhone').trim() : '';
    if (guardianPhone && !phoneRegex.test(guardianPhone)) {
      return this.setError('studentGuardianPhone', 'Guardian Phone must be 10 numeric digits.');
    }

    return true;
  }
};

window.ValidationEngine = ValidationEngine;
