import Fastify, { FastifyInstance, FastifyBaseLogger } from 'fastify';


class Server {
    private server: FastifyInstance;
    log: FastifyBaseLogger;

    constructor() {
        this.server = Fastify({
            logger: true,
        });
        this.log = this.server.log;
        this.init();
    }

    public async start(port: number) {
        try {
            await this.server.listen({ port, host: '0.0.0.0' });
        } catch (err) {
            this.server.log.error(err);
            process.exit(1);
        }
    }

    private async init() {
        this.server.get('/healthcheck', async (_, reply) => {
            return reply.send('OK');
        });
    }


}

export default Server;