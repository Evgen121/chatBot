import { SubjectErrors } from './subject.errors';
import { ChatbotErrors } from './chatbot.errors';
import { UserErrors } from './user.errors';
import { LogErrors } from './log.errors';
import { ContentErrors } from './content.errors';
import { EmailErrors } from './email.errors';
import { FeedbackErrors } from './feedback.errors';
import { PromocodeErrors } from './promocode.errors';

export const ErrorMessages = {
	subject: SubjectErrors,
	chatbot: ChatbotErrors,
	user: UserErrors,
	log: LogErrors,
	content: ContentErrors,
	email: EmailErrors,
	feedback: FeedbackErrors,
	promocode: PromocodeErrors,
};
