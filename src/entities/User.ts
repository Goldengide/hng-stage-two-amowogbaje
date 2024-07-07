// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, Unique } from "typeorm";
import { IsEmail, Length } from "class-validator";
import { Organisation } from "./Organisation";

@Entity()
@Unique(["userId", "email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  userId!: string;

  @Column()
  @Length(1, 100)
  firstName!: string;

  @Column()
  @Length(1, 100)
  lastName!: string;

  @Column()
  @IsEmail()
  email!: string;

  @Column()
  @Length(6, 100)
  password!: string;

  @Column({ nullable: true })
  phone!: string;

  @ManyToMany(() => Organisation, organisation => organisation.users, { cascade: true })
  @JoinTable()
  organisations!: Organisation[];
}