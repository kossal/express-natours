const express = require('express');

// Controller
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.postUser);

router
    .route('/:id')
    .get(userController.getUser)
    .put(userController.putUser)
    .patch(userController.patchUser)
    .delete(userController.deleteUser);

module.exports = router;
