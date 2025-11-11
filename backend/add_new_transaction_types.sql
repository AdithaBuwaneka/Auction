-- Add new transaction types to the wallet_transactions table
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_transaction_type_check;

ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_transaction_type_check 
CHECK (transaction_type IN ('DEPOSIT', 'FREEZE', 'UNFREEZE', 'DEDUCT', 'REFUND', 'WITHDRAW', 'ADMIN_ADJUSTMENT', 'BUYER_PAYMENT', 'SELLER_PAYMENT', 'SYSTEM_FEE'));
