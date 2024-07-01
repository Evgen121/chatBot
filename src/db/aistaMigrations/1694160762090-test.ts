import { MigrationInterface, QueryRunner } from 'typeorm';

export class Test1694160762090 implements MigrationInterface {
	name = 'Test1694160762090';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "ml_types" ADD "recaptcha_key" text`);
		await queryRunner.query(
			`ALTER TABLE "ml_types" ADD "recaptcha_secret" text`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "ml_types" DROP COLUMN "recaptcha_secret"`
		);
		await queryRunner.query(
			`ALTER TABLE "ml_types" DROP COLUMN "recaptcha_key"`
		);
	}
}
