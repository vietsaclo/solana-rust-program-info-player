use solana_program::msg;
use solana_program::program_error::ProgramError;

#[derive(Debug)]
pub enum HelloInstruction {
  UpdateScore,
  UpdateAge,
}

impl HelloInstruction {
  pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
    let (&tag, rest) = input
      .split_first()
      .ok_or(ProgramError::InvalidInstructionData)?;
    msg!("Rest: {:?}", rest);

    Ok(match tag {
      0 => HelloInstruction::UpdateScore,
      1 => HelloInstruction::UpdateAge,
      _ => return Err(ProgramError::InvalidInstructionData),
    })
  }
}
