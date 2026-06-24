const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");

var monthlyReportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  month: { type: String, required: true },
  days: { type: Object, default: {} }, // lưu dữ liệu ngày theo key
  totals: { 
    DN: { type: Number, default: 0 },
    HKD: { type: Number, default: 0 },
    HRM: { type: Number, default: 0 },
    money: { type: Number, default: 0 }
  }
},
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.createdAt = moment(ret.createdAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');
                ret.updatedAt = moment(ret.updatedAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');
                return ret;
            }
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.createdAt = moment(ret.createdAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');
                ret.updatedAt = moment(ret.updatedAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');
                return ret;
            }
        }
    });

module.exports = mongoose.model("MonthlyReport", monthlyReportSchema);