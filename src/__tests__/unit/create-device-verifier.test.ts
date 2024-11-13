import { Buffer } from "buffer/";

import { createDeviceVerifier } from "../../cognito-srp-helper.js";
import * as utils from "../../utils.js";
import { deviceRandomPasswordBytes, deviceSaltBytes } from "../mocks/data.js";
import { mockDeviceVerifierFactory, mockInitiateAuthResponseWithNewDeviceFactory } from "../mocks/factories.js";
import { positiveInitiateAuthResponseWithNewDevice as positiveResponses } from "../test-cases/index.js";

describe("createDeviceVerifier", () => {
  describe("positive", () => {
    it("should create the correct device hash", () => {
      const response = mockInitiateAuthResponseWithNewDeviceFactory();

      // ensure randomBytes returns what we expect
      jest.spyOn(utils, "randomBytes").mockReturnValueOnce(Buffer.from(deviceRandomPasswordBytes, "hex"));
      jest.spyOn(utils, "randomBytes").mockReturnValueOnce(Buffer.from(deviceSaltBytes, "hex"));

      const { DeviceKey, DeviceGroupKey } = response.AuthenticationResult?.NewDeviceMetadata ?? {};
      if (!DeviceKey) throw Error("DeviceKey is undefined");
      if (!DeviceGroupKey) throw Error("DeviceGroupKey is undefined");

      const verifier = createDeviceVerifier(DeviceKey, DeviceGroupKey);
      const expected = mockDeviceVerifierFactory();
      expect(verifier).toEqual(expected);
    });

    it.each(Object.values(positiveResponses))(
      "should create a device verifier with the correct format: response %#",
      (response) => {
        const { DeviceKey, DeviceGroupKey } = response.AuthenticationResult?.NewDeviceMetadata ?? {};
        if (!DeviceKey) throw Error("DeviceKey is undefined");
        if (!DeviceGroupKey) throw Error("DeviceGroupKey is undefined");

        const verifier = createDeviceVerifier(DeviceKey, DeviceGroupKey);

        expect(verifier.DeviceRandomPassword).toMatch(/^[A-Za-z0-9+=/]+$/);
        expect(verifier.DeviceSecretVerifierConfig.PasswordVerifier).toMatch(/^[A-Za-z0-9+=/]+$/);
        expect(verifier.DeviceSecretVerifierConfig.Salt).toMatch(/^[A-Za-z0-9+=/]+$/);
      },
    );
  });
});
