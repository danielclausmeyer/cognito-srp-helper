import { Buffer } from "buffer/";
import { BigInteger } from "jsbn";

import { createSrpSession } from "../../cognito-srp-helper.js";
import { AbortOnZeroASrpError, AbortOnZeroSrpError } from "../../errors.js";
import * as utils from "../../utils.js";
import { mockCredentialsFactory, mockSrpSessionFactory } from "../mocks/factories.js";
import { positiveCredentials, positiveTimestamps } from "../test-cases/index.js";

describe("createSrpSession", () => {
  describe("positive", () => {
    it("should create the correct SRP session for a hashed password", () => {
      // ensure randomBytes returns what we expect
      const { smallA } = mockSrpSessionFactory();
      jest.spyOn(utils, "randomBytes").mockReturnValueOnce(Buffer.from(smallA, "hex"));
      // Tue Feb 1 03:04:05 UTC 2000 in Unix timestamp
      jest.useFakeTimers().setSystemTime(new Date(949374245000));

      const { username, passwordHash, poolId } = mockCredentialsFactory();
      const session = createSrpSession(username, passwordHash, poolId);
      const expected = mockSrpSessionFactory();
      expect(session).toEqual(expected);

      jest.useRealTimers();
    });

    it("should create the correct SRP session for a unhashed password", () => {
      // ensure randomBytes returns what we expect
      const { smallA } = mockSrpSessionFactory();
      jest.spyOn(utils, "randomBytes").mockReturnValueOnce(Buffer.from(smallA, "hex"));
      // Tue Feb 1 03:04:05 UTC 2000 in Unix timestamp
      jest.useFakeTimers().setSystemTime(new Date(949374245000));

      const { username, password, poolId } = mockCredentialsFactory({ password: "Qwerty1!" });
      const session = createSrpSession(username, password, poolId, false);
      const expected = mockSrpSessionFactory({ password, isHashed: false });
      expect(session).toEqual(expected);

      jest.useRealTimers();
    });

    it.each(Object.values(positiveCredentials))(
      "should create a SRP session with the correct format: credentials %#",
      (credentials) => {
        const { username, passwordHash, poolId } = credentials;
        const session = createSrpSession(username, passwordHash, poolId);

        expect(session.username).toMatch(username);
        expect(session.password).toMatch(passwordHash);
        expect(session.poolIdAbbr).toMatch(poolId.split("_")[1]);
        expect(session.timestamp).toMatch(
          /(Sun|Mon|Tue|Wed|Thu|Fri|Sat){1} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec){1} [1-3]?[0-9] (2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9]) UTC [0-9]{1,4}/,
        );
        expect(session.smallA).toMatch(/^[A-Fa-f0-9]+$/);
        expect(session.largeA).toMatch(/^[A-Fa-f0-9]+$/);
      },
    );

    it.each(Object.values(positiveTimestamps))(
      "should create a timestamp with the correct format: epoch %#",
      (epoch) => {
        jest.useFakeTimers().setSystemTime(new Date(epoch));
        const { username, passwordHash, poolId } = mockCredentialsFactory();
        const { timestamp } = createSrpSession(username, passwordHash, poolId);
        expect(timestamp).toMatch(
          /(Sun|Mon|Tue|Wed|Thu|Fri|Sat){1} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec){1} [1-3]?[0-9] (2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9]) UTC [0-9]{1,4}/,
        );
        jest.useRealTimers();
      },
    );

    it("should not create the same SRP session on successive calls", () => {
      const { username, passwordHash, poolId } = mockCredentialsFactory();
      const sessionA = createSrpSession(username, passwordHash, poolId);
      const sessionB = createSrpSession(username, passwordHash, poolId);
      expect(sessionA).not.toEqual(sessionB);
    });
  });

  describe("negative", () => {
    it("should throw a AbortOnZeroASrpError if SRP A is 0", () => {
      const { username, passwordHash, poolId } = mockCredentialsFactory();

      // make sure our A = G % a ^ N calculation returns 0

      // First check if the parent AbortOnZeroSrpError is thrown
      jest.spyOn(BigInteger.prototype, "modPow").mockReturnValueOnce(new BigInteger("0", 16));
      expect(() => {
        createSrpSession(username, passwordHash, poolId);
      }).toThrow(AbortOnZeroSrpError);

      // Throw on single zero
      jest.spyOn(BigInteger.prototype, "modPow").mockReturnValueOnce(new BigInteger("0", 16));
      expect(() => {
        createSrpSession(username, passwordHash, poolId);
      }).toThrow(AbortOnZeroASrpError);

      // Throw on multiple zeros (because 0 = 000... in hexadecimal)
      jest.spyOn(BigInteger.prototype, "modPow").mockReturnValueOnce(new BigInteger("000000", 16));
      expect(() => {
        createSrpSession(username, passwordHash, poolId);
      }).toThrow(AbortOnZeroASrpError);
    });
  });
});
