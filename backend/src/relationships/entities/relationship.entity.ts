import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Nomination } from '../../nominations/entities/nomination.entity';

@Entity('relationships')
export class Relationship {
	@PrimaryColumn({ type: 'int' })
	relationship_id: number;

	@Column({ type: 'varchar', length: 255 })
	relationship_name: string;

	@OneToMany(() => Nomination, (nomination) => nomination.relationship)
	nominations: Nomination[];
}
