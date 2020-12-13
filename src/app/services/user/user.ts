import {Location} from './location';

export class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    history: Array<Location>;
}
