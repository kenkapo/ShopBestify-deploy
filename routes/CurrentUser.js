const express = require('express');
const {saveCurrentUser, fetchCurrentUser, deleteCurrentUser}=require("../controller/CurrentUser");
const router = express.Router();
//  /categories is already added in base path
router.post('/',saveCurrentUser).get("/",fetchCurrentUser).delete("/",deleteCurrentUser);

exports.router = router;
 