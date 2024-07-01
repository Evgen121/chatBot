import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';

@Entity({ name: 'task_due' })
export class TaskDue {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 256, nullable: false })
	task: string;

	@Column({ type: 'timestamp with time zone', nullable: false })
	due: Date;

	@Column({ type: 'varchar', length: 128, nullable: true })
	repeats: string | null;

	@ManyToOne(() => Task, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'task', referencedColumnName: 'id' })
	taskObject: Task;
}
