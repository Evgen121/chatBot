import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({})
export class LogMessage {
	constructor({
		url,
		httpStatus,
		method,
		headers,
		body,
		resBody,
		params,
		query,
		reqDateTime,
		success,
	}: any) {
		this.id = uuidv4();
		this.url = url;
		this.httpStatus = httpStatus;
		this.method = method;
		this.headers = headers;
		this.body = body;
		this.resBody = resBody;
		this.params = params;
		this.query = query;
		this.reqDateTime = reqDateTime;
		this.success = success;
	}

	@Prop({ default: uuidv4() })
	id: string;

	@Prop({})
	url: string;

	@Prop({})
	user: string;

	@Prop({})
	ip: string;

	@Prop({})
	origin: string;

	@Prop({})
	role: string;

	@Prop({})
	httpStatus: number;

	@Prop({})
	method: string;

	@Prop({})
	headers: string;

	@Prop({})
	body: string;

	@Prop({})
	resBody: string;

	@Prop({})
	params: string;

	@Prop({})
	query: string;

	@Prop({})
	reqDateTime: string;

	@Prop({})
	executionTime: number;

	@Prop({})
	success: boolean;
}

export const LogMessageSchema = SchemaFactory.createForClass(LogMessage);
export type LogMessageDocument = LogMessage & Document;
