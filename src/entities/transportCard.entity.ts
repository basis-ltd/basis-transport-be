import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '.';
import { User } from './user.entity';
import { UUID } from '../types';

@Entity('transport_cards')
export class TransportCard extends AbstractEntity {
  // NAME
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string;

  // CARD NO
  @Column({
    name: 'card_no',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  cardNo: string;

  // USER ID
  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: false,
  })
  userId: UUID;

  /**
   * RELATIONS
   */

  // USER
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
