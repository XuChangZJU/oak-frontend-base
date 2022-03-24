import { unset } from 'lodash';
import { buildSchema, analyzeEntities } from 'oak-domain/src/compiler/schemalBuilder';

process.env.COMPILING_BASE_DOMAIN = 'yes';
analyzeEntities(`${__dirname}/../node_modules/oak-domain/src/entities`);
unset(process.env, 'COMPILING_BASE_DOMAIN');
analyzeEntities(`${__dirname}/entities`);
buildSchema(`${__dirname}/app-domain`);