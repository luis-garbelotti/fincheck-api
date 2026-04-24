import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SigninDto } from './dto/signin.dto';
import { UsersRepository } from 'src/shared/database/repositories/users.repositories';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository, private readonly jwtService: JwtService) { }

  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;

    const user = await this.usersRepository.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  async signup(signupDto: SignupDto) {
    const { name, email, password } = signupDto;

    const existingUser = await this.usersRepository.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      throw new ConflictException('This email is already in use.');
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.usersRepository.create({
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

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  private generateAccessToken(userId: string) {
    return this.jwtService.signAsync({ sub: userId });
  }
}
