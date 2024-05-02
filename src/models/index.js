
import doctorEntityModel from './doctorEntityModel.js';
import doctorModel from './doctorModel.js';
import departmentModel from './departmentModel.js';
import weeklyTimeSlotsModel from './weeklyTimeSlotsModel.js';
import bookingModel from './bookingModel.js';

const models = {
    doctorEntityModel,
    doctorModel,
    departmentModel,
    weeklyTimeSlotsModel,
    bookingModel,
};

const associateModels = async () => {
    await Promise.all(Object.values(models).map(async (model) => {
        if (model.associate) {
            await model.associate(models);
        }
    }));
};

export default associateModels;
