/**
 * Simple Test Code for TypeScript Editor
 * This code should work without any compilation errors
 */

function main(): string {
  console.log('Hello, TypeScript!');
  
  const message: string = 'TypeScript is working!';
  console.log(message);
  
  return 'Execution completed successfully';
}

// Call main function and log the result
const result: string = main();
console.log('Result:', result);

// Test some TypeScript features
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'Test User',
  age: 25
};

console.log('User:', user);
