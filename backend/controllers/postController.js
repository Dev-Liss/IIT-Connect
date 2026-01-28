const getPosts = async (req, res) => {
  res.json({ message: "Get posts" });
};

const createPost = async (req, res) => {
  res.json({ message: "Create post" });
};

const updatePost = async (req, res) => {
  res.json({ message: `Update post ${req.params.id}` });
};

const deletePost = async (req, res) => {
  res.json({ message: `Delete post ${req.params.id}` });
};

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
};
