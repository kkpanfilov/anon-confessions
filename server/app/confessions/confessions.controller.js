import { prisma } from "../prisma.js"

/**
 * @description Get all confessions.
 * @function getConfessions
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ServerResponse} res - The outgoing HTTP response.
 */

export const getConfessions = async (req, res) => {
  const confessions = await prisma.confession.findMany();

  res.status(200).json(confessions);
}