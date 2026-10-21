// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IssuerRegistry
 * @dev Manages the authorized educational institutions and issuers for TrustID India.
 * Implements strict access controls, authorization state tracking, and auditing events.
 * Only accredited/authorized issuers can register verifiable credentials into the ecosystem.
 *
 * NOTE: Absolutely no student personal data (PII) is stored in this contract.
 */
contract IssuerRegistry is Ownable {
    struct Issuer {
        string name;
        string detailsUri; // Metadata URI or description (e.g. website, accreditation ref)
        bool isAuthorized;
        bool isRegistered;
        uint256 registeredAt;
        uint256 updatedAt;
    }

    // Mapping from issuer Ethereum address to their institutional profile
    mapping(address => Issuer) private _issuers;

    // Array of all registered issuer addresses for enumeration
    address[] private _issuerAddresses;

    // Events for off-chain indexing and audit transparency
    event IssuerRegistered(
        address indexed issuerAddress,
        string name,
        string detailsUri,
        bool isAuthorized,
        address indexed registeredBy,
        uint256 timestamp
    );

    event IssuerAuthorizationChanged(
        address indexed issuerAddress,
        bool isAuthorized,
        address indexed updatedBy,
        uint256 timestamp
    );

    event IssuerDetailsUpdated(
        address indexed issuerAddress,
        string name,
        string detailsUri,
        address indexed updatedBy,
        uint256 timestamp
    );

    /**
     * @notice Initializes the IssuerRegistry setting the deployer as the initial owner/governor.
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Registers a new educational institution as an issuer.
     * @dev Restricted to the registry governor (contract owner).
     * @param issuerAddress Ethereum address of the issuing university/entity.
     * @param name Official name of the university or credential issuer.
     * @param detailsUri Institutional website, accreditation identifier, or metadata link.
     * @param authorizeImmediately Whether the issuer is immediately authorized to issue credentials.
     */
    function registerIssuer(
        address issuerAddress,
        string calldata name,
        string calldata detailsUri,
        bool authorizeImmediately
    ) external onlyOwner {
        require(issuerAddress != address(0), "IssuerRegistry: Invalid zero address");
        require(bytes(name).length > 0, "IssuerRegistry: Issuer name cannot be empty");
        require(!_issuers[issuerAddress].isRegistered, "IssuerRegistry: Issuer already registered");

        _issuers[issuerAddress] = Issuer({
            name: name,
            detailsUri: detailsUri,
            isAuthorized: authorizeImmediately,
            isRegistered: true,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp
        });

        _issuerAddresses.push(issuerAddress);

        emit IssuerRegistered(
            issuerAddress,
            name,
            detailsUri,
            authorizeImmediately,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Updates authorization status (e.g., active, suspended, revoked).
     * @param issuerAddress Ethereum address of the issuer.
     * @param isAuthorized New authorization status.
     */
    function setIssuerAuthorization(
        address issuerAddress,
        bool isAuthorized
    ) external onlyOwner {
        require(_issuers[issuerAddress].isRegistered, "IssuerRegistry: Issuer not registered");

        _issuers[issuerAddress].isAuthorized = isAuthorized;
        _issuers[issuerAddress].updatedAt = block.timestamp;

        emit IssuerAuthorizationChanged(
            issuerAddress,
            isAuthorized,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Updates issuer profile details.
     * @param issuerAddress Ethereum address of the issuer.
     * @param newName Updated institutional name.
     * @param newDetailsUri Updated details URI.
     */
    function updateIssuerDetails(
        address issuerAddress,
        string calldata newName,
        string calldata newDetailsUri
    ) external onlyOwner {
        require(_issuers[issuerAddress].isRegistered, "IssuerRegistry: Issuer not registered");
        require(bytes(newName).length > 0, "IssuerRegistry: Issuer name cannot be empty");

        _issuers[issuerAddress].name = newName;
        _issuers[issuerAddress].detailsUri = newDetailsUri;
        _issuers[issuerAddress].updatedAt = block.timestamp;

        emit IssuerDetailsUpdated(
            issuerAddress,
            newName,
            newDetailsUri,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Checks whether an address is currently an authorized issuer.
     * @param issuerAddress Address to check.
     * @return True if registered and authorized, false otherwise.
     */
    function isIssuerAuthorized(address issuerAddress) external view returns (bool) {
        return _issuers[issuerAddress].isRegistered && _issuers[issuerAddress].isAuthorized;
    }

    /**
     * @notice Retrieves the full record of an issuer.
     * @param issuerAddress Address of the issuer.
     */
    function getIssuer(address issuerAddress)
        external
        view
        returns (
            string memory name,
            string memory detailsUri,
            bool isAuthorized,
            bool isRegistered,
            uint256 registeredAt,
            uint256 updatedAt
        )
    {
        require(_issuers[issuerAddress].isRegistered, "IssuerRegistry: Issuer not found");
        Issuer memory inst = _issuers[issuerAddress];
        return (
            inst.name,
            inst.detailsUri,
            inst.isAuthorized,
            inst.isRegistered,
            inst.registeredAt,
            inst.updatedAt
        );
    }

    /**
     * @notice Returns total number of registered issuers.
     */
    function getTotalIssuers() external view returns (uint256) {
        return _issuerAddresses.length;
    }

    /**
     * @notice Returns list of all registered issuer addresses.
     */
    function getAllIssuers() external view returns (address[] memory) {
        return _issuerAddresses;
    }
}
