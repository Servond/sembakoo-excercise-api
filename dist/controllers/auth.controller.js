"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationLinkController = verificationLinkController;
exports.verifyController = verifyController;
const auth_service_1 = require("../services/auth.service");
async function verificationLinkController(req, res, next) {
    try {
        const { email } = req.body;
        await (0, auth_service_1.verificationLinkService)(email);
        res.json({
            message: "A verification link has been sent to your email",
        });
    }
    catch (err) {
        next(err);
    }
}
async function verifyController(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const { email } = req.user;
        const { firstname, lastname, password } = req.body;
        await (0, auth_service_1.verifyService)(token, {
            email,
            firstname,
            lastname,
            password,
        });
        res.json({
            message: "Your account has been verified",
        });
    }
    catch (err) {
        next(err);
    }
}
