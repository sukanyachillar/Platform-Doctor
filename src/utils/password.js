import bcrypt from "bcrypt";
const saltRounds = parseInt(process.env.SALT_ROUNDS); 


export const hashPassword = async (plainPassword) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
  } catch (error) {
    console.log({error})
    throw error;
  }
};

export const comparePasswords = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.log({error});
    throw error; 
  }
};

