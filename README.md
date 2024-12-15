A Snake cube solver program written using NodeJS.
This uses simple brute force algorithm to generate all possible arrangements for every piece and validates every arrangenet if it's a solution.

Though the algorithm can be optimized further, but as of now it serves the purpose.
A 3x3 solution is generated very quickly but for 4x4 and higher it will take a while for all the computation to happen.
Adding any console.log statements will slow down the execution so much that with it, I let the program run for 5-10mins still not reaching any solution, and by removing them, I was able to generate 4x4 solution in ~47 seconds.

You need to modify inputSnake and gridSize variables as per your need.
