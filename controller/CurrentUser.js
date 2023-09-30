const { CurrentUser } = require('../model/CurrentUser');

exports.saveCurrentUser = async (req, res) => {
  const user = new CurrentUser(req.body);
  try {
    const doc = await user.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchCurrentUser = async (req, res) => {
  try {
    const doc = await  CurrentUser.find({});
    console.log(doc);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.deleteCurrentUser = async (req, res) => {
    try {
      const doc = await CurrentUser.deleteMany({});
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json(err);
    }
  };
  