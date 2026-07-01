const mongoose = require("mongoose");
const moment = require("moment-timezone");

const onlineRegistrationSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoQuanBHXH",
      required: true,
    },

    supportOnline: {
      type: Boolean,
      default: false,
    },

    registerUrl: {
      type: String,
      default: "",
      trim: true,
    },

    guide: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },

    status: {
      type: Boolean,
      default: true,
    },

    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.createdAt = moment(ret.createdAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");

        ret.updatedAt = moment(ret.updatedAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");

        return ret;
      },
    },
  },
);

module.exports = mongoose.model("OnlineRegistration", onlineRegistrationSchema);
