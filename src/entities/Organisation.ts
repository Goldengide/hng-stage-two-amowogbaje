import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Length } from "class-validator";
import { User } from "./User";

@Entity()
export class Organisation {
  @PrimaryGeneratedColumn("uuid")
  orgId!: string;

  @Column()
  @Length(1, 100)
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToMany(() => User, user => user.organisations)
  users!: User[];
}
