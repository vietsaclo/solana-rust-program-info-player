use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
  account_info::{next_account_info, AccountInfo},
  entrypoint,
  entrypoint::ProgramResult,
  msg,
  program_error::ProgramError,
  pubkey::Pubkey,
};

pub mod instruction;
use crate::instruction::HelloInstruction;

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
  // router for program
  pub route: u8,

  pub counter: u32,
  pub age: u32,
}

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
  program_id: &Pubkey, // Public key of the account the hello world program was loaded into
  accounts: &[AccountInfo], // The account to say hello to
  _instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
  msg!("Hello World Rust program entrypoint");
  let instruction = HelloInstruction::unpack(_instruction_data)?;
  msg!("Instruction {:?}", instruction);
  // Iterating accounts is safer than indexing
  let accounts_iter = &mut accounts.iter();

  // Get the account to say hello to
  let account = next_account_info(accounts_iter)?;

  let message = GreetingAccount::try_from_slice(_instruction_data).map_err(|err| {
    msg!("Receiving counter u32, {:?}", err);
    ProgramError::InvalidInstructionData
  })?;
  msg!("Message from front-end: {:?}", message);
  msg!("Counter from front-end: {}", message.counter);

  // The account must be owned by the program in order to modify its data
  if account.owner != program_id {
    msg!("Greeted account does not have the correct program id");
    return Err(ProgramError::IncorrectProgramId);
  }

  // Increment and store the number of times the account has been greeted
  let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;

  match instruction {
    HelloInstruction::UpdateScore => {
      greeting_account.counter += message.counter;
    }
    HelloInstruction::UpdateAge => {
      greeting_account.age = message.age;
    }
  }

  greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

  Ok(())
}
