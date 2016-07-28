
import {Server} from 'hapi';
import {RedisClient} from 'redis';

export interface Options {
  client: RedisClient;
  name: string;
}

function hapiRedis(server: Server, options: Options, next) {

  function defaultErrorHandler(err) {
    server.log(['redis', 'error'], err.message);
  }

  function initialErrorHandler(err) {
    next(err);
    options.client.end();
  }

  options.client.on('error', initialErrorHandler);

  options.client.on('ready', () => {
    server.log(['redis', 'info'], 'Redis Client connection created');
    options.client.removeListener('error', initialErrorHandler);
    options.client.on('error', defaultErrorHandler);
    next();
  });

  server.expose(options.name, options.client);
}

hapiRedis['attributes'] = {
  pkg: require('../package.json'),
  multiple: true
};

export default hapiRedis;
