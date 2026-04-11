export const gracefulShutdown = async ({ signal, server, prisma }) => {
	if (global.isShuttingDown) return;
	global.isShuttingDown = true;

	console.log(`${signal} received. Starting graceful shutdown...`);

	server.close(async serverCloseErr => {
		if (serverCloseErr) {
			console.error("HTTP server close error:", serverCloseErr);
		} else {
			console.log("HTTP server closed");
		}

		try {
			await prisma.$disconnect();
			console.log("Prisma disconnected");
			process.exit(serverCloseErr ? 1 : 0);
		} catch (prismaErr) {
			console.error("Prisma disconnect error:", prismaErr);
			process.exit(1);
		}
	});

	setTimeout(() => {
		console.error("Forced shutdown after timeout");
		process.exit(1);
	}, 10000).unref();
};
