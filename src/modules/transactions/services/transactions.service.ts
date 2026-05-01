import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionsRepository } from 'src/shared/database/repositories/transactions.repositories';
import { ValidateBankAccountOwnershipService } from '../../bank-accounts/services/validate-bank-account-ownership.service';
import { ValidateCategoryOwnershipService } from '../../categories/services/validate-category-ownership.service';
import { ValidateTransactionOwnershipService } from './validate-transaction-ownership.service';
import { TransactionType } from '../entities/Transaction';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionRepository: TransactionsRepository,
    private readonly validateBankAccountOwnership: ValidateBankAccountOwnershipService,
    private readonly validateCategoryOwnership: ValidateCategoryOwnershipService,
    private readonly validateTransactionOwnership: ValidateTransactionOwnershipService,
  ) { }

  findAllByUserId(
    userId: string,
    filters: {
      month: number,
      year: number,
      bankAccountId?: string,
      type?: TransactionType
    }) {
    const { month, year, bankAccountId, type } = filters;

    const queryFilters = {
      where: {
        userId,
        type,
        date: {
          gte: new Date(Date.UTC(year, month)),
          lt: new Date(Date.UTC(year, month + 1)),
        },
      },
    };

    bankAccountId && (queryFilters['where']['bankAccountId'] = bankAccountId);

    console.log(queryFilters);

    return this.transactionRepository.findMany(queryFilters);
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { bankAccountId, categoryId, name, value, date, type } = createTransactionDto;

    await this.validateEntitiesOwnership({ userId, bankAccountId, categoryId });

    return this.transactionRepository.create({
      data: {
        userId,
        bankAccountId,
        categoryId,
        name,
        value,
        date,
        type,
      },
    });
  }

  async update(userId: string, transactionId: string, updateTransactionDto: UpdateTransactionDto) {
    const { bankAccountId, categoryId, name, value, date, type } = updateTransactionDto;

    await this.validateEntitiesOwnership({ userId, bankAccountId, categoryId, transactionId });

    return this.transactionRepository.update({
      where: {
        id: transactionId,
      },
      data: {
        bankAccountId,
        categoryId,
        name,
        value,
        date,
        type,
      },
    });
  }

  async remove(userId: string, transactionId: string) {
    await this.validateEntitiesOwnership({ userId, transactionId });

    await this.transactionRepository.delete({
      where: {
        id: transactionId,
      },
    });

    return null;
  }

  private validateEntitiesOwnership({
    userId,
    bankAccountId,
    categoryId,
    transactionId
  }: {
    userId: string,
    bankAccountId?: string,
    categoryId?: string,
    transactionId?: string
  }) {
    return Promise.all([
      transactionId && this.validateTransactionOwnership.validate(userId, transactionId),
      bankAccountId && this.validateBankAccountOwnership.validate(userId, bankAccountId),
      categoryId && this.validateCategoryOwnership.validate(userId, categoryId),
    ]);
  }
}
