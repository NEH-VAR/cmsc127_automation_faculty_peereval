import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EncryptedStringTransformer } from '../../crypto/transformers';

export enum MagicLinkPurpose {
  NOMINATION = 'NOMINATION',
  EVALUATION = 'EVALUATION',
}

@Entity('magic_links')
export class MagicLink {
  @PrimaryGeneratedColumn()
  token_id: number;

  @Column({ type: 'bytea', transformer: EncryptedStringTransformer })
  token_hash: string;

  @Column({ type: 'varchar', unique: true })
  token_lookup: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  user_id: number;

  @Column({
    type: 'enum',
    enum: MagicLinkPurpose,
  })
  purpose: MagicLinkPurpose;

  @Column({ type: 'int' })
  reference_id: number;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'boolean', default: false })
  is_used: boolean;
}