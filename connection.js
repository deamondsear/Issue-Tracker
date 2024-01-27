const mongoose = require('mongoose');

const connection = async () => {
    await mongoose
        .connect(process.env['MONGO_URI'])
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => {
            if (err) {
                console.log('Failed to connect MongoDB');
            }
        });
};

module.exports = connection;
