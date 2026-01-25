"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const customer_model_1 = require("../modules/customer/customer.model");
const worker_model_1 = require("../modules/worker/worker.model");
const findUserByEmail = async (email) => {
    let user = await customer_model_1.CustomerModel.findOne({ email });
    if (user)
        return { user };
    user = await worker_model_1.WorkerModel.findOne({ email });
    if (user)
        return { user };
    return null;
};
exports.default = findUserByEmail;
