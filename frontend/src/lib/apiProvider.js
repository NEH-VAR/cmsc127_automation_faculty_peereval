import { api as realApi } from './api';
import { mockApi } from '../mocks/mockApi';
import { USE_MOCK } from './config';

export const apiProvider = USE_MOCK ? mockApi : realApi;
