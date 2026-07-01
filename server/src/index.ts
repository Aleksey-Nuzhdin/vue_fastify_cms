import { initEnv } from './configs/index'
import { startServer } from './server'

// Валидация критичных секретов ДО старта сервера (fail-fast).
initEnv()

void startServer()