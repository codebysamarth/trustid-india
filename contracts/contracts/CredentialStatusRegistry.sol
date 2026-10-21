// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IssuerRegistry.sol";

/**
 * @title CredentialStatusRegistry
 * @dev Manages revocation and validity state for Verifiable Credentials in TrustID India.
 *
 * Privacy Architecture:
 * - Credentials and student PII are stored strictly OFF-CHAIN (student wallet / local storage).
 * - Only an opaque cryptographic reference (`bytes32 credentialId`) is registered here.
 * - Credential status can be queried trustlessly in constant time O(1).
 */
contract CredentialStatusRegistry is Ownable {
    IssuerRegistry public immutable issuerRegistry;

    struct CredentialRecord {
        address issuer;
        bool isRevoked;
        bool isRegistered;
        uint256 registeredAt;
        uint256 revokedAt;
        string revocationReason;
    }

    // Mapping from unique credential identifier (hash / UUID bytes32) to its status record
    mapping(bytes32 => CredentialRecord) private _credentials;

    // Track credential identifiers registered by a specific issuer
    mapping(address => bytes32[]) private _issuerCredentials;

    // Global list of all registered credential IDs for auditability
    bytes32[] private _allCredentialIds;

    // Events for transparency and real-time dashboard listeners
    event CredentialRegistered(
        bytes32 indexed credentialId,
        address indexed issuer,
        uint256 registeredAt,
        uint256 blockNumber
    );

    event CredentialRevoked(
        bytes32 indexed credentialId,
        address indexed issuer,
        address indexed revokedBy,
        uint256 revokedAt,
        string reason
    );

    event CredentialUnrevoked(
        bytes32 indexed credentialId,
        address indexed issuer,
        address indexed unrevokedBy,
        uint256 unrevokedAt
    );

    modifier onlyAuthorizedIssuer() {
        require(
            issuerRegistry.isIssuerAuthorized(msg.sender),
            "CredentialStatusRegistry: Caller is not an authorized issuer"
        );
        _;
    }

    /**
     * @notice Constructor sets the IssuerRegistry dependency and contract owner.
     * @param _issuerRegistryAddress Address of the deployed IssuerRegistry contract.
     */
    constructor(address _issuerRegistryAddress) Ownable(msg.sender) {
        require(_issuerRegistryAddress != address(0), "CredentialStatusRegistry: Invalid issuer registry address");
        issuerRegistry = IssuerRegistry(_issuerRegistryAddress);
    }

    /**
     * @notice Registers a new verifiable credential identifier on-chain.
     * @dev Restricted to issuers authorized in IssuerRegistry.
     * @param credentialId Opaque 32-byte identifier (e.g. keccak256 of credential ID or hash).
     */
    function registerCredential(bytes32 credentialId) external onlyAuthorizedIssuer {
        require(credentialId != bytes32(0), "CredentialStatusRegistry: Invalid credential ID");
        require(!_credentials[credentialId].isRegistered, "CredentialStatusRegistry: Credential ID already registered");

        _credentials[credentialId] = CredentialRecord({
            issuer: msg.sender,
            isRevoked: false,
            isRegistered: true,
            registeredAt: block.timestamp,
            revokedAt: 0,
            revocationReason: ""
        });

        _issuerCredentials[msg.sender].push(credentialId);
        _allCredentialIds.push(credentialId);

        emit CredentialRegistered(credentialId, msg.sender, block.timestamp, block.number);
    }

    /**
     * @notice Revokes an active verifiable credential.
     * @dev Restricted to the original issuing institution or contract owner.
     * @param credentialId Opaque 32-byte identifier of the credential to revoke.
     * @param reason Human-readable administrative reason for revocation.
     */
    function revokeCredential(bytes32 credentialId, string calldata reason) external {
        require(_credentials[credentialId].isRegistered, "CredentialStatusRegistry: Credential not registered");
        require(!_credentials[credentialId].isRevoked, "CredentialStatusRegistry: Credential already revoked");

        // Only the original issuing institution or the contract governor may revoke
        require(
            msg.sender == _credentials[credentialId].issuer || msg.sender == owner(),
            "CredentialStatusRegistry: Unauthorized. Only issuer or admin can revoke"
        );

        _credentials[credentialId].isRevoked = true;
        _credentials[credentialId].revokedAt = block.timestamp;
        _credentials[credentialId].revocationReason = reason;

        emit CredentialRevoked(
            credentialId,
            _credentials[credentialId].issuer,
            msg.sender,
            block.timestamp,
            reason
        );
    }

    /**
     * @notice Administrative un-revocation (e.g., in case of administrative dispute resolution).
     * @dev Only the contract governor or original issuer can reinstate.
     * @param credentialId The credential identifier.
     */
    function unrevokeCredential(bytes32 credentialId) external {
        require(_credentials[credentialId].isRegistered, "CredentialStatusRegistry: Credential not registered");
        require(_credentials[credentialId].isRevoked, "CredentialStatusRegistry: Credential is not revoked");
        require(
            msg.sender == _credentials[credentialId].issuer || msg.sender == owner(),
            "CredentialStatusRegistry: Unauthorized. Only issuer or admin can reinstate"
        );

        _credentials[credentialId].isRevoked = false;
        _credentials[credentialId].revokedAt = 0;
        _credentials[credentialId].revocationReason = "";

        emit CredentialUnrevoked(credentialId, _credentials[credentialId].issuer, msg.sender, block.timestamp);
    }

    /**
     * @notice Comprehensive status lookup for verifiers.
     * @param credentialId Credential identifier.
     * @return isRegistered Whether credential was registered.
     * @return isRevoked Whether credential has been revoked.
     * @return isIssuerStillAuthorized Whether issuing university is still authorized.
     * @return issuer Address of the issuer.
     * @return registeredAt Issuance timestamp.
     * @return revokedAt Revocation timestamp.
     * @return reason Revocation reason string.
     */
    function getCredentialStatus(bytes32 credentialId)
        external
        view
        returns (
            bool isRegistered,
            bool isRevoked,
            bool isIssuerStillAuthorized,
            address issuer,
            uint256 registeredAt,
            uint256 revokedAt,
            string memory reason
        )
    {
        CredentialRecord memory rec = _credentials[credentialId];
        bool issuerAuth = false;
        if (rec.isRegistered) {
            issuerAuth = issuerRegistry.isIssuerAuthorized(rec.issuer);
        }

        return (
            rec.isRegistered,
            rec.isRevoked,
            issuerAuth,
            rec.issuer,
            rec.registeredAt,
            rec.revokedAt,
            rec.revocationReason
        );
    }

    /**
     * @notice Lightweight boolean check whether a credential is valid on-chain.
     * @param credentialId Credential identifier.
     * @return True if registered, not revoked, and issuer is currently authorized.
     */
    function isCredentialValid(bytes32 credentialId) external view returns (bool) {
        CredentialRecord memory rec = _credentials[credentialId];
        if (!rec.isRegistered || rec.isRevoked) {
            return false;
        }
        return issuerRegistry.isIssuerAuthorized(rec.issuer);
    }

    /**
     * @notice Returns total number of registered credentials across the network.
     */
    function getTotalCredentials() external view returns (uint256) {
        return _allCredentialIds.length;
    }

    /**
     * @notice Returns all credential IDs registered by a specific issuer address.
     * @param issuer Address of the issuer.
     */
    function getCredentialsByIssuer(address issuer) external view returns (bytes32[] memory) {
        return _issuerCredentials[issuer];
    }

    /**
     * @notice Returns all registered credential IDs.
     */
    function getAllCredentialIds() external view returns (bytes32[] memory) {
        return _allCredentialIds;
    }
}
