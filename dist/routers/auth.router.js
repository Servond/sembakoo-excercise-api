"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authRouter = (0, express_1.Router)();
authRouter.post("/verification-link", auth_controller_1.verificationLinkController);
authRouter.post("/verify", auth_middleware_1.authMiddleware, auth_controller_1.verifyController);
exports.default = authRouter;
