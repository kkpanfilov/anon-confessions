import express from "express";

import { getConfessions } from "./confessions.controller.js";

const router = express.Router();

router.route("/").get(getConfessions);

export default router;
