import stateModel from '../models/stateModel.js';
import districtModel from '../models/districtModel.js';
// Function to add states and districts
const seedDatabase = async () => {
  try {
    // Create states
    const statesData = [
      { stateName: 'Kerala' },
      { stateName: 'Karnataka' },
      // Add more states as needed
    ];

    const states = await stateModel.bulkCreate(statesData, { returning: true });

    // Create districts
    const districtsData = [
      { districtName: 'Kasaragod', stateId: states[0].stateId },
      { districtName: 'Eranakulam', stateId: states[0].stateId },
      // Add more districts as needed
    ];

    await District.bulkCreate(districtsData);

    console.log('States and districts added successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Invoke the seedDatabase function
seedDatabase();
