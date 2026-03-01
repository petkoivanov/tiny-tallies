export const ADDITION_SUBTRACTION_STANDARDS = {
  // Grade 1: Operations & Algebraic Thinking
  '1.OA.A.1':
    'Use addition and subtraction within 20 to solve word problems',
  '1.OA.A.2':
    'Solve word problems that call for addition of three whole numbers whose sum is less than or equal to 20',
  '1.OA.B.3':
    'Apply properties of operations as strategies to add and subtract',
  '1.OA.B.4': 'Understand subtraction as an unknown-addend problem',
  '1.OA.C.5': 'Relate counting to addition and subtraction',
  '1.OA.C.6':
    'Add and subtract within 20, demonstrating fluency within 10',
  '1.OA.D.7': 'Understand the meaning of the equal sign',
  '1.OA.D.8':
    'Determine the unknown whole number in an addition or subtraction equation',

  // Grade 1: Number & Operations in Base Ten
  '1.NBT.C.4':
    'Add within 100 using concrete models, drawings, and strategies based on place value',
  '1.NBT.C.5':
    'Given a two-digit number, mentally find 10 more or 10 less',
  '1.NBT.C.6':
    'Subtract multiples of 10 in the range 10-90 from multiples of 10',

  // Grade 2: Number & Operations in Base Ten
  '2.NBT.B.5': 'Fluently add and subtract within 100',
  '2.NBT.B.6':
    'Add up to four two-digit numbers using strategies based on place value',
  '2.NBT.B.7':
    'Add and subtract within 1000 using concrete models and strategies',
  '2.NBT.B.8':
    'Mentally add 10 or 100 to a given number 100-900, and mentally subtract 10 or 100',
  '2.NBT.B.9':
    'Explain why addition and subtraction strategies work using place value',

  // Grade 3: Number & Operations in Base Ten
  '3.NBT.A.2':
    'Fluently add and subtract within 1000 using strategies and algorithms based on place value',
} as const;

export type StandardCode = keyof typeof ADDITION_SUBTRACTION_STANDARDS;
