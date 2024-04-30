
import doctorEntityModel from './doctorEntityModel.js';
import doctorModel from './doctorModel.js';
import departmentModel from './departmentModel.js';

const models = {
    doctorEntityModel,
    doctorModel,
    departmentModel,
};

const associateModels = async () => {
    await Promise.all(Object.values(models).map(async (model) => {
        if (model.associate) {
            await model.associate(models);
        }
    }));
};

export default associateModels;
