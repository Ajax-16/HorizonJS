import bcryptjs from "bcryptjs"

const encrypt = (plainTextPassword) => {
    const passwordHash = bcryptjs.hashSync(plainTextPassword, 8);
    return passwordHash;
};

const verified = (plainTextPassword, hashPassword) => {
    const isCorrect = bcryptjs.compareSync(plainTextPassword, hashPassword);
    return isCorrect;
};

export { encrypt, verified };
