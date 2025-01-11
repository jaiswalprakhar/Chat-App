exports.get404 = (req, res, next) => {
    res.status(404).json({ error: 'PAGE NOT FOUND IN CHAT APP' });
  };