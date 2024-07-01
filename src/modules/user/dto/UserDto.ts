import { UserEntity } from '@db/entities';
import { RoleDto } from '@modules/role/dto/RoleDto';

export class UserDto {
	constructor(user: UserEntity) {
		this.id = user.id;
		this.username = user.username;
		this.surname = user.surname;
		this.email = user.email;
		this.resetToken = user.resetToken;
		this.registerDate = user.registerDate;
		this.subscriptionId = user.subscriptionId;
		this.subscriptionDueDate = user.subscriptionDueDate;
		this.requestsCount = user.requestsCount;
		this.snippetsCount = user.snippetsCount;
		this.snippetsDeletionDate = user.snippetsDeletionDate;
		this.isBlocked = user.isBlocked;
		this.isEmailConfirmed = user.isEmailConfirmed;
		this.contenterPoints = user.contenterPoints;
		this.authProvider = user.authProvider;
		this.emailConfirmCode = user.emailConfirmCode;
		this.role = user.role && new RoleDto(user.role);
	}
	id: number;
	username: string;
	surname: string;
	email: string;
	resetToken: string;
	registerDate: Date;
	subscriptionId: string;
	subscriptionDueDate: Date;
	requestsCount: number;
	snippetsCount: number;
	snippetsDeletionDate: Date;
	isBlocked: boolean;
	isEmailConfirmed: boolean;
	contenterPoints: number;
	authProvider: string;
	emailConfirmCode: string;
	role: RoleDto;
}
