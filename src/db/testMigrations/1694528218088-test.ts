import { MigrationInterface, QueryRunner } from 'typeorm';

export class Test1694528218088 implements MigrationInterface {
	name = 'Test1694528218088';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "User" ("id" SERIAL NOT NULL, "username" character varying(255) NOT NULL DEFAULT '', "surname" character varying(255) NOT NULL DEFAULT '', "email" character varying(255) NOT NULL DEFAULT '', "password" character varying(255) NOT NULL DEFAULT '', "salt" character varying(255) NOT NULL DEFAULT '', "resetToken" character varying, "registerDate" TIMESTAMP NOT NULL DEFAULT now(), "subscriptionId" character varying(255), "subscriptionDueDate" date, "requestsCount" integer NOT NULL DEFAULT '0', "snippetsCount" integer NOT NULL DEFAULT '0', "snippetsDeletionDate" date, "isBlocked" boolean NOT NULL DEFAULT false, "isEmailConfirmed" boolean NOT NULL DEFAULT false, "contenterPoints" real NOT NULL DEFAULT '80', "authProvider" character varying NOT NULL DEFAULT 'basic', "emailConfirmCode" character varying(10), "defaultRectokenId" integer, "roleId" integer, CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Script" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" text NOT NULL, CONSTRAINT "UQ_1bcf04b73418e8ef536a3a2b2d6" UNIQUE ("name"), CONSTRAINT "PK_5cd3ac6e4d2be16722c3d68545b" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "ChatBot" ("id" SERIAL NOT NULL, "creationDate" TIMESTAMP NOT NULL DEFAULT now(), "expiryDate" date NOT NULL DEFAULT Date(NOW() + INTERVAL '7 days'), "footer" character varying DEFAULT '<div style="font-size:12px; color:rgb(128,128,128); display:flex; justify-content: center; align-items: center; ">2023 © Powered by <a href="https://www.coderfy.com/" style="text-decoration:none; margin-left:5px;" target="_blank" rel="noopener noreferrer">Coderfy</a></div>', "tone" character varying DEFAULT '', "max" integer DEFAULT '10', "domain" character varying DEFAULT '', "button" character varying DEFAULT 'Custom ChatGPT Chatbot', "model" character varying DEFAULT '', "isActive" boolean NOT NULL DEFAULT true, "imageUrl" character varying(255) DEFAULT 'https://chatbot-generator-dev.coderfy.com/emailImages/logoCoderfy.png', "askMe" character varying DEFAULT 'Ask me about business', "name" character varying DEFAULT '', "chatBotName" character varying(255) DEFAULT 'ChatBot', "isVectorized" boolean NOT NULL DEFAULT false, "autocrawl" boolean NOT NULL DEFAULT false, "style" character varying DEFAULT 'Chess', "markdown" boolean DEFAULT true, "speech" boolean DEFAULT false, "search" boolean DEFAULT false, "chat" boolean DEFAULT true, "rtl" boolean DEFAULT false, "header" character varying DEFAULT '', "userId" integer, "scriptId" integer, "structureId" integer, "styleCssId" integer, CONSTRAINT "UQ_571de0ca33f78763b66023d8fcf" UNIQUE ("domain"), CONSTRAINT "UQ_77c3fe19d6c5824d8f5481fd67f" UNIQUE ("name"), CONSTRAINT "PK_a136c78ea028d336bfe1d780aaa" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "OptionalTitle" ("id" SERIAL NOT NULL, "title" character varying NOT NULL DEFAULT '', "text" character varying NOT NULL DEFAULT '', "size" integer DEFAULT '40', "contentId" uuid, CONSTRAINT "PK_1d6ebc91f505c7a12a3643b86f1" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Content" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "keywords" text DEFAULT '', "textType" character varying NOT NULL DEFAULT '', "size" integer DEFAULT '0', "topic" character varying NOT NULL DEFAULT '', "creationDate" TIMESTAMP NOT NULL DEFAULT now(), "text" text NOT NULL DEFAULT '', "userId" integer, "subjectId" uuid, CONSTRAINT "PK_7cb78a77f6c66cb6ea6f4316a5c" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Feedback" ("id" SERIAL NOT NULL, "name" character varying(255) DEFAULT '', "email" character varying(255) DEFAULT '', "subject" text NOT NULL DEFAULT '', "message" text NOT NULL DEFAULT '', "creationDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7ffea537e9c56670b65c2d62316" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Role" ("id" integer NOT NULL, "name" character varying NOT NULL DEFAULT 'user', "description" character varying(1000), CONSTRAINT "UQ_b852abd9e268a63287bc815aab6" UNIQUE ("name"), CONSTRAINT "PK_9309532197a7397548e341e5536" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Products" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL DEFAULT '', "description" character varying(1000) NOT NULL DEFAULT '', "productValue" integer NOT NULL DEFAULT '0', "metadata" json NOT NULL DEFAULT '{}', "category" character varying(500) NOT NULL DEFAULT 'chatbot', "priceInCentsUSD" integer NOT NULL DEFAULT '0', "isBest" boolean NOT NULL DEFAULT false, "imageURL" character varying(500) DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "bulletPoints" character varying(500) array NOT NULL DEFAULT '{}', CONSTRAINT "PK_36a07cc432789830e7fb7b58a83" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Leads" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "emailStatus" character varying, "firstName" character varying, "lastName" character varying, "fullName" character varying, "userSocial" character varying, "jobPosition" character varying, "country" character varying, "location" character varying, "industry" character varying, "addDate" TIMESTAMP, "companyName" character varying, "companyURL" character varying, "companySocial" character varying, "companySize" character varying, "companysCountry" character varying, "companyLocation" character varying, "state" character varying, "city" character varying, "companyIndustry" character varying, "hQPhone" character varying, "instructionUrl" character varying, "chatbotId" integer, CONSTRAINT "UQ_fa161de242a603acceaf80e9122" UNIQUE ("email"), CONSTRAINT "PK_7d3c7f33e293a2c7b0345b87ed0" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Rectokens" ("id" SERIAL NOT NULL, "masked_card" character varying(255) NOT NULL, "card_type" character varying(255) NOT NULL, "recToken" character varying(255) NOT NULL, "rectoken_lifetime" character varying(255) NOT NULL, "userId" integer, CONSTRAINT "PK_bb211369ad7c700d74ad527204b" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Payments" ("id" SERIAL NOT NULL, "order_id" character varying(255) NOT NULL, "order_time" character varying(255) NOT NULL, "payment_id" bigint NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "masked_card" character varying(255), "order_status" character varying(255), "card_type" character varying(255), "amount" character varying(255) NOT NULL, "actual_amount" character varying(255) NOT NULL, "currency" character varying(255), "actual_currency" character varying(255), "merchant_data" character varying(255), "userId" integer, "productId" integer, "rectokenId" integer, CONSTRAINT "PK_9b073dca030f9bf89e0937e0d27" PRIMARY KEY ("id", "order_id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Structure" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "imageUrl" character varying(255) DEFAULT 'https://chatbot-generator-dev.coderfy.com/emailImages/logoCoderfy.png', CONSTRAINT "UQ_9c917002e84fdd7109ea4f2fa94" UNIQUE ("name"), CONSTRAINT "PK_79df5be7db5e4d8776ff9987eeb" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "CssStyle" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "cssName" character varying, "properties" character varying NOT NULL, "imageUrl" character varying(255) DEFAULT '	https://chatbot-generator-dev.coderfy.com/static/media/default.5e24020eadb5a1a31d9d.png', "structureId" integer, CONSTRAINT "UQ_371faabd998dd9096ce20c8974c" UNIQUE ("cssName"), CONSTRAINT "PK_2c3426899a55ddb18463e193c43" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Subject" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createDate" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_ddab310d7548211c9d477c56b18" UNIQUE ("name"), CONSTRAINT "PK_ea85b796e06e827fbb699842d58" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "MessengerBot" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "botToken" character varying(255) NOT NULL, "messenger" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "chatbotId" integer, "userId" integer, CONSTRAINT "UQ_78da67c6e3588fd9825fccbe0cd" UNIQUE ("botToken"), CONSTRAINT "PK_121befcb03106c9d4c0e0710701" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "EmailTemplate" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "subject" character varying(400) NOT NULL DEFAULT 'no-reply', "template" text NOT NULL, CONSTRAINT "UQ_de5c97a60e47f9c12f670ad547a" UNIQUE ("name"), CONSTRAINT "PK_653e05053e86a303b0cad3ae3a6" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "User" ADD CONSTRAINT "FK_6dfac22b6a1755ccfc5f1274edf" FOREIGN KEY ("defaultRectokenId") REFERENCES "Rectokens"("id") ON DELETE SET NULL ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "User" ADD CONSTRAINT "FK_0b8c60cc29663fa5b9fb108edd7" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "ChatBot" ADD CONSTRAINT "FK_27f25e7a804c3b63ea1525c5cdc" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "ChatBot" ADD CONSTRAINT "FK_5c29c929d6731eb01e0fde88a39" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE SET NULL ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "ChatBot" ADD CONSTRAINT "FK_88f37573d70f88a4e8d999d2a60" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "ChatBot" ADD CONSTRAINT "FK_b68ebf2698544166405ceb63908" FOREIGN KEY ("styleCssId") REFERENCES "CssStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "OptionalTitle" ADD CONSTRAINT "FK_fa3640d8dbf12a1bd55e6b0acb4" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "Content" ADD CONSTRAINT "FK_0f2d545027587bcb541e26de032" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "Content" ADD CONSTRAINT "FK_617d0366253fdeb78f1b8902365" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "Leads" ADD CONSTRAINT "FK_95ddea5d339eeb6a829555fb774" FOREIGN KEY ("chatbotId") REFERENCES "ChatBot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Rectokens" ADD CONSTRAINT "FK_f36a9e642b245ab2b320ef34906" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" ADD CONSTRAINT "FK_61e80a03a53cf7b8a01aed56451" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" ADD CONSTRAINT "FK_f1fb14dd6d4b2994e1dde6bdaa7" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" ADD CONSTRAINT "FK_57b1d931ac38cd3adc418eed969" FOREIGN KEY ("rectokenId") REFERENCES "Rectokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "CssStyle" ADD CONSTRAINT "FK_52a8a7fc8b5dc9f5f5e268b46e0" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "Subject" ADD CONSTRAINT "FK_0f974e64101442326c8bc8255f2" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "MessengerBot" ADD CONSTRAINT "FK_a445092e38eaf2b15251dd73d64" FOREIGN KEY ("chatbotId") REFERENCES "ChatBot"("id") ON DELETE CASCADE ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "MessengerBot" ADD CONSTRAINT "FK_031a270d9331b1ab38e38d3be45" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "MessengerBot" DROP CONSTRAINT "FK_031a270d9331b1ab38e38d3be45"`
		);
		await queryRunner.query(
			`ALTER TABLE "MessengerBot" DROP CONSTRAINT "FK_a445092e38eaf2b15251dd73d64"`
		);
		await queryRunner.query(
			`ALTER TABLE "Subject" DROP CONSTRAINT "FK_0f974e64101442326c8bc8255f2"`
		);
		await queryRunner.query(
			`ALTER TABLE "CssStyle" DROP CONSTRAINT "FK_52a8a7fc8b5dc9f5f5e268b46e0"`
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" DROP CONSTRAINT "FK_57b1d931ac38cd3adc418eed969"`
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" DROP CONSTRAINT "FK_f1fb14dd6d4b2994e1dde6bdaa7"`
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" DROP CONSTRAINT "FK_61e80a03a53cf7b8a01aed56451"`
		);
		await queryRunner.query(
			`ALTER TABLE "Rectokens" DROP CONSTRAINT "FK_f36a9e642b245ab2b320ef34906"`
		);
		await queryRunner.query(
			`ALTER TABLE "Leads" DROP CONSTRAINT "FK_95ddea5d339eeb6a829555fb774"`
		);
		await queryRunner.query(
			`ALTER TABLE "Content" DROP CONSTRAINT "FK_617d0366253fdeb78f1b8902365"`
		);
		await queryRunner.query(
			`ALTER TABLE "Content" DROP CONSTRAINT "FK_0f2d545027587bcb541e26de032"`
		);
		await queryRunner.query(
			`ALTER TABLE "OptionalTitle" DROP CONSTRAINT "FK_fa3640d8dbf12a1bd55e6b0acb4"`
		);
		await queryRunner.query(
			`ALTER TABLE "ChatBot" DROP CONSTRAINT "FK_b68ebf2698544166405ceb63908"`
		);
		await queryRunner.query(
			`ALTER TABLE "ChatBot" DROP CONSTRAINT "FK_88f37573d70f88a4e8d999d2a60"`
		);
		await queryRunner.query(
			`ALTER TABLE "ChatBot" DROP CONSTRAINT "FK_5c29c929d6731eb01e0fde88a39"`
		);
		await queryRunner.query(
			`ALTER TABLE "ChatBot" DROP CONSTRAINT "FK_27f25e7a804c3b63ea1525c5cdc"`
		);
		await queryRunner.query(
			`ALTER TABLE "User" DROP CONSTRAINT "FK_0b8c60cc29663fa5b9fb108edd7"`
		);
		await queryRunner.query(
			`ALTER TABLE "User" DROP CONSTRAINT "FK_6dfac22b6a1755ccfc5f1274edf"`
		);
		await queryRunner.query(`DROP TABLE "EmailTemplate"`);
		await queryRunner.query(`DROP TABLE "MessengerBot"`);
		await queryRunner.query(`DROP TABLE "Subject"`);
		await queryRunner.query(`DROP TABLE "CssStyle"`);
		await queryRunner.query(`DROP TABLE "Structure"`);
		await queryRunner.query(`DROP TABLE "Payments"`);
		await queryRunner.query(`DROP TABLE "Rectokens"`);
		await queryRunner.query(`DROP TABLE "Leads"`);
		await queryRunner.query(`DROP TABLE "Products"`);
		await queryRunner.query(`DROP TABLE "Role"`);
		await queryRunner.query(`DROP TABLE "Feedback"`);
		await queryRunner.query(`DROP TABLE "Content"`);
		await queryRunner.query(`DROP TABLE "OptionalTitle"`);
		await queryRunner.query(`DROP TABLE "ChatBot"`);
		await queryRunner.query(`DROP TABLE "Script"`);
		await queryRunner.query(`DROP TABLE "User"`);
	}
}
