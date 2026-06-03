import morgan from 'morgan';
import { logger } from '@fems/shared';

const stream = {
  write: (message) => logger.info(message.trim()),
};

export default morgan('combined', { stream });
