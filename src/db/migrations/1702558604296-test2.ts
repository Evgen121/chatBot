import { MigrationInterface, QueryRunner } from "typeorm";

export class Test21702558604296 implements MigrationInterface {
    name = 'Test21702558604296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instruction_url_entity" DROP CONSTRAINT "FK_ebed6d2771b7006598086efab5b"`);
        await queryRunner.query(`ALTER TABLE "ChatBot" ALTER COLUMN "expiryDate" SET DEFAULT Date(NOW() + INTERVAL '7 days')`);
        await queryRunner.query(`ALTER TABLE "instruction_url_entity" ADD CONSTRAINT "FK_ebed6d2771b7006598086efab5b" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instruction_url_entity" DROP CONSTRAINT "FK_ebed6d2771b7006598086efab5b"`);
        await queryRunner.query(`ALTER TABLE "ChatBot" ALTER COLUMN "expiryDate" SET DEFAULT date((now() + '7 days'))`);
        await queryRunner.query(`ALTER TABLE "instruction_url_entity" ADD CONSTRAINT "FK_ebed6d2771b7006598086efab5b" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
