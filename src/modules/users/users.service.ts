import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from "bcryptjs";
import { UsersRepository } from 'src/shared/database/repositories/users.repositories';


@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    const existingUser = await this.usersRepository.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      throw new ConflictException('This email is already in use.');
    }

    const hashedPassword = await hash(password, 10);

    const user = this.usersRepository.create({
      data: {
        name,
        email,
        password: hashedPassword,
        categories: {
          createMany: {
            data: [
              // Income
              { name: "Salário", icon: "money", type: "INCOME" },
              { name: "Freelancer", icon: "money", type: "INCOME" },
              { name: "Outro", icon: "other", type: "INCOME" },
              // Expense
              { name: "Moradia", icon: "home", type: "EXPENSE" },
              { name: "Alimentação", icon: "food", type: "EXPENSE" },
              { name: "Educação", icon: "education", type: "EXPENSE" },
              { name: "Lazer", icon: "fun", type: "EXPENSE" },
              { name: "Mercado", icon: "grocery", type: "EXPENSE" },
              { name: "Roupas", icon: "clothes", type: "EXPENSE" },
              { name: "Transporte", icon: "car", type: "EXPENSE" },
              { name: "Viagem", icon: "travel", type: "EXPENSE" },
              { name: "Saúde", icon: "health", type: "EXPENSE" },
              { name: "Outro", icon: "other", type: "EXPENSE" },
            ],
          },
        },
      },
    });

    return user;
  }
}
