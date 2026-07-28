const mongoose = require('mongoose');

const cronJobLogSchema = new mongoose.Schema({
    job_name: {
        type: String,
        required: true
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date
    },
    processed_count: {
        type: Number,
        default: 0
    },
    failed_count: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['running', 'completed', 'failed'],
        default: 'running'
    },
    error_message: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('CronJobLog', cronJobLogSchema);
