import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { College } from '../../college/entities/college.entity';
import {
  EncryptedBufferTransformer,
  EncryptedStringTransformer,
} from '../../crypto/transformers';

export enum UserRole {
  FACULTY = 'Faculty',
  DEP_CHAIR = 'DepChair',
  DEAN = 'Dean',
  ADMIN = 'Admin',
}

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'bytea', transformer: EncryptedStringTransformer })
  full_name: string;

  @Column({ type: 'bytea', transformer: EncryptedStringTransformer })
  email: string;

  @Column({ type: 'varchar', unique: true })
  email_lookup: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.FACULTY,
  })
  role: UserRole;

  @Column({ type: 'bytea', nullable: true, transformer: EncryptedBufferTransformer })
  image: Buffer | null;

  @ManyToOne(() => College, (college) => college.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'college_id' })
  college: College | null;
  @Column({ type: 'int', nullable: true })
  college_id: number | null;
}