import { DataSource } from 'typeorm';
import path from 'path'; // A path modul Node.js beépített része
import { User } from './entity/User';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: path.join(__dirname, '..', 'oktatasi-rendszer.sqlite'),
    synchronize: true,       
    logging: true,
    entities: [
    User, // Explicit hozzáadás
    path.join(__dirname, 'entity', '**', '*.{ts,js}')
],
    migrations: [path.join(__dirname, 'migration', '**', '*.{ts,js}')], 
    subscribers: [],
});