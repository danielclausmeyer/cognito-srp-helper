import { wrapInitiateAuth } from "../../cognito-srp-helper.js";
import { InitiateAuthRequest } from "../../types.js";
import {
  mockAdminInitiateAuthRequestFactory,
  mockInitiateAuthRequestFactory,
  mockSrpSessionFactory,
} from "../mocks/factories.js";
import {
  positiveAdminInitiateAuthRequests as positiveAdminRequests,
  positiveInitiateAuthRequests as positiveRequests,
  positiveSrpSessions as positiveSessions,
} from "../test-cases/index.js";

describe("wrapInitiateAuth", () => {
  describe("positive", () => {
    it.each(Object.values(positiveSessions))("should create the correct InitiateAuthRequest: session %#", (session) => {
      const request = mockInitiateAuthRequestFactory();
      const srpRequest = wrapInitiateAuth(session, request);
      expect(srpRequest).toMatchObject<InitiateAuthRequest>({
        ...request,
        AuthParameters: {
          ...request.AuthParameters,
          SRP_A: session.largeA,
        },
      });
    });

    it.each(Object.values(positiveRequests))("should create the correct InitiateAuthRequest: request %#", (request) => {
      const session = mockSrpSessionFactory();
      const srpRequest = wrapInitiateAuth(session, request);
      expect(srpRequest).toMatchObject<InitiateAuthRequest>({
        ...request,
        AuthParameters: {
          ...request.AuthParameters,
          SRP_A: session.largeA,
        },
      });
    });

    it.each(Object.values(positiveSessions))(
      "should create the correct AdminInitiateAuthRequest: session %#",
      (session) => {
        const request = mockAdminInitiateAuthRequestFactory();
        const srpRequest = wrapInitiateAuth(session, request);
        expect(srpRequest).toMatchObject<InitiateAuthRequest>({
          ...request,
          AuthParameters: {
            ...request.AuthParameters,
            SRP_A: session.largeA,
          },
        });
      },
    );

    it.each(Object.values(positiveAdminRequests))(
      "should create the correct AdminInitiateAuthRequest: request %#",
      (request) => {
        const session = mockSrpSessionFactory();
        const srpRequest = wrapInitiateAuth(session, request);
        expect(srpRequest).toMatchObject<InitiateAuthRequest>({
          ...request,
          AuthParameters: {
            ...request.AuthParameters,
            SRP_A: session.largeA,
          },
        });
      },
    );
  });
});
