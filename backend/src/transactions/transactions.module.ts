import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transactions.entity';
import { TransactionDetail } from './entities/transaction-details.entity';
import { Publication } from '../publications/publications.entity';
import { UserEntity } from '../users/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      TransactionDetail,
      Publication,
      UserEntity,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
