import React from 'react';

const BookingDetails = ({ bookingDetails, setBookingDetails, onSubmit, onCancel }) => {
    return (
        <div className={styles.bookingForm}>
            <h3>Booking Details</h3>
            <div className={styles.formGroup}>
                <label>Date:</label>
                <input
                    type="date"
                    value={bookingDetails.date}
                    onChange={(e) => setBookingDetails({
                        ...bookingDetails,
                        date: e.target.value
                    })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Time:</label>
                <input
                    type="time"
                    value={bookingDetails.time}
                    onChange={(e) => setBookingDetails({
                        ...bookingDetails,
                        time: e.target.value
                    })}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Address:</label>
                <textarea
                    value={bookingDetails.address}
                    onChange={(e) => setBookingDetails({
                        ...bookingDetails,
                        address: e.target.value
                    })}
                    required
                    placeholder="Enter your full address"
                />
            </div>

            <div className={styles.formGroup}>
                <label>Additional Notes:</label>
                <textarea
                    value={bookingDetails.notes}
                    onChange={(e) => setBookingDetails({
                        ...bookingDetails,
                        notes: e.target.value
                    })}
                    placeholder="Any special instructions or requirements"
                />
            </div>

            <div className={styles.buttonGroup}>
                <button 
                    className={styles.submitButton}
                    onClick={onSubmit}
                >
                    Confirm Booking
                </button>
                <button 
                    className={styles.cancelButton}
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default BookingDetails;
