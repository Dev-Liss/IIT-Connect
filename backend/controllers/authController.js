const registerUser = async (req, res) => {
  res.json({ message: "Register User" });
};

const loginUser = async (req, res) => {
  res.json({ message: "Login User" });
};

const getMe = async (req, res) => {
  res.json({ message: "User data display" });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
