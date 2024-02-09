// import { DataTypes }from 'sequelize';

// class DynamicColumnManager {
//   constructor(model) {
//     this.model = model;
//   }

//   async addColumn(columnName, dataType, options = {}) {
//     try {
//       await this.model.sync();
//       await this.model.addColumn(columnName, {
//         type: dataType,
//         ...options,
//       });
//       console.log(`Added column "${columnName}" to ${this.model.name} successfully.`);
//     } catch (error) {
//       console.error(`Error adding column "${columnName}" to ${this.model.name}:`, error);
//     }
//   }

//   async removeColumn(columnName) {
//     try {
//       await this.model.sync();
//       await this.model.removeColumn(columnName);
//       console.log(`Removed column "${columnName}" from ${this.model.name} successfully.`);
//     } catch (error) {
//       console.error(`Error removing column "${columnName}" from ${this.model.name}:`, error);
//     }
//   }
// }

// // Example usage:
// // Replace 'YourModel' with your actual Sequelize model class.
// const YourModel = require('./models/YourModel'); // Adjust the path accordingly

// const dynamicColumnManager = new DynamicColumnManager(YourModel);

// // Example: Add a new column
// dynamicColumnManager.addColumn('newColumn', DataTypes.STRING, { allowNull: true });

// // Example: Remove an existing column
// dynamicColumnManager.removeColumn('oldColumn');
