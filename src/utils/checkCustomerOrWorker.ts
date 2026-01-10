import { CustomerModel } from "../modules/customer/customer.model";
import { WorkerModel } from "../modules/worker/worker.model";

const findUserByEmail = async (email: string) => {
  let user = await CustomerModel.findOne({ email });
  if (user) return { user };

  user = await WorkerModel.findOne({ email });
  if (user) return { user };

  return null;
};
export default findUserByEmail;
