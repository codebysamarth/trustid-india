import { expect } from "chai";
import { ethers } from "hardhat";
import { IssuerRegistry, CredentialStatusRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TrustID India - Smart Contract Registry Tests", function () {
  let issuerRegistry: IssuerRegistry;
  let statusRegistry: CredentialStatusRegistry;
  let owner: SignerWithAddress;
  let universityIssuer: SignerWithAddress;
  let unauthorizedIssuer: SignerWithAddress;
  let studentHolder: SignerWithAddress;
  let externalAttacker: SignerWithAddress;

  const testCredentialId = ethers.keccak256(ethers.toUtf8Bytes("VC-DEMO-IITB-1001"));
  const testCredentialId2 = ethers.keccak256(ethers.toUtf8Bytes("VC-DEMO-IITB-1002"));

  beforeEach(async function () {
    [owner, universityIssuer, unauthorizedIssuer, studentHolder, externalAttacker] =
      await ethers.getSigners();

    // Deploy IssuerRegistry
    const IssuerRegistryFactory = await ethers.getContractFactory("IssuerRegistry");
    issuerRegistry = await IssuerRegistryFactory.deploy();
    await issuerRegistry.waitForDeployment();

    // Deploy CredentialStatusRegistry
    const CredentialStatusRegistryFactory = await ethers.getContractFactory("CredentialStatusRegistry");
    statusRegistry = await CredentialStatusRegistryFactory.deploy(await issuerRegistry.getAddress());
    await statusRegistry.waitForDeployment();
  });

  describe("IssuerRegistry Tests", function () {
    it("should allow registry governor to register and authorize an institution", async function () {
      await expect(
        issuerRegistry.registerIssuer(
          universityIssuer.address,
          "Indian Institute of Technology Bombay — DEMO",
          "https://www.iitb.ac.in/demo",
          true
        )
      )
        .to.emit(issuerRegistry, "IssuerRegistered")
        .withArgs(
          universityIssuer.address,
          "Indian Institute of Technology Bombay — DEMO",
          "https://www.iitb.ac.in/demo",
          true,
          owner.address,
          (ts: any) => typeof ts === "bigint"
        );

      const isAuthorized = await issuerRegistry.isIssuerAuthorized(universityIssuer.address);
      expect(isAuthorized).to.be.true;

      const profile = await issuerRegistry.getIssuer(universityIssuer.address);
      expect(profile.name).to.equal("Indian Institute of Technology Bombay — DEMO");
      expect(profile.isAuthorized).to.be.true;
      expect(profile.isRegistered).to.be.true;
    });

    it("should prevent duplicate issuer registration", async function () {
      await issuerRegistry.registerIssuer(
        universityIssuer.address,
        "IIT Bombay",
        "https://iitb.ac.in",
        true
      );

      await expect(
        issuerRegistry.registerIssuer(
          universityIssuer.address,
          "IIT Bombay Second",
          "https://iitb.ac.in",
          true
        )
      ).to.be.revertedWith("IssuerRegistry: Issuer already registered");
    });

    it("should reject invalid zero address and empty names", async function () {
      await expect(
        issuerRegistry.registerIssuer(ethers.ZeroAddress, "Valid Name", "", true)
      ).to.be.revertedWith("IssuerRegistry: Invalid zero address");

      await expect(
        issuerRegistry.registerIssuer(universityIssuer.address, "", "", true)
      ).to.be.revertedWith("IssuerRegistry: Issuer name cannot be empty");
    });

    it("should allow governor to toggle issuer authorization status", async function () {
      await issuerRegistry.registerIssuer(
        universityIssuer.address,
        "IIT Bombay",
        "https://iitb.ac.in",
        true
      );

      expect(await issuerRegistry.isIssuerAuthorized(universityIssuer.address)).to.be.true;

      // Revoke authorization
      await expect(issuerRegistry.setIssuerAuthorization(universityIssuer.address, false))
        .to.emit(issuerRegistry, "IssuerAuthorizationChanged")
        .withArgs(universityIssuer.address, false, owner.address, (ts: any) => typeof ts === "bigint");

      expect(await issuerRegistry.isIssuerAuthorized(universityIssuer.address)).to.be.false;

      // Re-enable authorization
      await issuerRegistry.setIssuerAuthorization(universityIssuer.address, true);
      expect(await issuerRegistry.isIssuerAuthorized(universityIssuer.address)).to.be.true;
    });

    it("should prevent non-governor accounts from registering or altering issuers", async function () {
      await expect(
        issuerRegistry
          .connect(externalAttacker)
          .registerIssuer(externalAttacker.address, "Rogue University", "", true)
      ).to.be.revertedWithCustomError(issuerRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("CredentialStatusRegistry Tests", function () {
    beforeEach(async function () {
      // Register universityIssuer as authorized
      await issuerRegistry.registerIssuer(
        universityIssuer.address,
        "IIT Bombay — DEMO",
        "https://iitb.ac.in",
        true
      );
    });

    it("should reject credential registration from unauthorized issuers", async function () {
      await expect(
        statusRegistry.connect(unauthorizedIssuer).registerCredential(testCredentialId)
      ).to.be.revertedWith("CredentialStatusRegistry: Caller is not an authorized issuer");
    });

    it("should allow an authorized issuer to register a credential identifier", async function () {
      await expect(statusRegistry.connect(universityIssuer).registerCredential(testCredentialId))
        .to.emit(statusRegistry, "CredentialRegistered")
        .withArgs(
          testCredentialId,
          universityIssuer.address,
          (ts: any) => typeof ts === "bigint",
          (bn: any) => typeof bn === "bigint"
        );

      const status = await statusRegistry.getCredentialStatus(testCredentialId);
      expect(status.isRegistered).to.be.true;
      expect(status.isRevoked).to.be.false;
      expect(status.isIssuerStillAuthorized).to.be.true;
      expect(status.issuer).to.equal(universityIssuer.address);

      expect(await statusRegistry.isCredentialValid(testCredentialId)).to.be.true;
    });

    it("should prevent duplicate credential registrations", async function () {
      await statusRegistry.connect(universityIssuer).registerCredential(testCredentialId);

      await expect(
        statusRegistry.connect(universityIssuer).registerCredential(testCredentialId)
      ).to.be.revertedWith("CredentialStatusRegistry: Credential ID already registered");
    });

    it("should allow the issuing university to revoke their credential", async function () {
      await statusRegistry.connect(universityIssuer).registerCredential(testCredentialId);

      await expect(
        statusRegistry
          .connect(universityIssuer)
          .revokeCredential(testCredentialId, "Degree revoked due to academic misconduct")
      )
        .to.emit(statusRegistry, "CredentialRevoked")
        .withArgs(
          testCredentialId,
          universityIssuer.address,
          universityIssuer.address,
          (ts: any) => typeof ts === "bigint",
          "Degree revoked due to academic misconduct"
        );

      const status = await statusRegistry.getCredentialStatus(testCredentialId);
      expect(status.isRevoked).to.be.true;
      expect(status.reason).to.equal("Degree revoked due to academic misconduct");
      expect(await statusRegistry.isCredentialValid(testCredentialId)).to.be.false;
    });

    it("should strictly prevent unauthorized third parties from revoking a credential", async function () {
      await statusRegistry.connect(universityIssuer).registerCredential(testCredentialId);

      await expect(
        statusRegistry
          .connect(externalAttacker)
          .revokeCredential(testCredentialId, "Malicious attempt")
      ).to.be.revertedWith("CredentialStatusRegistry: Unauthorized. Only issuer or admin can revoke");

      const status = await statusRegistry.getCredentialStatus(testCredentialId);
      expect(status.isRevoked).to.be.false;
    });

    it("should allow contract governor to revoke under emergency powers", async function () {
      await statusRegistry.connect(universityIssuer).registerCredential(testCredentialId);

      await expect(
        statusRegistry.connect(owner).revokeCredential(testCredentialId, "Emergency registry intervention")
      )
        .to.emit(statusRegistry, "CredentialRevoked")
        .withArgs(
          testCredentialId,
          universityIssuer.address,
          owner.address,
          (ts: any) => typeof ts === "bigint",
          "Emergency registry intervention"
        );

      expect(await statusRegistry.isCredentialValid(testCredentialId)).to.be.false;
    });

    it("should invalidate credential if issuing university is de-authorized after issuance", async function () {
      await statusRegistry.connect(universityIssuer).registerCredential(testCredentialId);
      expect(await statusRegistry.isCredentialValid(testCredentialId)).to.be.true;

      // De-authorize university
      await issuerRegistry.setIssuerAuthorization(universityIssuer.address, false);

      const status = await statusRegistry.getCredentialStatus(testCredentialId);
      expect(status.isIssuerStillAuthorized).to.be.false;
      expect(await statusRegistry.isCredentialValid(testCredentialId)).to.be.false;
    });
  });
});
