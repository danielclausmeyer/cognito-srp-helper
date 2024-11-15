/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src/",
  testMatch: ["**/*.test.ts"],
  // // coverage
  // collectCoverage: true,
  // coverageDirectory: "__tests__/coverage/",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest"
    ],
  },
};
