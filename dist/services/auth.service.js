"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByEmail = getUserByEmail;
exports.verificationLinkService = verificationLinkService;
exports.verifyService = verifyService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = require("handlebars");
const jsonwebtoken_1 = require("jsonwebtoken");
const bcrypt_1 = require("bcrypt");
const registerToken_service_1 = require("./registerToken.service");
const env_config_1 = require("../configs/env.config");
const customError_1 = require("../utils/customError");
const nodemailer_1 = require("../helpers/nodemailer");
async function getUserByEmail(email) {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: {
                email,
            },
        });
        return user;
    }
    catch (err) {
        throw err;
    }
}
async function verificationLinkService(email) {
    const targetPath = path_1.default.join(__dirname, "../templates", "registration.hbs");
    try {
        const user = await getUserByEmail(email);
        if (user)
            throw (0, customError_1.createCustomError)(401, "User already exists");
        const payload = {
            email,
        };
        const token = (0, jsonwebtoken_1.sign)(payload, env_config_1.SECRET_KEY, { expiresIn: "5m" });
        await prisma_1.default.$transaction(async (tx) => {
            await tx.registerToken.create({
                data: {
                    token,
                },
            });
            const templateSrc = fs_1.default.readFileSync(targetPath, "utf-8");
            const compiledTemplate = (0, handlebars_1.compile)(templateSrc);
            const html = compiledTemplate({
                redirect_url: `${env_config_1.BASE_WEB_URL}/auth/verify?token=${token}`,
            });
            await nodemailer_1.transporter.sendMail({
                to: email,
                subject: "Registration",
                html,
            });
        });
    }
    catch (err) {
        throw err;
    }
}
async function verifyService(token, params) {
    try {
        const tokenExist = await (0, registerToken_service_1.getRegisterToken)(token);
        if (!tokenExist)
            throw (0, customError_1.createCustomError)(403, "Invalid Token");
        const user = await getUserByEmail(params.email);
        if (user)
            throw (0, customError_1.createCustomError)(401, "User already exists");
        const salt = (0, bcrypt_1.genSaltSync)(10);
        const hashedPassword = (0, bcrypt_1.hashSync)(params.password, salt);
        await prisma_1.default.$transaction(async (tx) => {
            await tx.user.create({
                data: Object.assign(Object.assign({}, params), { password: hashedPassword }),
            });
            await tx.registerToken.delete({
                where: {
                    token,
                },
            });
        });
    }
    catch (err) {
        throw err;
    }
}
