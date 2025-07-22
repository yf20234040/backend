const token = jwt.sign({ userId: user.id, phone: user.phone }, process.env.JWT_SECRET, {
  expiresIn: '7d'
});